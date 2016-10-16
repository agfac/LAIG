
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the xml file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */

	 //Views
	this.cameras = [];

	//Lights
	this.lightIndex = 0;
	this.lightsOn = [];
	this.omniLights = [];
	this.spotLights = [];

	//Textures
	this.textures = [];

	//Materials
	this.materials = [];

	//Transformations
	this.transformations = [];

	//Primitives
	this.primitives = [];
	this.primitivesIDs = [];

	this.reader.open('scenes/'+filename, this);  
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("XML Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	// Here should go the calls for different functions to parse the various blocks
	var sceneError = this.parseScene(rootElement);
	if (sceneError != null) {
		this.onXMLError(sceneError);
		return;
	}

	var viewsError = this.parseViews(rootElement);
	if (viewsError != null) {
		this.onXMLError(viewsError);
		return;
	}

	var illuminationError = this.parseIllumination(rootElement);
	if (illuminationError != null) {
		this.onXMLError(illuminationError);
		return;
	}

	var lightsError = this.parseLights(rootElement);
	if (lightsError != null) {
		this.onXMLError(lightsError);
		return;
	}	
		
	var texturesError = this.parseTextures(rootElement);
	if (texturesError != null) {
		this.onXMLError(texturesError);
		return;
	}

	var materialsError = this.parseMaterials(rootElement);
	if (materialsError != null) {
		this.onXMLError(materialsError);
		return;
	}

	var transformationsError = this.parseTransformations(rootElement);
	if (transformationsError != null) {
		this.onXMLError(transformationsError);
		return;
	}

	var primitivesError = this.parsePrimitives(rootElement);
	if (primitivesError != null) {
		this.onXMLError(primitivesError);
		return;
	}

	this.loadedOk=true;
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseGlobalsExample= function(rootElement) {
	
	var elems =  rootElement.getElementsByTagName('globals');
	if (elems == null) {
		return "globals element is missing.";
	}

	if (elems.length != 1) {
		return "either zero or more than one 'globals' element found.";
	}

	// various examples of different types of access
	var globals = elems[0];
	//this.background = this.reader.getRGBA(globals, 'background');
	this.drawmode = this.reader.getItem(globals, 'drawmode', ["fill","line","point"]);
	this.cullface = this.reader.getItem(globals, 'cullface', ["back","front","none", "frontandback"]);
	this.cullorder = this.reader.getItem(globals, 'cullorder', ["ccw","cw"]);

	console.log("Globals read from file: {background=" + this.background + ", drawmode=" + this.drawmode + ", cullface=" + this.cullface + ", cullorder=" + this.cullorder + "}");

	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	};

};

MySceneGraph.prototype.parseScene = function(rootElement){

	if(rootElement == null)
		onXMLError("error on scene");

	var elems = rootElement.getElementsByTagName('scene');
	if(elems == null){
		onXMLError("scene element is missing.");
	}

	if(elems.length != 1){
		onXMLError("either zero or more than one 'scene' element found.");
	}

	var scene = elems[0];

	this.root = this.reader.getString(scene, 'root');
	this.axis_length = this.reader.getFloat(scene, 'axis_length');

	console.log("Scene read from file: root = " + this.root + ", axis_length = " + this.axis_length);
}

MySceneGraph.prototype.parseViews = function (rootElement){
	
	if(rootElement == null)
		onXMLError("error on views");

	var views = rootElement.getElementsByTagName('views');
	
	if(views == null || views.length == 0){
		onXMLError("views element is missing.");
	}

	var numberOfNodes = views[0].children.length;

	var view = views[0];

	this.default = this.reader.getString(view, 'default');

	for (var i = 0; i<numberOfNodes; i++){

		perspective = view.children[i];

		this.cameras[i*6] = this.reader.getString(perspective, 'id');
		this.cameras[i*6 + 1] = this.reader.getFloat(perspective, 'near');
		this.cameras[i*6 + 2] = this.reader.getFloat(perspective, 'far');
		this.cameras[i*6 + 3] = this.reader.getFloat(perspective, 'angle');
		console.log(this.cameras[i*6] + " " + this.cameras[i*6 + 1] + " " + this.cameras[i*6 + 2] + " " + this.cameras[i*6 + 3]);

		from = perspective.children[0];
		this.cameras[i*6 + 4] = vec3.fromValues(this.reader.getFloat(from, 'x'), this.reader.getFloat(from, 'y'), this.reader.getFloat(from, 'z'));

		to = perspective.children[1];
		this.cameras[i*6 + 5] = vec3.fromValues(this.reader.getFloat(to, 'x'), this.reader.getFloat(to, 'y'), this.reader.getFloat(to, 'z'));
	}

	var numberOfCameras = this.cameras.length/6;
	console.log("Numero de cameras: " + numberOfCameras);

	for(var i=0; i<numberOfCameras; i++){
		console.log("Perspective id = " + this.cameras[i*6] + " near = " + this.cameras[i*6 + 1] + " far = " + this.cameras[i*6 + 2] + " angle= " + this.cameras[i*6 + 3]);
		console.log("from x = " + this.cameras[i*6 + 4][0] + " y = " + this.cameras[i*6 + 4][1] + " z = " + this.cameras[i*6 + 4][2]);
		console.log("to x = " + this.cameras[i*6 + 5][0] + " y = " + this.cameras[i*6 + 5][1] + " z = " + this.cameras[i*6 + 5][2]);
	}
}

