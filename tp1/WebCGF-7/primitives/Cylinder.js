function Cylinder(scene, base, top, height, slices, stacks) {

	CGFobject.call(this,scene);

	this.base = base;
	this.top = top;
	this.height = height;
	this.slices = slices;
	this.stacks = stacks;

	var angulo = 360 / this.slices;
	this.aRad = (angulo * Math.PI) / 180;

	this.initBuffers();
};

Cylinder.prototype = Object.create(CGFobject.prototype);
Cylinder.prototype.constructor = Cylinder;

Cylinder.prototype.createCircle = function(radius,z,isTop){

	var ang = 0;

	var indiceTemp = this.vertices.length/3;

	for(var i = 0 ; i < this.slices; i++){

	var x = radius * Math.cos(ang);
	var y = radius * Math.sin(ang);
	var xx = Math.cos(ang);
	var yy = Math.sin(ang);

	this.vertices.push(x,y,z);

	if(isTop == 0)
		this.normals.push(0,0,-1);
	else
		this.normals.push(0,0,1);

	if(i < this.slices - 2){
		if(isTop == 0)
			this.indices.push(indiceTemp, indiceTemp + i + 2 , indiceTemp + i + 1);
		else
			this.indices.push(indiceTemp, indiceTemp + i + 1, indiceTemp + i + 2);
	}

	var s = (xx+1)/2.0;

	var v = ((yy*-1)+1)/2.0;

	this.texCoords.push(s, v);

	ang += this.aRad;
	
	}
};

Cylinder.prototype.calculateCross = function(A,B){

	var cross = {
		x: A.y * B.z - A.z * B.y,
		y: A.z * B.x - A.x * B.z,
		z: A.x * B.y - A.y * B.x
	};

	var norm = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
	cross.x /= norm;
	cross.y /= norm;
	cross.z /= norm;

	return cross
};

Cylinder.prototype.calculateNormal = function(angle){

	var tangent ={
		x: -Math.sin(angle),
		y: Math.cos(angle),
		z: 0
		};

	var vetor = {
		x: (this.top - this.base) * Math.cos(angle) ,
		y: (this.top - this.base) * Math.sin(angle),
		z: this.height
		};
	
	return this.calculateCross(tangent,vetor);
};

Cylinder.prototype.initBuffers = function() {

	this.vertices = [];
	this.indices = [];
	this.normals = [];
	this.texCoords = [];

	for(var i = 0; i <= this.stacks; i++){
		
		var h = i/this.stacks;

		for(var j = 0; j <= this.slices; j++){
			var ang = Math.PI * 2 * (j/this.slices);

			var radius = (this.top-this.base)* h + this.base;
			var x = radius * Math.cos(ang);
			var y = radius * Math.sin(ang);

			this.vertices.push(x , y , this.height * h);
			var normal = this.calculateNormal(ang);
			this.normals.push(normal.x,normal.y,normal.z);

			var s = j/this.slices;

			this.texCoords.push(s,1-h);
		}
	}

	var incr1 = this.slices+1;

	for(var i = 0; i < this.stacks; i++){
		for(var k = 0 ; k < this.slices; k++){
			var index = i * (incr1) + k;

			this.indices.push(index + 1, index + incr1, index);
			this.indices.push( index + incr1 + 1 , index + incr1, index + 1);
		}
	}

	this.createCircle(this.base,0,0);
	this.createCircle(this.top,this.height,1);

	this.primitiveType = this.scene.gl.TRIANGLES;
	this.initGLBuffers();
};