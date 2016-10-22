function MySceneGraph(filename, scene) {
	this.loadedOk = null;

	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;

	//Scene
	this.sceneInfo = { root : "", axis_length : 0.0};

	//Views
	this.views = { default : "" , childs : [], defaultID : 0};
	this.cameraIndex = 0;

	//Ilumination
	this.illumination = { 	ambient : {r: 0.1, g: 0.1, b: 0.1, a: 1} ,
							background : {r: 0, g: 0, b: 0, a: 1},
							local : 0,
							doubleSided : 0};

	//Lights
	this.lightsIDs = [];
	this.lights = {};
	this.lightIndex = 0;
	
	//Textures
	this.textures = {};

	//Materials
	this.materials = {};

	//Transformations
	this.transformations = {};
	
	//Primitives
	this.primitives = {};

	//Components
	this.components = {};

	// File reading
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	console.log("Opening Scene:" + filename);
	this.reader.open('scenes/'+filename, this);
};

//Check Error
MySceneGraph.prototype.checkError=function(error){
	
	if (error != null) {
		this.onXMLError(error);
		return 1;
	}
};

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError=function (message){
	
	console.error("XML Loading Error: "+message);
	this.loadedOk=false;
};

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function(){

	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;

	// Here should go the calls for different functions to parse the various blocks
	if(this.checkError(this.parseScene(rootElement)))
		return;
	if(this.checkError(this.parseViews(rootElement)))
		return;
	if(this.checkError(this.parseIllumination(rootElement)))
		return;
	if(this.checkError(this.parseLights(rootElement)))
		return;
	if(this.checkError(this.parseTextures(rootElement)))
		return;
	if(this.checkError(this.parseMaterials(rootElement)))
		return;
	if(this.checkError(this.parseTransformations(rootElement)))
		return;
	if(this.checkError(this.parsePrimitives(rootElement)))
		return;
	if(this.checkError(this.parseComponents(rootElement)))
		return;

	this.createGraph();

	this.loadedOk=true;

	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	if(this.loadedOk)
		this.scene.onGraphLoaded();
};

/*
========================= SCENE =========================
*/
/* 	
	Function to parse Scene
	Parses the following attributes:
	root : ss - name of rootElement
	axis_length : ff - length of the scenes axis
*/
MySceneGraph.prototype.parseScene = function(rootElement){

	var elems = rootElement.getElementsByTagName('scene');

	if(elems == null || elems.length != 1)
		return "scene element is MISSING or more than one element";

	//Check if first element is scene
	var scene = elems[0];
	if(scene != rootElement.children[0])
		return "Expected 'scene' as first element but got : " + rootElement.children[0].nodeName;

	this.sceneInfo.root = this.reader.getString(scene,'root');
	this.sceneInfo.axis_length = this.reader.getFloat(scene,'axis_length');

	console.log("Root Id is : " + this.sceneInfo.root + ", Axis length is: " + this.sceneInfo.axis_length);
};

/*
========================= VIEWS =========================
*/
/* 	Function to parse Views
	Parses the following attributes:
	default : ss - defaultCameraID
	And the following elements:
	perspective
*/
MySceneGraph.prototype.parseViews = function(rootElement){

	var elems = rootElement.getElementsByTagName('views');

	if(elems == null || elems.length != 1)
		return "views element is MISSING or more than one element";

	//Check if second element is views
	var views = elems[0];
	if(views != rootElement.children[1])
		return "Expected 'views' as second element but got : " + rootElement.children[1].nodeName;
	
	this.views.default = this.reader.getString(views,'default');

	console.log("Default View is: " + this.views.default);

	var nNodes = views.children.length;

	for(var i = 0; i < nNodes; i++){

		var child = views.children[i];
		switch(child.tagName){
			case "perspective":
				this.parsePerspective(child);
				break;
		}
	}
};

