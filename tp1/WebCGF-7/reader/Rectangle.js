function Rectangle(scene, x1, y1, x2, y2){
	CGFobject.call(this,scene);

	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;

	this.initBuffers();
};

Rectangle.prototype = Object.create(CGFobject.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.initBuffers = function(){

	this.vertices = [
		this.x1, this.y1, 0,
		this.x2, this.y1, 0,
		this.x1, this.y2, 0,
		this.x2, this.y2, 0
	];

	this.indices = [
		0, 1, 2,
		1, 3, 2
	];

	this.normals = [
		0,0,1,
		0,0,1,
		0,0,1,
		0,0,1
	];

	this.texCoords = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];

	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
}