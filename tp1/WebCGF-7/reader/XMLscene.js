
// Scene constructor
function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

// Scene initialization
XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);
    
    //Axis
    this.axis = new CGFaxis(this);

    //Views
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    this.currentCamera = 0;
    this.cameras = [];

    //Lights
    this.lights = [];
    this.omniLights = [];
    this.lightsEnabled = [];
    this.lightsIds = [];

    //Primitives
    this.primitives = [];

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);
};

// Set the interface of the scene
XMLscene.prototype.setInterface = function (interface) {
    this.interface = interface;
};

XMLscene.prototype.initIllumination = function(){

    this.gl.clearColor(this.graph.backgroundR,this.graph.backgroundG,this.graph.backgroundB,this.graph.backgroundA);
    this.setGlobalAmbientLight(this.graph.ambientR, this.graph.ambientG, this.graph.ambientB, this.graph.ambientA);

};

XMLscene.prototype.initLights = function () {

  // this.lights[0].setPosition(2, 3, 3, 1);
  // this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
  // this.lights[0].update();

  for(var i = 0; i < this.omniLights.length; i++){
    this.lights.push(this.omniLights[i]);
    this.lights[i].setVisible(true);
    this.lightsEnabled[this.lights[i].id] = this.lights[i].enabled;
  }

    console.log("Init Lights * Number of Lights: " + this.lights.length);

};

// Initialization views
XMLscene.prototype.initCameras = function () {
    //this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    //console.log(this.graph.cameras);
    for(var i = 0; i<this.graph.cameras.length/6; i++)
    	this.cameras[i] = new CGFcamera(0.4, this.graph.cameras[i * 6 + 1], this.graph.cameras[i * 6 + 2], this.graph.cameras[i * 6 + 4], this.graph.cameras[5]);

    this.camera = this.cameras[this.currentCamera];
    this.interface.setActiveCamera(this.camera);
};

// Set default appearance
XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function ()
{
    this.axis = new CGFaxis(this, this.graph.axis_length);

    this.initCameras();
    this.initIllumination();
    this.initLights();
    // this.lights[0].setVisible(true);
    // this.lights[0].enable();
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup

	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

    // Draw axis
    this.axis.display();

	this.setDefaultAppearance();

	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk)
	{
		//this.lights[0].update();
        //Lights update
        for(var i = 0; i < this.lights.length; i++)
            this.lights[i].update;

        console.log("Number of Lights: " + this.lights.length);
	}
};

XMLscene.prototype.changeCamera = function()
{
	this.currentCamera++;

	if(this.currentCamera >= this.cameras.length)
		this.currentCamera = 0;

	this.camera = this.cameras[this.currentCamera];
}

XMLscene.prototype.addOmniLight = function (id, location, ambient, diffuse, specular, enable){
    var omni = new CGFlight(this, id);
    omni.id = id;
    omni.setPosition(location);
    omni.setAmbient(ambient);
    omni.setDiffuse(diffuse);
    omni.setSpecular(specular);
    if(enable)
        omni.enable();
    else
        omni.disable();
    this.omniLights.push(omni);
}