/*	Function to parse the element: Prespective
	Parses the following attributes:
	near : ff
	far : ff
	angle : ff
	from : vector3
	to : vector3
*/
 MySceneGraph.prototype.parsePerspective = function(element){

	if(element == null)
		return;

	//Verify duplicated views
	for(var i = 0; i < this.views.childs.length; i++)
		if(this.views.childs[i].id === element.id)
			console.error("Duplicate id found : " + element.id);

	var from = element.getElementsByTagName("from")[0];
	var to = element.getElementsByTagName("to")[0];

	var view = {
		id : element.id,
		near : this.reader.getFloat(element, "near") || 0.0,
		far : this.reader.getFloat(element, "far") || 0.0,
		angle : this.reader.getFloat(element, "angle") || 0.0,
		from : this.getVectorXYZ(from),
		to :  this.getVectorXYZ(to)
	};

	//deg2rad
	view.angle *= Math.PI/180;

	console.log("View Added: id : " + view.id + "near: " + view.near + " far: " + view.far + " angle: " + view.angle + " from: " + this.printVectorXYZ(view.from) + " to: " + this.printVectorXYZ(view.to));
	console.log("CAMERA: " + element.id + " default: " + this.views.default);
	
	if(element.id === this.views.default)
		this.views.defaultID = this.views.childs.length;

	this.views.childs.push(view);
};

/*
========================= ILLUMINATION =========================
*/
/* 	Function to parse illumination
	Parses the following elements:
	ambient : rgb
	background : rgb
*/
MySceneGraph.prototype.parseIllumination = function(rootElement){

	var elems = rootElement.getElementsByTagName('illumination');

	if(elems == null || elems.length != 1)
		return "Illumination element is MISSING or more than one element";
	
	//Check if third element is illumination
	var illum = elems[0];
	if(illum != rootElement.children[2])
		return "Expected 'illumination' as third element but got : " + rootElement.children[2].nodeName;

	this.illumination.doubleSided = this.reader.getInteger(illum, "doublesided");
	this.illumination.local = this.reader.getInteger(illum, "local");

	console.log("Illumination doubleSided: " + this.illumination.doubleSided  + " Illumination Local: " + this.illumination.local);

	var nNodes = illum.children.length;

	for(var i = 0; i < nNodes; i++){
		
		var child = illum.children[i];
		
		switch(child.tagName){
			case "ambient":
				this.illumination.ambient = this.getRGBAFromElement(child);
				break;
			case "background":
				this.illumination.background = this.getRGBAFromElement(child);
				break;
		}
	}

	console.log("Illumination background:" + this.printRGBA(this.illumination.background) + " , Illumination Ambient: " + this.printRGBA(this.illumination.ambient));
};

/*
========================= LIGHTS =========================
*/
/* 	Function to parse lights
	Parses the following elements:
	omni
	spot
*/
MySceneGraph.prototype.parseLights = function(rootElement){

	var elems = rootElement.getElementsByTagName('lights');

	if(elems == null || elems.length != 1)
		return "Lights element is MISSING or more than one element";

	//Check if forth element is lights
	var lights = elems[0];
	if(lights != rootElement.children[3])
		return "Expected 'lights' as forth element but got : " + rootElement.children[3].nodeName;

	//Check if there is at least one light
	if(lights.children.length < 1)
		return "Missing lights please specify at least one 'omni' and/or 'spot'";
	
	var nNodes = lights.children.length;

	for(var i = 0; i < nNodes; i++){
		
		var child = lights.children[i];
		
		switch(child.tagName){
			case "omni":
				this.parseOmniLights(child);
				break;
			case "spot":
				this.parseSpotLights(child);
				break;
		}
	}
};

/* 	Function to parse omni lights
	Parses the following attributes:
	id : ss - defaultOmniLightID
	enabled : tt - initial state
	location : vector4
	ambient : rgb
	diffuse : rgb
	specular : rgb
*/
MySceneGraph.prototype.parseOmniLights = function(element){

	if(element == null)
		return;

	//Verify duplicated lights
	if(this.lights[element.id] != null)
		console.error("Duplicate light id found : " + element.id);

	var enable = this.reader.getBoolean(element, "enabled") || 0;
	var omni = this.scene.lights[this.lightIndex];

	omni.disable();
	omni.setVisible(true);

	if(enable == 1)
		this.scene.lights[this.lightIndex].enable();

	var location = this.getVectorXYZW(element.getElementsByTagName("location")[0]);
	omni.setPosition(location.x,location.y,location.z,location.w);

	var ambient =  this.getRGBAFromElement(element.getElementsByTagName("ambient")[0]);
	omni.setAmbient(ambient.r,ambient.g,ambient.b,ambient.a);

	var diffuse = this.getRGBAFromElement(element.getElementsByTagName("diffuse")[0]);
	omni.setDiffuse(diffuse.r,diffuse.g,diffuse.b,diffuse.a);

	var specular = this.getRGBAFromElement(element.getElementsByTagName("specular")[0]);
	omni.setSpecular(specular.r,specular.g,specular.b,specular.a);

	//Check erro (TODO)
	console.log("Omni Added: id: " + omni.id + " enable : " + enable + " location: " + this.printVectorXYZ(location) + " ambient: " + this.printRGBA(ambient) + " diffuse: " + this.printRGBA(diffuse) + " specular: " + this.printRGBA(specular));

	this.lightsIDs.push(element.id);
	this.lights[element.id] = omni;
	this.lightIndex++;
	omni.update();
};

