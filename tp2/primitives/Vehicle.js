function Vehicle(scene) {
	CGFobject.call(this, scene);

	this.leftPropeller = new Cylinder(this.scene, 1.5, 1.5 , 0.2, 50, 30);
	this.rightPropeller = new Cylinder(this.scene, 1.5, 1.5 , 0.2, 50, 30);
	this.body1 = new Patch(this.scene, 2, 3, 10, 10,
		[
			[0.0, 0.0, 6.0],  //p1
			[0.0, 2.0, 4.0],
			[0.0, 2.0, 2.0],
			[0.0, 0.0, 0.0],

			[1.0, 0.0, 6.0],
			[1.0, 2.0, 4.0],
			[1.0, 2.0, 2.0],
			[1.0, 0.0, 0.0],

			[2.0, 0.0, 6.0],
			[2.0, 2.0, 4.0],
			[2.0, 2.0, 2.0],
			[2.0, 0.0, 0.0]
		]);
	this.body2 = new Patch(this.scene, 2, 3, 10, 10,
		[
			[0.0, 0.0, 6.0],  //p1
			[0.0, 1.0, 4.0],
			[0.0, 1.0, 2.0],
			[0.0, 0.0, 0.0],

			[1.0, 0.0, 6.0],
			[1.0, 1.0, 4.0],
			[1.0, 1.0, 2.0],
			[1.0, 0.0, 0.0],

			[2.0, 0.0, 6.0],
			[2.0, 1.0, 4.0],
			[2.0, 1.0, 2.0],
			[2.0, 0.0, 0.0]
		]);
	this.body3 = new Patch(this.scene, 2, 3, 10, 10,
		[
			[0.0, 0.0, 6.0],  //p1
			[-2.0, 0.0, 4.0],
			[-2.0, 0.0, 2.0],
			[0.0, 0.0, 0.0],

			[0.0, 0.0, 6.0],
			[0.0, 1.0, 4.0],
			[0.0, 1.0, 2.0],
			[0.0, 0.0, 0.0],

			[0.0, 0.0, 6.0],
			[1.0, 0.0, 4.0],
			[1.0, 0.0, 2.0],
			[0.0, 0.0, 0.0]
		]);

	this.body4 = new Patch(this.scene, 2, 3, 10, 10,
		[
			[0.0, 0.0, 6.0],  //p1
			[-1.0, 0.0, 4.0],
			[-1.0, 0.0, 2.0],
			[0.0, 0.0, 0.0],

			[0.0, 0.0, 6.0],
			[0.0, 1.0, 4.0],
			[0.0, 1.0, 2.0],
			[0.0, 0.0, 0.0],

			[0.0, 0.0, 6.0],
			[2.0, 0.0, 4.0],
			[2.0, 0.0, 2.0],
			[0.0, 0.0, 0.0]
		]);
};

 Vehicle.prototype = Object.create(CGFobject.prototype);
 Vehicle.prototype.constructor = Vehicle;

 Vehicle.prototype.display = function () {

 	this.scene.pushMatrix();
 	this.scene.translate(2,0,0);
		this.scene.rotate((-180*(Math.PI/180)) ,0,0,1);
		
		this.body2.display();
	this.scene.popMatrix();	

	 	
	this.scene.pushMatrix();	
		this.scene.translate(2,0,0);
		this.scene.rotate((-90*(Math.PI/180)) ,0,0,1);
	 	this.body3.display();
	this.scene.popMatrix();		

	this.scene.pushMatrix();	
		this.scene.rotate((90*(Math.PI/180)) ,0,0,1);
	 	this.body4.display();
	this.scene.popMatrix();

	this.scene.pushMatrix();	
		this.scene.translate(-1,1.5,3);	
		this.scene.rotate((-90*(Math.PI/180)) ,1,0,0);
	 	this.leftPropeller.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(3,1.5,3);	
		this.scene.rotate((-90*(Math.PI/180)) ,1,0,0);
	 	this.rightPropeller.display();
	this.scene.popMatrix();

	this.body1.display();
 };
 