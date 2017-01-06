function Sphere(scene, radius, slices, stacks){
	
	CGFobject.call(this, scene);

	this.slices = (slices > 3)? slices : 3;
    this.stacks = (stacks > 3)? stacks : 3;
	this.radius = radius;

	var angulo = 360 / this.slices;
	this.aRad = (angulo * Math.PI) / 180;
	angulo = 180 / this.stacks;
	this.aRadS = (angulo * Math.PI) / 180;

	this.initBuffers();
};

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.drawPoints = function(yCoord, radius) {

    for(var i = 0; i < this.slices; i++){

        var x = Math.cos(this.aRad * i);
        var z = Math.sin(this.aRad * i); 

        this.vertices.push(x * radius,yCoord,z * radius);
        this.normals.push(x,yCoord/radius,z);
        this.texCoords.push(((x*radius/this.radius) + 1) / 2,((z*radius/this.radius) + 1) / 2);
    }
};

Sphere.prototype.drawTriangles = function() {
    
    var indTop = 0;
    var indBot = (this.vertices.length / 3) - 1;

    for(var k = 1; k <= this.slices; k++){
        if(k == this.slices){
            this.indices.push(indTop,1,k);
            this.indices.push(indBot,indBot - 1,indBot - k);
            continue;
        }
        this.indices.push(indTop,k + 1,k);
        this.indices.push(indBot,indBot - (k+1),indBot-k);
    }
};

Sphere.prototype.drawStripes = function() {

    var numVerts = (this.vertices.length / 3) - 1;
    
    for(var i = 0; i < this.stacks - 2; i++){
        for(var j = 0; j < this.slices; j++){
            var aux = (i * this.slices) + 1;
            if(j == this.slices-1){
                this.indices.push(j+aux,aux,j+aux+this.slices);
                this.indices.push(j+aux+this.slices,aux,aux+this.slices);
                continue;
            }
            this.indices.push(j+aux,j+aux+1,j+aux+this.slices);
            this.indices.push(j+aux+this.slices,j+aux+1,j+aux+this.slices + 1);
        }
    }
};

Sphere.prototype.initBuffers = function(){

	this.vertices = [];
 	this.indices = [];
 	this.normals = [];
 	this.texCoords = [];
    
    this.vertices.push(0,this.radius,0);
    this.normals.push(0,1,0);
    this.texCoords.push(0.5,0.5);

    for(var j = 0; j < this.stacks - 1; j++)
        this.drawPoints(this.radius * Math.cos(this.aRadS * (j + 1)),this.radius * Math.sin(this.aRadS * (j + 1)));
    
    this.vertices.push(0,-this.radius,0);
    this.normals.push(0,-1,0);
    this.texCoords.push(0.5,0.5);

    this.drawTriangles();
    this.drawStripes();

 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
};