/* 	Function to parse spot lights
	Parses the following attributes:
	id : ss - defaultSpotLightID
	enabled : tt - initial state
	angle : ff - spot angle
	exponent : ff - spot light exponent
	target : vector3
	location : vector3
	ambient : rgb
	diffuse : rgb
	specular :	rgb
*/
MySceneGraph.prototype.parseSpotLights = function(element){

	if(element == null)
		return;

	//Verify duplicated lights
	if(this.lights[element.id] != null)
		console.error("Duplicate light id found : " + element.id);

	var spot = this.scene.lights[this.lightIndex];
	var enable = this.reader.getBoolean(element, "enabled") || 0;
	
	spot.disable();
	spot.setVisible(true);

	if(enable == 1)
		spot.enable();

	var angle = this.reader.getFloat(element,"angle") || 0.0;
	angle *= Math.PI/180;
	spot.setSpotCutOff(angle);

	var exponent = this.reader.getFloat(element,"exponent") || 0.0;
	spot.setSpotExponent(exponent);

	var target = this.getVectorXYZ(element.getElementsByTagName("target")[0]);
	var location = this.getVectorXYZ(element.getElementsByTagName("location")[0]);
	spot.setPosition(location.x,location.y,location.z,1);
	
	//Direction of the spot light = target - location
	var direction = {
		x : target.x - location.x,
		y : target.y - location.y,
		z : target.z - location.z
	}
	spot.setSpotDirection(direction.x,direction.y,direction.z);

	var ambient =  this.getRGBAFromElement(element.getElementsByTagName("ambient")[0]);
	spot.setAmbient(ambient.r,ambient.g,ambient.b,ambient.a);

	var diffuse = this.getRGBAFromElement(element.getElementsByTagName("diffuse")[0]);
	spot.setDiffuse(diffuse.r,diffuse.g,diffuse.b,diffuse.a);

	var specular = this.getRGBAFromElement(element.getElementsByTagName("specular")[0]);
	spot.setSpecular(specular.r,specular.g,specular.b,specular.a);

	//Check erro (TODO)
	console.log("Spot Added: id: " + spot.id + " enable : " + enable + " angle: " + angle + " exponent: " + exponent + " target: " +  this.printVectorXYZ(target) + " location: " + this.printVectorXYZ(location) + " ambient: " + this.printRGBA(ambient) + " diffuse: " + this.printRGBA(diffuse) + " specular: " + this.printRGBA(specular));

	this.lightsIDs.push(element.id);
	this.lights[element.id] = spot;
	this.lightIndex++;
	spot.update();
};

/*
========================= TEXTURES =========================
*/
/* 	Function to parse textures
	Parses the following attributes:
	id : ss
	file : ss
	length_s : ff
	length_t : ff
*/
MySceneGraph.prototype.parseTextures = function(rootElement){

	var elems = rootElement.getElementsByTagName('textures');

	if(elems == null || elems.length != 1)
		return "Textures element is MISSING or more than one element";

	var texts = elems[0];

	//Check if there is at least one texture
	if(texts.children.length < 1)
		return "There should be at least one texture!";

	//Check if fifth element is textures
	if(texts != rootElement.children[4])
		return "Expected 'textures' as fifth element but got : " + rootElement.children[4].nodeName;

	var nNodes = texts.children.length;

	for(var i = 0; i < nNodes; i++){

		var child = texts.children[i];
		var texture = {
			id : this.reader.getString(child,"id"),
			texFile : new CGFtexture(this.scene,this.reader.getString(child,"file")),
			length_s : this.reader.getFloat(child,"length_s"),
			length_t : this.reader.getFloat(child,"length_t")
		};
		console.log("Texture read with id: " + texture.id + " file: " + texture.texFile.path + " length_s: " + texture.length_s + " length_t: " + texture.length_t);

		//Verify duplicated textures
		if(this.textures[texture.id] != null){
			console.error("Duplicate texture id found : " + element.id);
		}

		this.textures[texture.id] = texture;
	}
};

