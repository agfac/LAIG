function Bell(scene, board, selectShader){
	
	CGFobject.call(this,scene);
	
	this.board = board;
	this.pickID = -1;
	this.position = {x: 0, y: 0, z: 0};
};

Bell.prototype = Object.create(CGFobject.prototype);
Bell.prototype.constructor = Body;

Bell.prototype.OnClick = function(){

	if(this.board.isPlaying())
		this.board.doRound();
		//this.board.endTurn();
};

Bell.prototype.setPickID = function(id){

	this.pickID = id;
};

Bell.prototype.setPosition = function(pos){

	this.position = pos;
};

Bell.prototype.display = function(){

	if(this.pickID > 0)
		this.scene.registerForPick(this.pickID,this);

	if(this.selected)
		this.scene.setActiveShader(this.selectShader);

  	this.scene.pushMatrix();
		
		this.scene.translate(this.position.x, this.position.y, this.position.z);
	
		//criar bell!
		var team = this.board.playerTurn;

		var props = this.board.pieces[team].texture;
	
		if(props)
			props = {textData : props};

		this.board.pieces['bell'].display(this.board.pieces[team].material, props);

  	this.scene.popMatrix();

	if(this.selected)
		this.scene.setActiveShader(this.scene.defaultShader);

	this.scene.clearPickRegistration();
};