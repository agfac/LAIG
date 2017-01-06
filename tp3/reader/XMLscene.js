function XMLscene(){
    
    CGFscene.call(this);
    
    this.graphsNames =[];
};

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application){
    
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.animator = new Animator(this);

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.lightState =[];

    this.enableTextures(true);

    this.materialDefault = new CGFappearance(this);

    this.axis=new CGFaxis(this);

    this.setUpdatePeriod(1);

    //Picking

    this.setPickEnabled(true);

    this.obj = new Sphere(this, 0.5, 3, 3);

    this.obj.position = {x:0 , y:0 , z:0};

    this.cylinder = new Cylinder(this, 1, 1, 1, 20, 20);

  	this.board = new Board(this, 12);

  	for(var i = 0 ; i < this.lights.length; i++){
    	this.lightState.push(this.lights[i].enabled);
  	}

  	this.currentView = null;
  	
  	this.transitionValue = 2;
  	
  	this.changeHeaderText(" ");
  	
  	this.graphs = [];
  	
  	this.cameraCanUpdate = true;
  	
  	this.graphName = "";
  	
  	var time = 0;
  	
  	this.loading = 0;
};

XMLscene.prototype.addGraph = function(graph){
	
	if(!this.loading)
    	this.graphName = graph.name;

  	this.graphs[graph.name] = graph;
  	this.loading++;
};

XMLscene.prototype.setInterface = function(interface){
	this.interface = interface;
};

XMLscene.prototype.resetLights = function(){
  
  for(var i = 0; i < this.lights.length; i++){

    var light = this.lights[i];
    
    light.setSpotDirection(0, -1, 0);
    light.setSpotExponent(10);
    light.setSpotCutOff(180);
    light.setConstantAttenuation(1);
    light.setVisible(false);
    light.update();
  }
};

XMLscene.prototype.initLights = function () {

  this.lights[0].setPosition(1, 2, 1, 1);
  this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
  this.lights[0].update();
  this.lights[0].enable();

};

XMLscene.prototype.update = function(currTime){

	var time = currTime/1000;
  	
  if(this.graph)
  	this.graph.update(time);

	this.animator.update(time);
	this.board.update(time);

  this.updateCamera(time);
  this.time = time;

};