/*
========================= MATERIALS =========================
*/
/* Function to parse materials
Parses the following elements:
	material
*/
MySceneGraph.prototype.parseMaterials = function(rootElement){

	var elems = rootElement.getElementsByTagName('materials');

	var materials = elems[0];

	if(materials == null || materials.parentNode != rootElement)
		return "Materials element is MISSING or more than one element and this block HAS to be prior to components block!";

	//Check if there is at least one material
	if(materials.children.length < 1)
		return "There should be at least 1 or more material blocks";

	//Check if sixth element is materials
	if(materials != rootElement.children[5])
		return "Expected 'materials' as sixth element but got : " + rootElement.children[5].nodeName;

	var nNodes = materials.children.length;

	for(var i = 0; i < nNodes; i++)
		this.parseMaterial(materials.children[i]);
};

/*	Function to parse material
	Parses the following attributes:
	emission : rgba
	ambient : rgba
	diffuse : rgba
	specular : rgba
	shininess : ff
*/
 MySceneGraph.prototype.parseMaterial = function(element){

	if(element == null)
		return;

	var emission = this.getRGBAFromElement(element.getElementsByTagName("emission")[0]);
	var ambient = this.getRGBAFromElement(element.getElementsByTagName("ambient")[0]);
	var diffuse = this.getRGBAFromElement(element.getElementsByTagName("diffuse")[0]);
	var specular = this.getRGBAFromElement(element.getElementsByTagName("specular")[0]);
	var shininess = this.reader.getFloat(element.getElementsByTagName("shininess")[0],"value");

	console.log("Material read with id: " + element.id + " emission: " + this.printRGBA(emission) + " ambient: " + this.printRGBA(ambient) + " diffuse: " + this.printRGBA(diffuse) + " specular: " + this.printRGBA(specular) + " shininess: " + shininess);

	var appearance = new CGFappearance(this.scene);
	appearance.setAmbient(ambient.r,ambient.g,ambient.b,ambient.a);
	appearance.setDiffuse(diffuse.r,diffuse.g,diffuse.b,diffuse.a);
	appearance.setEmission(emission.r,emission.g,emission.b,emission.a);
	appearance.setSpecular(specular.r,specular.g,specular.b,specular.a);
	appearance.setShininess(shininess);

	//Verify duplicated materials
	if(this.materials[element.id] != null){
		console.error("Duplicate material id found : " + element.id);
	}

	this.materials[element.id] = appearance;
};

/*	Change components material
*/
MySceneGraph.prototype.changeMaterials=function() {
	
	for(var key in this.components){
		var component = this.components[key];
		component.changeMaterial();
	}
};

/*
========================= TRANSFORMATIONS =========================
*/
/* 	Function to parse transformations
	Parses the following elements:
	transformation
*/
MySceneGraph.prototype.parseTransformations = function(rootElement){

	var elems = rootElement.getElementsByTagName('transformations');

	if(elems == null || elems.length != 1)
		return "Transformation element is MISSING or more than one element!";

	var transformations = elems[0];

	//Check if there is at least one transformation
	if(transformations.children.length < 1)
		return "There should be at least 1 or more transformation blocks";

	//Check if seventh element is materials
	if(transformations != rootElement.children[6])
		return "Expected 'transformations' as seventh element but got : " + rootElement.children[6].nodeName;

	var nNodes = transformations.children.length;

	for(var i = 0; i < nNodes; i++)
		this.parseTransformation(transformations.children[i]);
};

/*	Function to parse transformation
	Parses the following attributes:
*/
 MySceneGraph.prototype.parseTransformation = function(element){

	if(element == null)
		return;

	console.log("Reading transformation " + element.id);
	
	var trans = this.calculateTransformationMatrix(element);

	//Verify duplicated transformations
	if(this.transformations[element.id] != null)
		console.error("Duplicate transformation id found : " + element.id);

	this.transformations[element.id] = trans;
};