MySceneGraph.prototype.parseIllumination = function (rootElement) {
	
	if(rootElement == null)
		onXMLError("error on illumination");

	var elems = rootElement.getElementsByTagName('illumination');

	if(elems == null){
		onXMLError("illumination element is missing.");
	}

	if(elems.length != 1){
		onXMLError("either zero or more than one 'illumination' element found.");
	}

	var ambient = elems[0].getElementsByTagName('ambient');
	if(ambient == null){
		onXMLError("ambient element is missing.");
	}

	if(ambient.length != 1){
		onXMLError("either zero or more than one 'ambient' element found.");
	}

	var background = elems[0].getElementsByTagName('background');
	if(background == null){
		onXMLError("background element is missing.");
	}

	if(background.length != 1){
		onXMLError("either zero or more than one 'background' element found.");
	}

	elems = elems[0];
	this.doubleSided = this.reader.getBoolean(elems, 'doublesided');
	this.local = this.reader.getBoolean(elems,'local');

	console.log('Illumination read from file: doubleSided = ' + this.doubleSided + ", local = " + this.local);

	ambient = ambient[0];

	this.ambientR = this.reader.getFloat(ambient, 'r');
	this.ambientG = this.reader.getFloat(ambient, 'g');
	this.ambientB = this.reader.getFloat(ambient, 'b');
	this.ambientA = this.reader.getFloat(ambient, 'a');

	console.log('Illumination read from file: Ambient R = ' + this.ambientR + " Ambient G = " + this.ambientG + " Ambient B = " + this.ambientB + " Ambient A = " + this.ambientA);

	background = background[0];

	this.backgroundR = this.reader.getFloat(background, 'r');
	this.backgroundG = this.reader.getFloat(background, 'g');
	this.backgroundB = this.reader.getFloat(background, 'b');
	this.backgroundA = this.reader.getFloat(background, 'a');

	console.log('Illumination read from file: Background R = ' + this.backgroundR + " Background G = " + this.backgroundG + " Background B = " + this.backgroundB + " Background A = " + this.backgroundA);

}	

MySceneGraph.prototype.parseLights = function(rootElement){

	if(rootElement == null)
		onXMLError("error on lights");

	var lights = rootElement.getElementsByTagName('lights');

	if(lights == null | lights.length == 0){
		onXMLError("lights element is missing");
	}

	var light = lights[0];
	var numberOfNodes = light.children.length;

	if (numberOfNodes == 0){
		onXMLError("there are no ligths");
	}

	for(var i = 0; i < numberOfNodes; i++){
		var child = light.children[i];

		console.log(child.tagName);
		
		if(child.tagName == "omni")
			this.parseOmniLights(child);

		else if(child.tagName == "spot")
			this.parseSpotLights(child);
	}
};

