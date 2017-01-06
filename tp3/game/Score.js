function Score(scene, board){

	CGFobject.call(this,scene);
  
  	this.board = board;
  	this.position = {x : 0, y:0 , z:0};

  	this.displayObj = new Display(scene);
	this.height = 1;
	this.width = 1;
	this.plane = new Plane(scene, this.width, this.height, 10,10);
	this.plane2 = new Plane(scene, this.height, this.height, 10,10);
};

Score.prototype = Object.create(CGFobject.prototype);
Score.prototype.constructor = Score;

Score.prototype.setPosition = function(pos){
	
	this.position = pos;
};

Score.prototype.drawSide = function(angle){
	
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2 * angle,0,2,0);
		this.scene.translate(0,0,this.width/2);
		this.plane2.display();
	this.scene.popMatrix();
};

Score.prototype.drawFace = function(angle){
	
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2 * angle,1,0,0);
		this.scene.translate(0,0,this.height/2);
		this.plane.display();
	this.scene.popMatrix();
};

Score.prototype.drawCube = function(team){
	
	var mat = this.board.pieces[team].material;
	mat.setTexture(this.board.pieces[team].texture);
	mat.apply();
	
	this.scene.translate(0,0,-0.51);
	
	this.drawFace(0);
	this.drawFace(1);
	this.drawFace(2);
	this.drawFace(3);
	this.drawSide(1);
	this.drawSide(-1);
};

Score.prototype.display = function(){
  	
  	this.scene.pushMatrix();

	    this.scene.translate(this.position.x, this.position.y, this.position.z);
	    this.scene.translate(0, 0.5, 0);

		this.scene.translate(0,this.height/2 - 0.5,this.height/2+0.05);
	    
	    var mat = this.board.pieces['numbers'].material;
		mat.setTexture(this.board.pieces['numbers'].texture);
		mat.apply();

	    var points = this.board.points[this.board.WHITE];

		this.scene.pushMatrix();
			this.scene.translate(-1.5, 0 , 0);
			this.displayObj.updateTexCoords(points);
			this.displayObj.display();
		    this.drawCube(this.board.WHITE);
		this.scene.popMatrix();

	    var points = this.board.points[this.board.BLACK];
		mat = this.board.pieces['numbers'].material;
		mat.setTexture(this.board.pieces['numbers'].texture);
		mat.apply();

	    this.scene.pushMatrix();
		    this.scene.translate(1.5, 0, 0);
		    this.displayObj.updateTexCoords(points);
		    this.displayObj.display();
		    this.drawCube(this.board.BLACK);
	    this.scene.popMatrix();
  	
  	this.scene.popMatrix();
};
