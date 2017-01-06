/*Call that handles all animations and iterates over them to play an animation*/
function Animator(scene) {
	
	this.scene = scene;
	this.recording = false;
	this.startTime = 0;
	this.animationTime = 0;
	this.timeOffset = 5;
	this.animationMaxTime = this.timeOffset;
	this.animations = [];
	this.lastTime = 0;
	this.play = false;
	this.lastPlay = false;
	this.animate = true;
	this.playUI = [];
	this.currTime;
	this.listeners = [];
	this.playBtn;
};

Animator.prototype.changingAnimationTime = function(){
	
	this.animate = false;
	this.lastPlay = false;
	this.recording = false;
	
	if(this.animationTime < 0)
		this.animationTime = 0;

	this.playBtn.name("Play");
};

Animator.prototype.changedAnimationTime = function(){

	this.animate = true;
	this.lastPlay = false;
	this.recording = false;
};

Animator.prototype.updateMaxTime = function(){
	
	this.animationMaxTime = this.animationTime + this.timeOffset;
	
	for(var v = 0; v < this.playUI.length; v++)
		this.playUI[v].__max = this.animationMaxTime;
};

Animator.prototype.addUndoListener = function(listener){

	this.listeners.push(listener);
};

Animator.prototype.undo = function(){

	for(var i = 0; i < this.listeners.length; i++)
		this.listeners[i].onUndo();
	
	this.updateMaxTime();
	this.clearKeyframes(this.animationTime);
};

Animator.prototype.togglePlay = function(){

	this.play = !this.play;
	this.playBtn.name((this.play)? "Stop" : "Play");

//	this.playBtn.updateDisplay();

	console.log(this.playBtn);
};

Animator.prototype.clearKeyframes = function(time){
	
	for(var i = 0; i < this.animations.length; i++)
		this.animations[i].clearKeyframes(time);
};

Animator.prototype.resume = function(){
	
	this.animationTime = this.animationMaxTime - this.timeOffset;
	this.recording = true;
	this.play = true;
	this.playBtn.name("Stop");
};

Animator.prototype.update = function(currTime){
	
	this.currTime = currTime;
	
	if(this.recording && this.play){
			if(this.animationTime > this.animationMaxTime - this.timeOffset){
				this.updateMaxTime();
			}
	}

	if(this.startTime == 0){
		this.startTime = currTime;
		return;
	}

	if(!this.play || !this.animate)
		this.startTime = currTime;

	if(this.play){
		if(this.animate)
			if(!this.lastPlay){
				this.startTime = currTime - this.animationTime;
			}else{
				this.animationTime = currTime - this.startTime;
			}
	}

	if(this.animationTime > this.animationMaxTime){
		this.animationTime = this.animationMaxTime;
		this.play = false;
	}

	var elapsed = this.animationTime;

	for(var i = 0; i < this.animations.length; i++)
		this.animations[i].update(elapsed);

	this.lastTime = currTime - this.startTime;
	this.lastPlay = this.play;
};

Animator.prototype.addAnimation = function(animation){

	this.animations.push(animation);
};