MySceneGraph.prototype.parseOmniLights = function(rootElement){

	if(rootElement == null)
		onXMLError("error on an omni light");

	var omni = this.scene.lights[this.lightIndex];
	omni.disable();
	omni.setVisible(true);
	console.log("omni " + this.lightIndex);

	var id = this.reader.getString(rootElement, 'id');
	var enabled = this.reader.getBoolean(rootElement, 'enabled');

	console.log('Omni Light read from file: Id = ' + id + " Enabled = " + enabled);

	if(enabled == 1)
		omni.enable();

	this.lightsOn[this.lightIndex] = enabled;

	var location = rootElement.getElementsByTagName('location');
	if(location == null)
		onXMLError("location element on omni light is missing.")

	if(location.length != 1)
		onXMLError("either zero or more than one 'location' element found.")
	
	location = location[0];

	var locationX = this.reader.getFloat(location, 'x');
	var locationY = this.reader.getFloat(location, 'y');
	var locationZ = this.reader.getFloat(location, 'z');
	var locationW = this.reader.getFloat(location, 'w');
	
	omni.setPosition(locationX,locationY,locationZ,locationW);

	console.log('Omni Light read from file: Location X = ' + locationX + " Location Y = " + locationY + " Location Z = " + locationZ + " Location W = " + locationW);

	var ambient = rootElement.getElementsByTagName('ambient');
	if(ambient == null)
		onXMLError("ambient element on omni light is missing.")

	if(ambient.length != 1)
		onXMLError("either zero or more than one 'ambient' element found.")
	
	ambient = ambient[0];

	var ambientR = this.reader.getFloat(ambient, 'r');
	var ambientG = this.reader.getFloat(ambient, 'g');
	var ambientB = this.reader.getFloat(ambient, 'b');
	var ambientA = this.reader.getFloat(ambient, 'a');

	omni.setAmbient(ambientR,ambientG,ambientB,ambientA);

	console.log('Omni Light read from file: Ambient R = ' + ambientR + " Ambient G = " + ambientG + " Ambient B = " + ambientB + " Ambient A = " + ambientA);

	var diffuse = rootElement.getElementsByTagName('diffuse');
	if(diffuse == null)
		onXMLError("diffuse element on omni light is missing.")

	if(diffuse.length != 1)
		onXMLError("either zero or more than one 'diffuse' element found.")
	
	diffuse = diffuse[0];

	var diffuseR = this.reader.getFloat(diffuse, 'r');
	var diffuseG = this.reader.getFloat(diffuse, 'g');
	var diffuseB = this.reader.getFloat(diffuse, 'b');
	var diffuseA = this.reader.getFloat(diffuse, 'a');

	omni.setDiffuse(diffuseR,diffuseG,diffuseB,diffuseA);

	console.log('Omni Light read from file: Diffuse R = ' + diffuseR + " Diffuse G = " + diffuseG + " Diffuse B = " + diffuseB + " Diffuse A = " + diffuseA);

	var specular = rootElement.getElementsByTagName('specular');
	if(specular == null)
		onXMLError("specular element on omni light is missing.")

	if(specular.length != 1)
		onXMLError("either zero or more than one 'specular' element found.")
	
	specular = specular[0];

	var specularR = this.reader.getFloat(specular, 'r');
	var specularG = this.reader.getFloat(specular, 'g');
	var specularB = this.reader.getFloat(specular, 'b');
	var specularA = this.reader.getFloat(specular, 'a');

	omni.setSpecular(specularR,specularG,specularB,specularA);

	console.log('Omni Light read from file: Specular R = ' + specularR + " Specular G = " + specularG + " Specular B = " + specularB + " Specular A = " + specularA);

	this.omniLights[id] = omni;

	this.lightIndex++;
	omni.update();

};

