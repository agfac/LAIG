function Interface() {

	//call CGFinterface constructor
	CGFinterface.call(this);

};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

Interface.prototype.updateLights = function(){

	for(var i = 0; i < this.scene.lightState.length ; i++)
		this.lightGroup.add(this.scene.lightState, i , this.scene.lightState[i]).name(this.scene.graph.lightsIDs[i]);
};

Interface.prototype.init = function(application) {

	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);

	this.gui = new dat.GUI();

	this.lightGroup = this.gui.addFolder("Lights");

	return true;
};

Interface.prototype.processKeyboard = function(event) {
	
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);

};

Interface.prototype.processKeyDown = function(event){
	
	CGFinterface.prototype.processKeyDown.call(this,event);
		switch (event.keyCode){
			case (77): // Key M
				this.scene.graph.changeMaterials();
				break;
			case (86): // Key V
				this.scene.getNextCamera();
				break;
	};
};