/*	Class responsible to save the state of the client game
*	and to display/store all the pieces used.
*/
function Body(scene, board, id, team, selectShader){
	
	CGFobject.call(this,scene);

	this.id = id;
	this.animation = new Sequencer();
	this.scene.animator.addAnimation(this.animation);

	this.animation.registerSequence("position", this, 'position');
	this.animation.registerSequence("position", this, 'position');
	this.animation.registerSequence("boardPosition", this, 'boardPosition');

	this.boardPosition = {x:-1, y:-1};
	this.board = board;
	this.team = team;
	this.position = {x:0, y:0, z:0};
	this.startPosition = {x:0, y:0, z:0};
	this.pickID = -1;
	this.selectShader = selectShader;
	this.selected = false;
	this.currentCell = null;
	this.color = 0;
};

Body.prototype = Object.create(CGFobject.prototype);
Body.prototype.constructor = Body;

Body.prototype.select = function(value){
	
	this.selected = value;
};

Body.prototype.OnClick = function(){
	
	if(this.board.isPlaying())
		this.board.selectBody(this);
};

Body.prototype.move = function(cell){

	var toPos = this.startPosition;
	
	if(cell)
		toPos = cell.position;

	var time = this.scene.animator.animationTime;
	var duration = 1;
	
	this.animation.addKeyframe('position', new Keyframe(time + 0, this.position, transition_curved_vector3));
	this.animation.addKeyframe('position', new Keyframe(time + duration, toPos, transition_rigid_vector3));

	//var id1 = (this.currentCell)? this.currentCell.id : "null";
	//var id2 = (cell)? cell.id : "null";

	//console.log("ID: " + this.id + " From:" + id1 + " To:" + id2);
	if(this.currentCell)
		this.currentCell.storeOccupy(null);
	
	this.currentCell = cell;

	if(this.currentCell)
		this.currentCell.storeOccupy(this);
};

Body.prototype.setCurrentCell = function(cell){
	
	if(cell)
		this.boardPosition = cell.boardPosition;
	
	this.currentCell = cell;
};

Body.prototype.setPickID = function(id){
	
	this.pickID = id;
	//console.log("Team:" + this.team + " Value:" + id + "ID:" + this.id);
};

Body.prototype.spawnPosition = function(pos){
	
	this.animation.addKeyframe('position', new Keyframe(0, pos, transition_rigid_vector3));
	this.position = pos;
	this.startPosition = pos;
};

Body.prototype.resetSelection = function(){
	
	this.pieceN = 0;
	this.color = 0;
	this.selected = false;
};

Body.prototype.setPosition = function(pos){
	
	this.position = pos;
};

Body.prototype.display = function(){

	if(this.pickID > 0)
		this.scene.registerForPick(this.pickID,this);

	if(this.selected && !this.scene.pickMode){
		this.scene.setActiveShader(this.selectShader);
		this.selectShader.setUniformsValues({pieceN : this.selected - 1, number: this.color});
	}

	this.scene.pushMatrix();
		this.scene.translate(this.position.x, this.position.y, this.position.z);

		var props = this.board.pieces[this.team].texture;
	
		if(props)
			props = {textData : props};
	
		this.board.pieces['body'].display(this.board.pieces[this.team].material,props);

  	this.scene.popMatrix();

	if(this.selected)
		this.scene.setActiveShader(this.scene.defaultShader);

	this.scene.clearPickRegistration();

	if(this.selected)
		this.selectShader.setUniformsValues({pieceN : 0});
};

Body.prototype.getBodyString = function (index) {

	var res = [];
	// res.push(index);

	if(this.board.WHITE == this.team){
		res.push("W");
	} else {
		res.push("B");
	}
		
	return res;
};