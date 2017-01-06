function Display(scene) {
	
	CGFobject.call(this,scene);

  	this.digit = -1;
	this.initBuffers();
  	this.width = 1/10;
};

Display.prototype = Object.create(CGFobject.prototype);
Display.prototype.constructor = Display;

Display.prototype.updateTexCoords = function(digit){

	var dg = Math.floor(digit);

	if(this.digit == dg)
    	return;

    this.digit = dg;
    var x = this.digit/10;

    this.texCoords = [
    	x, 1.0,
    	x + this.width, 1.0,
    	x + this.width, 0.0,
    	x, 0.0
  	];

	this.updateTexCoordsGLBuffers();
};

Display.prototype.initBuffers = function () {

	this.vertices = [
        -0.5, -0.5, 0,
		0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, 0.5, 0
	];

	this.normals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
	];

	this.indices = [
    	0, 1, 2,
		0, 2, 3,
	];

	var x = this.digit/10;

	this.texCoords = [
		x, 1.0,
		x + this.width, 1.0,
		x + this.width, 0.0,
		x, 0.0
  	];

	this.primitiveType=this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};