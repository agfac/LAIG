function Interface() {

	//call CGFinterface constructor
	CGFinterface.call(this);
	
	this.items = [];
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

Interface.prototype.updateLights = function(){
	
	console.log(this.scene.graph.lightsName);
	
	var length = this.scene.graph.lightsName.length;

	for(var i = 0; i < this.scene.lightState.length ; i++){
		
		var item = this.items[i];
		
		if(i < length)
			item.name(this.scene.graph.lightsName[i]);
		else
			item.name("Disabled");
	}
};

Interface.prototype.init = function(application) {

	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);

	this.lightGroup = null;

	this.gui = new dat.GUI();

	this.lightGroup = this.gui.addFolder("Lights");

	this.scene.animator.animationTime=0.0001;

	for(var i = 0; i < this.scene.lights.length ; i++){
	
		var item = this.lightGroup.add(this.scene.lightState, i , this.scene.lightState[i]).name("Disabled").listen();
		this.items.push(item);
	}

	var animationGroup = this.gui.addFolder("Animation");
	var timelineSlider = animationGroup.add(this.scene.animator, 'animationTime', 0, this.scene.animator.animationMaxTime).step(0.1).listen();
	var timeline = animationGroup.add(this.scene.animator, 'animationTime').max(0, this.scene.animator.animationMaxTime).step(0.1).listen();
	var updater1 = function(){
		scene.animator.changingAnimationTime()
	}
	var updater2 = function(){
		scene.animator.changedAnimationTime()
	}
	timeline.onChange(updater1);
	timeline.onFinishChange(updater2);

	timelineSlider.onChange(updater1);
	timelineSlider.onFinishChange(updater2);

	this.scene.animator.playUI.push(timeline,timelineSlider);

	var scene = this.scene;

	this.scene.animator.animationTime = 0;

	var playButton = animationGroup.add(this.scene.animator, 'togglePlay').name("Play");
	scene.animator.playBtn = playButton;

	animationGroup.add(this.scene.animator, 'resume');
	animationGroup.add(this.scene.animator, 'undo');

	var gameGroup = this.gui.addFolder("Game");
	this.scene.graphSelector = gameGroup.add(this.scene, 'graphName', this.scene.graphsNames).onFinishChange( function(){
		scene.updateGraph();
	}).listen();

	gameGroup.add(this.scene.board, 'resetGame').name("Reset Game");

	var optionsGroup = this.gui.addFolder("Options");
	optionsGroup.add(this.scene.board,'mode', {'H vs H' : 'hh', 'H vs C' : 'hc', 'C vs H' : 'ch', 'C vs C' : 'cc'}).name("Mode");
	var difficultyGroup = optionsGroup.addFolder("Difficulty");
	difficultyGroup.add(this.scene.board,'mode', {'Dificil' : 'd', 'Normal' : 'n', 'Facil' : 'f'}).name("Difficulty");
	
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