/*
	Computes the transformation matrix of a given transformation list
*/
MySceneGraph.prototype.calculateTransformationMatrix = function(element){

	var childs = element.children;

    var trans = mat4.create();

	for(i = 0; i < childs.length; i++){
		var child = childs[i];
		switch(child.tagName){
			case 'translate':
				var translation = this.getVectorXYZ(child);
				console.log("Read translation : " + this.printVectorXYZ(translation));
				mat4.translate(trans,trans,[translation.x,translation.y,translation.z]);
				break;
			case 'rotate':
				var rotate_axis = this.reader.getString(child,'axis');
				var rotate_angle = this.reader.getFloat(child,'angle') * Math.PI/180;
				console.log("Read rotatation with axis : " + rotate_axis + " angle : " + rotate_angle);
				switch(rotate_axis){
					case "x":
						mat4.rotate(trans,trans,rotate_angle,[1,0,0]);
						break;
					case "y":
						mat4.rotate(trans,trans,rotate_angle,[0,1,0]);
						break;
					case "z":
						mat4.rotate(trans,trans,rotate_angle,[0,0,1]);
						break;
				}
				break;
			case 'scale':
			 	var scaling = this.getVectorXYZ(child);
			 	console.log("Read scaling : " + this.printVectorXYZ(scaling));
			 	mat4.scale(trans,trans,[scaling.x,scaling.y,scaling.z]);
				break;
		}
	}
	return trans;
};

/*
========================= PRIMITIVES =========================
*/
/* 	Function to parse primitives
	Parses the following elements:
	primitive
*/
MySceneGraph.prototype.parsePrimitives = function(rootElement){

	var elems = rootElement.getElementsByTagName('primitives');

	if(elems == null || elems.length != 1)
		return "primitives element is MISSING or more than one element";

	var primitives = elems[0];

	//Check if there is at least one primitive
	if(primitives.children == null || primitives.children.length == 0)
		return "There must be one or more <primitive> inside <primitives>";

	//Check if eigth element is primitives
	if(primitives != rootElement.children[7])
		return "Expected 'primitives' as eigth element but got : " + rootElement.children[7].nodeName;

	var nnodes = primitives.children.length;
	var error;

	for(var i = 0; i < nnodes; i++){

		var child = primitives.children[i];

		if(child.tagName != "primitive")
			return "Parsing <primitive> instead got: <" + child.tagName + ">";

		error = this.parsePrimitive(child);
		
		if(error)
			return error;
	}
};

/* 	Function to parse primitive
	Parses the following attributes:
	id
	Parses the following elements:
	rectangle
	triangle
	cylinder
	sphere
	torus
*/
MySceneGraph.prototype.parsePrimitive = function(element){

	//Check if there is only one primitive type
	if(element.children == null || element.children.length != 1)
		return ("There must be ONLY ONE (<rectangle>,<triangle>,<cylinder>,<sphere>,<torus>) inside <primitive> : " + element.id);

	console.log("Parsing primitive:" + element.id);

	var child = element.children[0];
	var primitive;
	
	switch(child.tagName){
		case "rectangle":
		primitive = this.parseRectangle(child);
		break;
		case "triangle":
		primitive = this.parseTriangle(child);
		break;
		case "cylinder":
		primitive = this.parseCylinder(child);
		break;
		case "torus":
		primitive = this.parseTorus(child);
		break;
		case "sphere":
		primitive = this.parseSphere(child);
		break;
	}

	//Verify duplicated primitives
	if(this.primitives[element.id] != null)
		console.error("Duplicate primitive id found : " + element.id);

	this.primitives[element.id] = primitive;
};

/* 	Function to parse rectangle
	Parses the following attributes:
	x1 : ff
	y1 : ff
	x2 : ff
	y2 : ff
*/
MySceneGraph.prototype.parseRectangle = function(element){
	
	var rec = {
		x1:0,
		y1:0,
		x2:0,
		y2:0
	}

	rec.x1 = this.reader.getFloat(element,"x1");
	rec.x2 = this.reader.getFloat(element,"x2");
	rec.y1 = this.reader.getFloat(element,"y1");
	rec.y2 = this.reader.getFloat(element,"y2");
	
	console.log("New Rectangle X1:" + rec.x1, "Y1:" + rec.y1 + "X2:" + rec.x2 + "Y2:" + rec.y2 );
	
	return new Rectangle(this.scene, rec.x1, rec.x2, rec.y1, rec.y2);
};