MySceneGraph.prototype.parseSpotLights = function(rootElement){

	if(rootElement == null)
		onXMLError("error on an spot light");

	var spot = this.scene.lights[this.lightIndex];
	spot.disable();
	spot.setVisible(true);
	console.log("spot " + this.lightIndex);

	var id = this.reader.getString(rootElement, 'id');
	var enabled = this.reader.getBoolean(rootElement, 'enabled');
	var angle = this.reader.getFloat(rootElement, 'angle');
	var exponent = this.reader.getFloat(rootElement, 'exponent');

	spot.setSpotExponent(exponent);

	console.log('Spot Light read from file: Id = ' + id + " Enabled = " + enabled + " Angle = " + angle + " Exponent = " + exponent);

	if(enabled == 1)
		spot.enable();

	this.lightsOn[this.lightIndex] = enabled;

	var target = rootElement.getElementsByTagName('target');
	if(target == null)
		onXMLError("target element on spot light is missing.")

	if(target.length != 1)
		onXMLError("either zero or more than one 'target' element found.")
	
	target = target[0];

	var targetX = this.reader.getFloat(target, 'x');
	var targetY = this.reader.getFloat(target, 'y');
	var targetZ = this.reader.getFloat(target, 'z');
	
	console.log('Spot Light read from file: Target X = ' + targetX + " Target Y = " + targetY + " Target Z = " + targetZ);

	var location = rootElement.getElementsByTagName('location');
	if(location == null)
		onXMLError("location element on spot light is missing.")

	if(location.length != 1)
		onXMLError("either zero or more than one 'location' element found.")
	
	location = location[0];

	var locationX = this.reader.getFloat(location, 'x');
	var locationY = this.reader.getFloat(location, 'y');
	var locationZ = this.reader.getFloat(location, 'z');

	console.log('Spot Light read from file: Location X = ' + locationX + " Location Y = " + locationY + " Location Z = " + locationZ);
	
	var directionX = targetX - locationX;
	var directionY = targetY - locationY;
	var directionZ = targetZ - locationZ;

	spot.setSpotDirection(directionX, directionY, directionZ);

	var ambient = rootElement.getElementsByTagName('ambient');
	if(ambient == null)
		onXMLError("ambient element on spot light is missing.")

	if(ambient.length != 1)
		onXMLError("either zero or more than one 'ambient' element found.")
	
	ambient = ambient[0];

	var ambientR = this.reader.getFloat(ambient, 'r');
	var ambientG = this.reader.getFloat(ambient, 'g');
	var ambientB = this.reader.getFloat(ambient, 'b');
	var ambientA = this.reader.getFloat(ambient, 'a');

	spot.setAmbient(ambientR, ambientG, ambientB, ambientA);

	console.log('Spot Light read from file: Ambient R = ' + ambientR + " Ambient G = " + ambientG + " Ambient B = " + ambientB + " Ambient A = " + ambientA);

	var diffuse = rootElement.getElementsByTagName('diffuse');
	if(diffuse == null)
		onXMLError("diffuse element on spot light is missing.")

	if(diffuse.length != 1)
		onXMLError("either zero or more than one 'diffuse' element found.")
	
	diffuse = diffuse[0];

	var diffuseR = this.reader.getFloat(diffuse, 'r');
	var diffuseG = this.reader.getFloat(diffuse, 'g');
	var diffuseB = this.reader.getFloat(diffuse, 'b');
	var diffuseA = this.reader.getFloat(diffuse, 'a');

	spot.setDiffuse(this.diffuseR,this.diffuseG,this.diffuseB,this.diffuseA);

	console.log('Spot Light read from file: Diffuse R = ' + diffuseR + " Diffuse G = " + diffuseG + " Diffuse B = " + diffuseB + " Diffuse A = " + diffuseA);

	var specular = rootElement.getElementsByTagName('specular');
	if(specular == null)
		onXMLError("specular element on spot light is missing.")

	if(specular.length != 1)
		onXMLError("either zero or more than one 'specular' element found.")
	
	specular = specular[0];

	var specularR = this.reader.getFloat(specular, 'r');
	var specularG = this.reader.getFloat(specular, 'g');
	var specularB = this.reader.getFloat(specular, 'b');
	var specularA = this.reader.getFloat(specular, 'a');

	spot.setSpecular(specularR, specularG, specularB, specularA);

	console.log('Spot Light read from file: Specular R = ' + specularR + " Specular G = " + specularG + " Specular B = " + specularB + " Specular A = " + specularA);

	this.spotLights[id] = spot;

	this.lightIndex++;
	spot.update();

};

MySceneGraph.prototype.parseTextures = function(rootElement){

	if(rootElement == null)
		onXMLError("error on textures");

	var textures = rootElement.getElementsByTagName('textures');

	if(textures == null || textures.length == 0){
		onXMLError("textures element is missing");
	}

	var numberOfTextures = textures[0].children.length;

	if(numberOfTextures == 0)
		onXMLError("textures elements are missing");

	for(var i = 0; i < numberOfTextures; i++ ){
		
		var child = textures[0].children[i];

		this.textures[i * 4] = this.reader.getString(child, 'id');
		this.textures[i * 4 + 1] = this.reader.getString(child, 'file');
		this.textures[i * 4 + 2] = this.reader.getFloat(child, 'length_s');
		this.textures[i * 4 + 3] = this.reader.getFloat(child, 'length_t');
		
		var mat = new CGFappearance(this.scene);
		mat.loadTexture(this.textures[i * 4 + 1]);
		this.textures[i] = mat;

		console.log('Texture read from file: ID = ' + this.textures[i * 4] + ", File = " + this.textures[i * 4 + 1] + ", S_Length = " + this.textures[i * 4 + 2] + ", T_Length = " + this.textures[i * 4 + 3]);
	}
};

