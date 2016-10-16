function Sphere(scene, radius, slices, stacks){
	CGFobject.call(this, scene);

	this.slices = slices;
	this.stacks = stacks;
	this.radius = radius;

	this.initBuffers();
};

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function(){

	this.sigma = (Math.PI*2)/this.slices;
	this.teta = Math.PI/this.stacks;
	
 	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
	this.texCoords = [];

	var tetaAux  = 0;
	var sigmaAux = 0;

	/* x = r * cos(teta) * sin(sigma)
	   y = r * sin(teta) * sin(sigma)
	   z = r * cos(sigma)
	*/

	for(var i = 0 ; i <= this.stacks ; i++){
		tetaAux = i * this.teta;
		for(var j = 0 ; j <= this.slices; j++){
			sigmaAux = j * this.sigma;
			var x = this.radius * Math.cos(sigmaAux) * Math.sin(tetaAux);
			var y = this.radius * Math.sin(tetaAux) * Math.sin(sigmaAux);
			var z = this.radius * Math.cos(tetaAux);

			this.vertices.push(x,y,z);
			this.normals.push(x,y,z);
			this.texCoords.push(1- i/this.stacks, 1 - j/this.slices);
			
		}
	}

 	
 	for(var stack = 0 ; stack < this.stacks ; ++stack){
 		for(var slice = 0; slice < this.slices ; ++slice){
 			this.indices.push(stack * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice + 1);
			this.indices.push(stack * (this.slices + 1) + slice, (stack + 1) * (this.slices + 1) + slice + 1, stack * (this.slices + 1) + slice + 1);
		}
	}

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
};