/* 	Function to parse triangle
	Parses the following attributes:
	x1 : ff
	y1 : ff
	z1 : ff
	x2 : ff
	y2 : ff
	z2 : ff
	x3 : ff
	y3 : ff
	z3 : ff
*/
MySceneGraph.prototype.parseTriangle = function(element){
	
	var x1 = 0;
	var y1 = 0;
	var z1 = 0;
	var x2 = 0;
	var y2 = 0;
	var z2 = 0;
	var x3 = 0;
	var y3 = 0;
	var z3 = 0;

	x1 = this.reader.getFloat(element,"x1");
	y1 = this.reader.getFloat(element,"y1");
	z1 = this.reader.getFloat(element,"z1");
	x2 = this.reader.getFloat(element,"x2");
	y2 = this.reader.getFloat(element,"y2");
	z2 = this.reader.getFloat(element,"z2");
	x3 = this.reader.getFloat(element,"x3");
	y3 = this.reader.getFloat(element,"y3");
	z3 = this.reader.getFloat(element,"z3");

	console.log("New Triangle p1:" + x1 + "," + y1 + "," + z1 + ")" +
							" p2:" + x2 + "," + y2 + "," + z2 + ")" +
							" p3:" + x3 + "," + y3 + "," + z3 + ")");
	
	return new Triangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3);
};

/* 	Function to parse cylinder
	Parses the following attributes:
	base : ff
	top : ff
	height : ff
	slices : ii
	stacks : ii
*/
MySceneGraph.prototype.parseCylinder = function(element){
	
	var base = 0;
	var top = 0;
	var height = 0;
	var slices = 0;
	var stacks = 0;

	base = this.reader.getFloat(element,"base");
	top = this.reader.getFloat(element,"top");
	height = this.reader.getFloat(element,"height");
	slices = this.reader.getInteger(element,"slices");
	stacks = this.reader.getInteger(element,"stacks");

	console.log("New Cylinder base:" + base, " top:" + top + " height:" + height +  " slices:" + slices + " stacks:" + stacks);
	
	return new Cylinder(this.scene, base, top, height, slices, stacks);
};

/* 	Function to parse sphere
	Parses the following attributes:
	radius : ff
	slices : ii
	stacks : ii
*/
MySceneGraph.prototype.parseSphere = function(element){
	
	var sph = {
		radius: 0,
		slices: 0,
		stacks: 0,
	}

	sph.radius = this.reader.getFloat(element,"radius");
	sph.slices = this.reader.getInteger(element,"slices");
	sph.stacks = this.reader.getInteger(element,"stacks");

	console.log("New Sphere radius:" + sph.radius, " slices:" + sph.slices + " stacks:" + sph.stacks);

	return new Sphere(this.scene, sph.radius, sph.slices, sph.stacks);
};

/* 	Function to parse torus
	Parses the following attributes:
	inner : ff
	outer : ff
	slices : ii
	loops : ii
*/
MySceneGraph.prototype.parseTorus = function(element){
	
	var inner = 0;
	var outer = 0;
	var slices = 0;
	var loops = 0;

	inner = this.reader.getFloat(element,"inner");
	outer = this.reader.getFloat(element,"outer");
	slices = this.reader.getInteger(element,"slices");
	loops = this.reader.getInteger(element,"loops");

	console.log("New Torus inner:" + inner, "outer:" + outer + "slices:" + slices + "loops:" + loops);
	
	return new Torus(this.scene, inner, outer, slices, loops);
};

/*
========================= COMPONENTS =========================
*/
/* 	Function to parse components
	Parses the following elements:
	component
*/
MySceneGraph.prototype.parseComponents = function(rootElement){

	var elems = rootElement.getElementsByTagName('components');

	if(elems == null || elems.length != 1)
		return "components element is MISSING or more than one element";

	var components = elems[0];

	//Check if ninth element is components
	if(components != rootElement.children[8])
		return "Expected 'components' as ninth element but got : " + rootElement.children[8].nodeName;

	var nnodes = components.children.length;
	var error;

	for(var i = 0; i < nnodes; i++){

		var child = components.children[i];

		if(child.tagName != "component")
			return "Expecting <component> instead got: <" + child.tagName + ">";

		error = this.parseComponent(child);

		if(error)
			return error;
	}
};