MySceneGraph.prototype.parseMaterials = function(rootElement){

	if(rootElement == null)
		onXMLError("error on materials");

	var materials = rootElement.getElementsByTagName('materials');

	if(materials == null || materials.length == 0){
		onXMLError("materials element is missing");
	}

	var numberOfMaterials = materials[0].children.length;

	if(numberOfMaterials == 0)
		onXMLError("material elements are missing");

	console.log("Number of materials: " + numberOfMaterials);

	for(var i = 0; i < numberOfMaterials; i++ ){

		var child = materials[0].children[i];
		var mat = new CGFappearance(this.scene);

		var id = this.reader.getString(child, 'id');
		console.log('Material read from file: Id = ' + id);

		//Emission
		var emission = child.getElementsByTagName('emission');
		
		if(emission == null)
			onXMLError("emission element on material is missing.")

		if(emission.length != 1)
			onXMLError("either zero or more than one 'emission' element found.")
	
		emission = emission[0];

		var emissionR = this.reader.getFloat(emission, 'r');
		var emissionG = this.reader.getFloat(emission, 'g');
		var emissionB = this.reader.getFloat(emission, 'b');
		var emissionA = this.reader.getFloat(emission, 'a');
		mat.setEmission(emissionR, emissionG, emissionB, emissionA);

		console.log('Emission read from file: Emission R = ' + emissionR + " Emission G = " + emissionG + " Emission B = " + emissionB + " Emission A = " + emissionA);
	
		//Ambient
		var ambient = child.getElementsByTagName('ambient');
		
		if(ambient == null)
			onXMLError("ambient element on material is missing.")

		if(ambient.length != 1)
			onXMLError("either zero or more than one 'ambient' element found.")
	
		ambient = ambient[0];

		var ambientR = this.reader.getFloat(ambient, 'r');
		var ambientG = this.reader.getFloat(ambient, 'g');
		var ambientB = this.reader.getFloat(ambient, 'b');
		var ambientA = this.reader.getFloat(ambient, 'a');
		mat.setAmbient(ambientR, ambientG, ambientB, ambientA);

		console.log('Ambient read from file: Ambient R = ' + ambientR + " Ambient G = " + ambientG + " Ambient B = " + ambientB + " Ambient A = " + ambientA);

		//Diffuse
		var diffuse = child.getElementsByTagName('diffuse');
		
		if(diffuse == null)
			onXMLError("diffuse element on material is missing.")

		if(diffuse.length != 1)
			onXMLError("either zero or more than one 'diffuse' element found.")
	
		diffuse = diffuse[0];

		var diffuseR = this.reader.getFloat(diffuse, 'r');
		var diffuseG = this.reader.getFloat(diffuse, 'g');
		var diffuseB = this.reader.getFloat(diffuse, 'b');
		var diffuseA = this.reader.getFloat(diffuse, 'a');
		mat.setDiffuse(diffuseR, diffuseG, diffuseB, diffuseA);
	
		console.log('Diffuse read from file: Diffuse R = ' + diffuseR + " Diffuse G = " + diffuseG + " Diffuse B = " + diffuseB + " Diffuse A = " + diffuseA);

		//Specular
		var specular = child.getElementsByTagName('specular');
		
		if(specular == null)
			onXMLError("specular element on material is missing.")

		if(specular.length != 1)
			onXMLError("either zero or more than one 'specular' element found.")
	
		specular = specular[0];

		var specularR = this.reader.getFloat(specular, 'r');
		var specularG = this.reader.getFloat(specular, 'g');
		var specularB = this.reader.getFloat(specular, 'b');
		var specularA = this.reader.getFloat(specular, 'a');
		mat.setSpecular(specularR, specularG, specularB, specularA);

		console.log('Specular read from file: Specular R = ' + specularR + " Specular G = " + specularG + " Specular B = " + specularB + " Specular A = " + specularA);

		//Shininess
		var shininess = child.getElementsByTagName('shininess');
		
		if(shininess == null)
			onXMLError("shininess element on material is missing.")

		if(shininess.length != 1)
			onXMLError("either zero or more than one 'shininess' element found.")
	
		shininess = shininess[0];

		var shininessValue = this.reader.getFloat(shininess, 'value');
		mat.setShininess(shininessValue);

		console.log('Shininess read from file: Shininess Value = ' + shininessValue);

		this.materials[i] = mat;
	}
};

