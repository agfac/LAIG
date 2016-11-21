var CircularAnimation = function(time, center, radius, startAng, rotAng) {

    Animation.call(this);

    this.center = center;
    this.totalTime = time;

    this.radius = radius;

    this.rotAng = rotAng;

    this.totalDist = radius * rotAng;

    this.startAng = startAng * Math.PI/180;
    this.endAng = (startAng + rotAng)* Math.PI/180;

    this.velocity = this.totalDist / this.totalTime;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getLength = function(p1, p2){

    vect = {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
        z: p1.z - p2.z
    }

    return Math.sqrt(vect.x * vect.x + vect.y * vect.y + vect.z * vect.z);
};

CircularAnimation.prototype.getTransformation = function(time) {
    
    if(time > this.totalTime) time = this.totalTime;

    var currDist = time * this.velocity;

    var angle = this.lerpAngle(this.startAng, this.endAng, currDist/this.totalDist);

    var matrix = mat4.create();

    var diff = 1;

    if(this.rotAng < 0) 
    	diff = 0;

    mat4.translate(matrix,matrix,[this.center.x,this.center.y,this.center.z]);
    mat4.rotate(matrix,matrix,angle,[0,1,0]);
    mat4.translate(matrix,matrix,[this.radius,0,0]);
    mat4.rotate(matrix,matrix,diff * Math.PI,[0,1,0]);

    return matrix;
};

Animation.prototype.getTime = function() {
   
    return this.totalTime;
};

CircularAnimation.prototype.lerpAngle = function(a1, a2, t){
   
    return a1 + (a2 - a1) * t;
};