/* 	Function to parse component
	Parses the following attributes:
	id : ss
	Parses the following elements:
	transformation :
	materials
	texture
	children
*/
MySceneGraph.prototype.parseComponent = function(element){

	console.log ("Parsing Component:" + element.id);

	var transformation = element.getElementsByTagName("transformation");

	//Check if there is only one transformation block
	if(transformation.length > 1 || transformation.length == 0)
		return "Only ONE <transformation> block is required";

	transformation = this.parseComponentTransformation(transformation[0]);

	var materials = element.getElementsByTagName("materials");

	//Check if there is only one material block
	if(materials == null || materials.length > 1 || materials.length == 0)
		return "Only ONE <materials> block is required";

	materials = this.parseComponentMaterial(materials[0]);

	//Check if there is at least one material
	if(materials.length == 0)
		return "Component need at least one material";

	var texture = element.getElementsByTagName("texture");

	//Check if there is only one texture block
	if(texture.length > 1 || texture.length == 0)
		return "Only ONE <texture> block is required";

	texture = texture[0].id;

	if(texture != "none" && texture != "inherit")
		texture = this.textures[texture];

	var comp = new Component(this.scene);
	comp.texture = texture;
	comp.materials = materials;
	comp.material = materials[0];
	comp.matrix = transformation;

	console.log("Component" + element.id + " materials:" + materials.length);
	
	//Children
	var childern = element.getElementsByTagName("children");

	//Check if there is only one children block
	if(childern.length > 1 || childern.length == 0 || childern == null)
		return "Only ONE <children> block is required";

	children = childern[0];

	var nnodes = children.children.length;

	//Check if there is at least one componentref or primitiveref
	if(nnodes < 1)
		return "Need at least one componentref OR primitiveref";

	for(var i = 0; i < nnodes; i++){

		var child = children.children[i];

		switch(child.tagName){

			case "componentref":
				comp.componentsID.push(child.id);
				break;
			case "primitiveref":
				comp.primitivesID.push(child.id);
				break;
		}
	}

	//Verify duplicated components
	if(this.components[element.id] != null)
		console.error("Duplicate component id found : " + element.id);

	this.components[element.id] = comp;
};

/* 	Function to parse transformation inside component
	Parses the following elements:
	transformation
*/
MySceneGraph.prototype.parseComponentTransformation = function(element){

	var transformRef = element.getElementsByTagName("transformationref");

	if(transformRef != null && transformRef.length == 1)
		return this.transformations[transformRef[0].id];
	else
		return this.calculateTransformationMatrix(element);
};

/* 	Function to parse materials inside component
	Parses the following elements:
	material
*/
MySceneGraph.prototype.parseComponentMaterial = function(element){

	var res = [];

	var nnodes = element.children.length;

	for(var i = 0; i < nnodes; i++){

		var child = element.children[i];
		var mat;
		
		if(child.id == "inherit")
			mat = "inherit";
		else
			mat = this.materials[child.id];

		if(mat == null)
			console.error("Material:" + child.id + " don't exist");
		else
			res.push(mat);
	}
	return res;
};

/*
================ GRAPH ================
*/
//Create Graph
MySceneGraph.prototype.createGraph = function(){

	if(this.components[this.sceneInfo.root] == null)
		console.error("Root must be an existing component! Root is : " + this.sceneInfo.root);

	for(var key in this.components){

		var component = this.components[key];
		component.id = key;
		console.log("Associating component ID: " + key);

		this.checkNodes(component);
	}
};

//Verify if components and primitives exist
MySceneGraph.prototype.checkNodes = function(component){

	for(var i = 0; i < component.componentsID.length; i++){
		
		var key = component.componentsID[i];

		if(this.components[key] == null)
			console.error("Component with id : " + key + " does not exist!");

		console.log("with component ID: " + key);
		
		component.components.push(this.components[key]);
	}

	for(var i = 0; i < component.primitivesID.length; i++){
		
		var key = component.primitivesID[i];

		if(this.primitives[key] == null)
			console.error("Primitive with id : " + key + " does not exist!");

		console.log("with primitive ID: " + key);

		component.primitives.push(this.primitives[key]);
	}
};

