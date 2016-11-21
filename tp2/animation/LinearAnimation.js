var LinearAnimation = function(controlPoints , time) {

    Animation.call(this);
    this.controlPoints = controlPoints;
    this.totalTime = time;

    this.totalLength = 0;
    this.distances = [];

    for(var i = 0 ; i < controlPoints.length - 1; i++){

        var length = this.getLength(controlPoints[i], controlPoints[i+1]);

        this.distances.push(length);

        this.totalLength += length;
    }

    this.velocity = this.totalLength/this.totalTime;
};

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.getLength = function(p1, p2){

    vect = {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
        z: p1.z - p2.z
    }

    return Math.sqrt(vect.x * vect.x + vect.y * vect.y + vect.z * vect.z);
};

LinearAnimation.prototype.getTransformation = function(time) {
    
    if(time > this.totalTime) 
    	time = this.totalTime;

    transf = this.getMatrix(time);

    var matrix = mat4.create();

    mat4.translate(matrix,matrix,[transf.pos.x,transf.pos.y,transf.pos.z]);
    mat4.rotate(matrix,matrix,transf.angle,[0,1,0]);

    return matrix;
};

Animation.prototype.getTime = function() {
    
    return this.totalTime;
};

LinearAnimation.prototype.lerpPosition = function(p1, p2, t){

    p = {

        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
        z: p1.z + (p2.z - p1.z) * t
    }

    return p;
};

LinearAnimation.prototype.getAngle = function(p1, p2){

    vect = {
        x: p2.x - p1.x,
        y: p2.z - p1.z
    }

    return (-Math.atan2(vect.y, vect.x) + Math.PI/2);
};

LinearAnimation.prototype.getMatrix = function(time){

    var dist = time * this.velocity;

    var points = [];
    var totalDist = 0;

    var lastDist = 0;
    var currDist = 0;

    for(var i = 0; i < this.distances.length; i++){

        totalDist += this.distances[i];

        if(dist <= totalDist){

            currDist = this.distances[i] - (totalDist - dist);
            points.push(this.controlPoints[i]);
            points.push(this.controlPoints[i + 1]);
            lastDist = this.distances[i];
            break;
        }
    }

    ret = {
        pos: this.lerpPosition(points[0], points[1], currDist/lastDist ),
        angle: this.getAngle(points[0], points[1])
    }

    return ret;
};