XMLscene.prototype.initCameras = function(){
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function(){
	
  this.setAmbient(0.2, 0.4, 0.8, 1.0);
	this.setDiffuse(0.2, 0.4, 0.8, 1.0);
  this.setSpecular(0.2, 0.4, 0.8, 1.0);
  this.setShininess(10.0);

};

XMLscene.prototype.getNextCamera = function(){
	
  this.currentView = this.graph.getCamera();
	this.cameraCanUpdate = true;

};

XMLscene.prototype.updateCamera = function(time){
    
    if(!this.currentView || !this.cameraCanUpdate)
    	return;

  	if(!this.time){
    	this.time = time;
    	return;
  	}

  	var delta = time - this.time;
  	var t = this.transitionValue * delta;
  	
    var fov = transition_float(this.camera.fov, this.currentView.angle, t);
  	var near = transition_float(this.camera.near, this.currentView.near, t);
  	var far = transition_float(this.camera.far, this.currentView.far, t);

  	var from = transition_Array4To3(this.camera.position,
                              	[this.currentView.from.x,
                              	this.currentView.from.y,
                              	this.currentView.from.z,
                              	0], t);

  	var to = transition_Array4To3(this.camera.target,
                              	[this.currentView.to.x,
                              	this.currentView.to.y,
                              	this.currentView.to.z,
                              	0], t);

  	this.camera.fov = fov;
  	this.camera.near = near;
  	this.camera.far = far;

  	this.camera.setPosition(from);
  	this.camera.setTarget(to);

  	var dist = 0.1;
  	var dist2 = 0.01;

  	if(this.VectDistance(this.camera.position,
  						[this.currentView.from.x,
      					this.currentView.from.y,
      					this.currentView.from.z,0]) > dist)
    	return;

  	if(this.VectDistance(this.camera.target,
    					[this.currentView.to.x,
    					this.currentView.to.y,
    					this.currentView.to.z, 0]) > dist)
    	return;

  	if(Math.abs(this.camera.fov - this.currentView.angle) > dist2)
    	return;
  	if(Math.abs(this.camera.near - this.currentView.near) > dist2)
    	return;
  	if(Math.abs(this.camera.far - this.currentView.far) > dist2)
    	return;

  	this.cameraCanUpdate = false;

};

XMLscene.prototype.VectDistance = function(p1,p2){

  var x = p1[0] - p2[0];
  var y = p1[1] - p2[1];
  var z = p1[2] - p2[2];
  return x * x + y * y + z * z;

};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.updateGraph = function(){

  this.resetLights();
  this.graph = this.graphs[this.graphName];
  this.graph.loadLights();
  
  this.gl.clearColor( this.graph.illumination.background.r,
            this.graph.illumination.background.g,
            this.graph.illumination.background.b,
            this.graph.illumination.background.a);


  this.setGlobalAmbientLight( this.graph.illumination.ambient.r,
            this.graph.illumination.ambient.g,
            this.graph.illumination.ambient.b,
            this.graph.illumination.ambient.a);

  this.axis = new CGFaxis(this,this.graph.sceneInfo.axis_length,0.1);


  for(var i = 0 ; i < this.lights.length; i++){
    this.lightState[i] = this.lights[i].enabled;
  }

  //this.nextCamera();
  
  this.interface.updateLights();
  this.root = this.graph.getRoot();
  
  //this.gl.glLightModeli(this.gl.GL_LIGHT_MODEL_LOCAL_VIEWER, this.graph.illumination.local);
  //this.gl.glLightModeli(this.gl.GL_LIGHT_MODEL_TWO_SIDED, this.graph.illumination.doubleSided);
  //Assign Game Entities
  
  this.cameraCanUpdate = true;
  this.currentView = this.graph.currentView;
  
  this.board.setPieces(this.graph.gameComponents);

};

XMLscene.prototype.onGraphLoaded = function(){

  this.loading --;
  
  if(this.loading == 0)
    this.updateGraph();

};

XMLscene.prototype.updateLights = function(){
	
	for(var i = 0; i < this.lightState.length; i++){
		
		if(this.lightState[i])
			this.lights[i].enable();
		else
			this.lights[i].disable();
	}
};

XMLscene.prototype.logPicking = function (){
	
	if (this.pickMode == false) {
		if (this.pickResults != null && this.pickResults.length > 0) {
			
      for (var i=0; i< this.pickResults.length; i++) {
				
        var obj = this.pickResults[i][0];
				
        if (obj){
					var customId = this.pickResults[i][1];

          if(obj.OnClick != null)
            obj.OnClick();

					console.log("Picked object: " + obj + ", with pick id " + customId);
				}
			}
			this.pickResults.splice(0,this.pickResults.length);
		}		
	}
};

XMLscene.prototype.changeHeaderText = function (string) {
    document.getElementsByTagName('h1')[0].innerHTML = string;
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	
	this.logPicking();
	//this.clearPickRegistration();

	// Clear image and depth buffer everytime we update the scene
  this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //this.gl.glLightModeli(this.gl.GL_LIGHT_MODEL_LOCAL_VIEWER, this.graph.illumination.local);
	//this.gl.glLightModeli(this.gl.GL_LIGHT_MODEL_TWO_SIDED, this.graph.illumination.doubleSided);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
  this.loadIdentity();
	
	if(this.graph)
		this.updateLights();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();
	this.setDefaultAppearance();
	this.materialDefault.apply();
	// Draw axis
	this.axis.display();

	// ---- END Background, camera and axis setup
	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if(this.graph)
		if (this.graph.loadedOk){
			for(var i = 0; i < this.lights.length; i++)
				this.lights[i].update();
		if(this.root)
			this.root.display(null, null);
	};	
};