/*
================ UTILITIES ================
*/

//Returns a vectorXYZ from an Element
MySceneGraph.prototype.getVectorXYZ = function(element){

	var vector = {
		x : 0,
		y : 0,
		z : 0
	};

	if(element == null)
		return vector;

	vector.x = this.reader.getFloat(element, "x");
	vector.y = this.reader.getFloat(element, "y");
	vector.z = this.reader.getFloat(element, "z");
	
	return vector;
};

//Returns a string with the values of a XYZ vector
MySceneGraph.prototype.printVectorXYZ = function(vector){

	var string = "(X: " + vector.x + " , Y: " + vector.y  + " Z: " + vector.z + " )";
	
	return string;

};

//Gets a vectorXYZW from an Element
MySceneGraph.prototype.getVectorXYZW = function(element){

	var vector = {
		x : 0,
		y : 0,
		z : 0,
		w : 1.0
	};

	if(element == null)
		return vector;

	vector.x = this.reader.getFloat(element, "x");
	vector.y = this.reader.getFloat(element, "y");
	vector.z = this.reader.getFloat(element, "z");
	vector.w = this.reader.getFloat(element, "w");

	if(vector.w < 0.0 || vector.w > 1.0){
		console.warn("Value from " + element.parentNode.nodeName + " -> " + element.parentNode.id +  " -> " + element.nodeName + " -> " + " w is out of bounds [0.0 .... 1.0]");
	}

	return vector;
};

//Returns a string with the values of a XYZW vector
MySceneGraph.prototype.printVectorXYZW = function(vector){

	var string = "(X: " + vector.x + " , Y: " + vector.y  + " Z: " + vector.z + " W: " + vector.w + " )";
	
	return string;

};

//Gets RGBA values from an Element
MySceneGraph.prototype.getRGBAFromElement = function(element){

	var rgbaList = {
		r : 0,
		g : 0,
		b : 0,
		a : 1
	}
	
	if(element == null)
		return rgbaList;

	//Get R
	rgbaList.r = this.reader.getFloat(element, "r");
	if(rgbaList.r < 0.0 || rgbaList.r > 1.0){
		console.warn("Value from " + element.parentNode.nodeName + " -> " + element.parentNode.id +  " -> " + element.nodeName + " -> " + " r is out of bounds [0.0 .... 1.0]");
	}
	
	//Get G
	rgbaList.g = this.reader.getFloat(element, "g");
	if(rgbaList.g < 0.0 || rgbaList.g > 1.0){
		console.warn("Value from " + element.parentNode.nodeName + " -> " + element.parentNode.id +  " -> " + element.nodeName + " -> " + " g is out of bounds [0.0 .... 1.0]");
	}

	//Get B
	rgbaList.b = this.reader.getFloat(element, "b");
	if(rgbaList.b < 0.0 || rgbaList.b > 1.0){
		console.warn("Value from " + element.parentNode.nodeName + " -> " + element.parentNode.id +  " -> " + element.nodeName + " -> " + " b is out of bounds [0.0 .... 1.0]");
	}

	//Get A
	rgbaList.a = this.reader.getFloat(element, "a");
	if(rgbaList.a < 0.0 || rgbaList.a > 1.0){
		console.warn("Value from " + element.parentNode.nodeName + " -> " + element.parentNode.id +  " -> " + element.nodeName + " -> " + " a is out of bounds [0.0 .... 1.0]");
	}

	return rgbaList;
};

//Returns a string with the values of a RGBA structure
MySceneGraph.prototype.printRGBA = function(element){

	return ("(R: " + element.r + " , G: " + element.g + " , B: " + element.b + " , A: " + element.a + " )" );
};

/*	Returns a CGFCamera() using the defaultCameraID
*/
MySceneGraph.prototype.getCamera = function(){
	
	var view = this.views.childs[this.views.defaultID];

	if(this.views.defaultID < this.views.childs.length - 1 )
		this.views.defaultID++;
	else
		this.views.defaultID = 0;

	return new CGFcamera(view.angle, view.near, view.far, vec3.fromValues(view.from.x, view.from.y, view.from.z), vec3.fromValues(view.to.x, view.to.y, view.to.z));
};

MySceneGraph.prototype.getRoot = function(){
	
	return this.components[this.sceneInfo.root];
};