MySceneGraph.prototype.parseTransformations = function(rootElement){

	if(rootElement == null)
		onXMLError("error on transformations");

	var transformations = rootElement.getElementsByTagName('transformations');

	if(transformations == null || transformations.length == 0){
		onXMLError("transformations element is missing");
	}

	var numberOfTransformations = transformations[0].children.length;

	if(numberOfTransformations == 0)
		onXMLError("transformation elements are missing");

	console.log("Number of transformations: " + numberOfTransformations);

	for(var i = 0; i < numberOfTransformations; i++){

		var child = transformations[0].children[i];
		
		var ID = this.reader.getString(child, 'id');
		
		console.log('Transformation read from file: Id = ' + ID);
		
		var translate = child.getElementsByTagName('translate');
		if(translate[0] != null){
			translate = translate[0];
			var translateToApply = [];
			translateToApply.id = ID;
			translateToApply.type = "translate";
			translateToApply.x = this.reader.getFloat(translate,'x');
			translateToApply.y = this.reader.getFloat(translate,'y');
			translateToApply.z = this.reader.getFloat(translate,'z');
			this.transformations.push(translateToApply);

			console.log("Translate: X = " + translateToApply.x + ", Y = " + translateToApply.y + ", Z = " + translateToApply.z);
		}

		var rotate = child.getElementsByTagName('rotate');
		if(rotate[0] != null){
			rotate = rotate[0];
			var rotateToApply = [];
			rotateToApply.id = ID;
			rotateToApply.type = "rotate";
			rotateToApply.axis = this.reader.getString(rotate,'axis');
			rotateToApply.angle = this.reader.getFloat(rotate,'angle');
			this.transformations.push(rotateToApply);

			console.log("Rotate: Axis = " + rotateToApply.axis + ", Angle = " + rotateToApply.angle);
		}

		var scale = child.getElementsByTagName('scale');
		if(scale[0] != null){
			scale = scale[0];
			var scaleToApply = [];
			scaleToApply.id = ID;
			scaleToApply.type = "scale";
			scaleToApply.x = this.reader.getFloat(scale,'x');
			scaleToApply.y = this.reader.getFloat(scale,'y');
			scaleToApply.z = this.reader.getFloat(scale,'z');
			this.transformations.push(scaleToApply);

			console.log("Scale: X = " + scaleToApply.x + ", Y = " + scaleToApply.y + ", Z = " + scaleToApply.z);
		}		
	}

};

MySceneGraph.prototype.parsePrimitives = function (rootElement){

	if(rootElement == null)
		onXMLError("error on primitives");

	var primitives = rootElement.getElementsByTagName('primitives');

	if(primitives == null || primitives.length != 1){
		onXMLError("primitives element is missing or more than one element");
	}

	var numberOfPrimitives = primitives[0].children.length;

	if(numberOfPrimitives == 0)
		onXMLError("primitives elements are missing");

	console.log("Number of primitives: " + numberOfPrimitives);

	for(var i = 0; i < numberOfPrimitives; i++){

		var child = primitives[0].children[i];

		if(child.tagName != 'primitive'){
			onXMLError("error on primitives: <" + child.tagName + "> instead of <primitive>");
		}

		if(child.children == null || child.children.length != 1){
			onXMLError("error on primitives: must be only one primitive");
		}
		
		var ID = this.reader.getString(child,'id');
		console.log("Primitive id = " + ID);

		this.primitivesIDs[i] = ID;

		var primitiveChild = child.children[0];
		var shape;

		switch(primitiveChild.tagName){
			case "rectangle":
				shape = this.parseRectangle(primitiveChild);
				break;
			case "triangle":
				shape = this.parseTriangle(primitiveChild);
				break;
			case "cylinder":
				shape = this.parseCylinder(primitiveChild);
				break;
			case "sphere":
				shape = this.parseSphere(primitiveChild);
				break;
			case "torus":
				shape = this.parseTorus(primitiveChild);
				break;
		}

		this.primitives[child.ID] = shape;
	}

};
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


