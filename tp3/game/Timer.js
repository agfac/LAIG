function Timer(scene, maxTime, time = 0, radius){

  CGFobject.call(this,scene);
  
  this.time = time;
  this.maxTime = maxTime;
  this.radius = radius;
  
  this.pointer = new Cylinder(scene, 0.1,0.1,this.radius,20,1);
  this.base = new Cylinder(scene, this.radius,this.radius,0.1,20,1);
  
  this.position = {x : 0, y:0 , z:0};
};

Timer.prototype = Object.create(CGFobject.prototype);
Timer.prototype.constructor = Cell;

Timer.prototype.setMaxTime = function(time){
  
  this.maxTime = time;
};

Timer.prototype.setPosition = function(pos){
	
  this.position = pos;
};

Timer.prototype.setTime = function(time){
  
  this.time = time;
};

Timer.prototype.display = function(){

  this.scene.pushMatrix();
    this.scene.translate(this.position.x, this.position.y + this.radius, this.position.z);
    this.scene.rotate(Math.PI, 0, 1 , 0);

    this.scene.pushMatrix();
      this.scene.rotate(Math.PI/2, 0,1,0);
      this.scene.rotate(-Math.PI*2* this.time/this.maxTime - Math.PI/2, 1,0,0);
      this.pointer.display();
    this.scene.popMatrix();

    this.scene.pushMatrix();
      this.base.display();
    this.scene.popMatrix();
    
  this.scene.popMatrix();
};