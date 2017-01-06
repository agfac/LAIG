function Cell(scene, board, id, x, z, bx, by, selectShader){
	
	this.id = id;
	CGFobject.call(this,scene);
	
	this.board = board;
	this.boardPosition = {x: bx, y:by};
  	this.position = {x: x, y:0, z:z};
	this.pickID = -1;
	this.occupied = null;
	this.selected = false;
	this.selectShader = selectShader;

	this.animation = new Sequencer();
	this.scene.animator.addAnimation(this.animation);
	this.animation.registerSequence('occupied', this, 'occupied');

	this.animation.addKeyframe('occupied',
	new Keyframe( 0, {obj:this, value: this.occupied}, transition_occupy));
};

Cell.prototype = Object.create(CGFobject.prototype);
Cell.prototype.constructor = Cell;

Cell.prototype.OnClick = function(){
	
	if(this.board.isPlaying())
		this.board.selectCell(this);
};

Cell.prototype.storeOccupy = function(object){
	
	var time = this.scene.animator.animationTime;
	var duration = 1;
	
	//this.animation.addKeyframe('occupied',
	//new Keyframe(time + 0, {obj:this, value: this.occupied}, transition_occupy));
	
	if(object)
		console.log("Adding:" + object.id + "|" + object.team + " To:" + this.id);

	this.animation.addKeyframe('occupied', new Keyframe(time + duration, {obj:this, value: object}, transition_occupy));

};

Cell.prototype.occupy = function(object){
	
	if(this.occupied && object)
		if(this.occupied.id == object.id)
			return;

	if(!this.occupied && !object)
		return;

	if(this.occupied){
		if(this.occupied.currentCell)
			if(this.occupied.currentCell.id == this.id)//Evita concorrencia
				this.occupied.setCurrentCell(null);
	}

	this.occupied = object;
	
	var id = (object)? object.id : 'null';
	
	console.log("Cell:" + this.id + " Object:" + id);
	
	if(this.occupied)
		this.occupied.setCurrentCell(this);
};

Cell.prototype.unOcupy = function(){
	
	this.occupied = null;
};

Cell.prototype.setPickID = function(id){
	
	this.pickID = id;
};

Cell.prototype.display = function(){

	if(this.pickID > 0)
		this.scene.registerForPick(this.pickID,this);

	if(this.selected && !this.scene.pickMode)
		this.scene.setActiveShader(this.selectShader);

	this.scene.pushMatrix();
		this.scene.translate(this.position.x, this.position.y, this.position.z);
    	this.board.pieces['cell'].display();
  	this.scene.popMatrix();

	if(this.selected)
		this.scene.setActiveShader(this.scene.defaultShader);

	this.scene.clearPickRegistration();
};