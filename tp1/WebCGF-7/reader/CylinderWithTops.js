function CylinderWithTops(scene, base, top, height, slices, stacks){

	CGFobject.call(this,scene);
	
	this.slices = slices;
	this.stacks = stacks;
	this.height = height;

	this.top = new Circle(scene, top, slices);
	this.body = new Cylinder(scene, base, top, height, slices, stacks);
	this.base = new Circle(scene, base, slices);
};

CylinderWithTops.prototype = Object.create(CGFobject.prototype);
CylinderWithTops.prototype.constructor = CylinderWithTops;

CylinderWithTops.prototype.display = function(){

	//BODY

	this.scene.pushMatrix();
		this.body.display();
 	this.scene.popMatrix();

	//TOP

 	this.scene.pushMatrix();
		this.scene.translate(0,0,this.height);
		this.top.display();
 	this.scene.popMatrix();

	//BASE
	
 	this.scene.pushMatrix();
 		this.scene.rotate(Math.PI * this.slices, 0,0,1);
 		this.scene.rotate(Math.PI, 0 ,1, 0);
 		this.base.display();
 	this.scene.popMatrix();

};