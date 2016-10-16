
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
    //this.lights = [];
    this.allLights = 'All';
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

    // this.lights = [];
    // for(var i = 0; i < this.graph.omniLights.length; i++){
    //     this.lights.push(this.graph.omniLights[i]);
    //     this.lights[i].setVisible(true);

        //this.lightsEnabled[this.light[i].id] = this.lights[i].enable;
    // }
    console.log("Init Lights * Number of Lights: " + this.lights.length);

    //this.lightsEnabled[this.allLights] = false;

    // for(i in this.lights){
    //     if(this.lights[i].enabled){
    //         this.lightsEnabled[this.allLights] = true;
    //         break;
    //     }
    // }

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
		// this.lights[0].update();
  //       this.processScene();
        //Lights update
        for(var i = 0; i < this.lights.length; i++)
            this.lights[i].update();

        this.processScene();
        //console.log("Number of Lights: " + this.lights.length);
	}
};

XMLscene.prototype.processScene = function (){
    this.processNode(this.root, "clear", "null");
};

XMLscene.prototype.processNode = function(node, parentTexture, parentMaterial){

    if(node in this.graph.primitives){
        //Set materials
        if(parentMaterial != "null")
            this.graph.materials[parentMaterial].apply();
        else
            this.setDefaultAppearance();

        //Set texture
        var texture;

        if(parentTexture != "clear"){
            texture = this.graph.textures[parentTexture];
            //this.graph.primitives[node].scaleT
            texture.bind();
        }

        this.graph.primitives[node].display();

        if(texture)
            texture.unbind();
        return;
    }

    this.pushMatrix;

    this.multMatrix(this.graph.components[node].localTransformations);

    //Receives material and texture from parent?
    var material = this.graph.components[node].material.id;
    if (material == "inherit")
        material = parentMaterial;

    var texture = this.graph.components[node].texture;
    if (texture == "null")
        texture = parentTexture;

    //Process the node's children
    var children = this.graph.components[node].children;
    for (var i = 0; i < children.length; ++i) {
        this.processNode(children[i], texture, material);
    }

    this.popMatrix();
}
XMLscene.prototype.changeCamera = function()
{
	this.currentCamera++;

	if(this.currentCamera >= this.cameras.length)
		this.currentCamera = 0;

	this.camera = this.cameras[this.currentCamera];
};
