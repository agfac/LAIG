function Circle(scene, radius, slices){

	CGFobject.call(this, scene);

	this.radius = radius;
	this.slices = slices;

	this.initBuffers();
};

Circle.prototype = Object.create(CGFobject.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.initBuffers = function(){
	
	this.vertices = [];

 	this.indices = [];

 	this.normals = [];

 	this.texCoords = [];
	
	var ang = 0;

	var deltaAng = (2*Math.PI)/this.slices;

	this.vertices.push(0, 0, 0);
	this.normals.push(0, 0, 1);
	this.texCoords.push(0.5, 0.5);


	for(var i=0; i<this.slices; i++){

		this.vertices.push(Math.cos(ang) * this.radius, Math.sin(ang) * this.radius, 0);
		this.texCoords.push((Math.cos(ang)/2) + 0.5, (- Math.sin(ang)/2) + 0.5);
		ang+=deltaAng;

		this.vertices.push(Math.cos(ang) * this.radius, Math.sin(ang) * this.radius, 0);
		this.texCoords.push((Math.cos(ang)/2) + 0.5, (- Math.sin(ang)/2) + 0.5);
		ang+=deltaAng;

		this.indices.push(0, (i+1), (i+2));

		this.normals.push(0, 0, 1);
		this.normals.push(0, 0, 1);
	}
	
	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
};
