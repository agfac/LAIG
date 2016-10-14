
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

	console.log('Illumination read from file: Ambient R = ' + this.ambientR + "Ambient G = " + this.ambientG + "Ambient B = " + this.ambientB + "Ambient A = " + this.ambientA);

	background = background[0];

	this.backgroundR = this.reader.getFloat(background, 'r');
	this.backgroundG = this.reader.getFloat(background, 'g');
	this.backgroundB = this.reader.getFloat(background, 'b');
	this.backgroundA = this.reader.getFloat(background, 'a');

	console.log('Illumination read from file: Background R = ' + this.backgroundR + "Background G = " + this.backgroundG + "Background B = " + this.backgroundB + "Background A = " + this.backgroundA);

}	

MySceneGraph.prototype.parseLights = function(rootElement){

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

}

/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("XML Loading Error: "+message);	
	this.loadedOk=false;
};


