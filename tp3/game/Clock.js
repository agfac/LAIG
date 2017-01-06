function Clock(scene, board){

	CGFobject.call(this,scene);

	this.board = board;
	this.time = 0;
  	this.position = {x : 0, y:0 , z:0};

 	this.displayObj = new Display(scene);
	this.height = 2;
	this.width = 6.5;
	this.plane = new Plane(scene, this.width, this.height, 10,10);
	this.plane2 = new Plane(scene, this.height, this.height, 10,10);

	this.seconds = [0,0];
  	this.mins = [0,0];
  	this.hours = [0,0];
};

Clock.prototype = Object.create(CGFobject.prototype);
Clock.prototype.constructor = Clock;

Clock.prototype.setPosition = function(pos){
	
	this.position = pos;
};

Clock.prototype.setTime = function(time){
	
	this.time = time;
	
	if(!time)
		this.time = 0;

  	var total = this.time;

  	var hours = Math.floor(total/3600);
  	total %= 3600;
  	
  	var mins = Math.floor(this.time / 60);
  	
  	var seconds = this.time % 60;

  	this.seconds[0] = Math.floor(seconds%10);
  	this.seconds[1] = Math.floor((seconds/10));

  	this.mins[0] = Math.floor((mins)%10);
  	this.mins[1] = Math.floor((mins/10)%10);

  	this.hours[0] = Math.floor((hours)%10);
  	this.hours[1] = Math.floor((hours/10)%10);
};

Clock.prototype.drawSide = function(angle){
	
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2 * angle,0,2,0);
		this.scene.translate(0,0,this.width/2);
		this.plane2.display();
	this.scene.popMatrix();
};

Clock.prototype.drawFace = function(angle){
	
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2 * angle,1,0,0);
		this.scene.translate(0,0,this.height/2);
		this.plane.display();
	this.scene.popMatrix();
};

Clock.prototype.display = function(){
  	
  	this.scene.pushMatrix();

    	this.scene.translate(this.position.x, this.position.y, this.position.z);

		this.scene.translate(0, this.height/2, -this.height/2);

	    var mat = this.board.pieces['clock'].material;
		mat.setTexture(this.board.pieces['clock'].texture);
		mat.apply();

		this.drawFace(0);
		this.drawFace(1);
		this.drawFace(2);
		this.drawFace(3);
		this.drawSide(1);
		this.drawSide(-1);

		this.scene.translate(0,this.height/2 - 0.5,this.height/2+0.05);
		
		var mat = this.board.pieces['numbers'].material;
		mat.setTexture(this.board.pieces['numbers'].texture);
		mat.apply();
	    
	    this.scene.pushMatrix();
		    this.scene.translate(2.7, 0 , 0);
		    this.displayObj.updateTexCoords(this.seconds[0]);
		    this.displayObj.display();
		    this.scene.translate(-1, 0 , 0);
		    this.displayObj.updateTexCoords(this.seconds[1]);
			this.displayObj.display();
	    this.scene.popMatrix();
		
		this.scene.pushMatrix();
			this.scene.translate(0.5, 0 , 0);
			this.displayObj.updateTexCoords(this.mins[0]);
			this.displayObj.display();
			this.scene.translate(-1, 0 , 0);
			this.displayObj.updateTexCoords(this.mins[1]);
			this.displayObj.display();
		this.scene.popMatrix();

		this.scene.pushMatrix();
			this.scene.translate(-2.7, 0 , 0);
			this.displayObj.updateTexCoords(this.hours[0]);
			this.displayObj.display();
			this.scene.translate(1, 0 , 0);
			this.displayObj.updateTexCoords(this.hours[1]);
			this.displayObj.display();
		this.scene.popMatrix();

  	this.scene.popMatrix();
};