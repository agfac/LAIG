/*The Keyframe class handles the behaviour of an object in a specific point in time.
* You Must define the following attributes:
	-Time: 			time of the keyframe
	-Object: 		the object that has an attribute that will be changed.
	-Attribute: 	the attribute inside quotes that will be changed.
	-Value:			the value of the attribute at that time.
	-lerpFunction:	the transtition function to animate between two frames.
*/
function Keyframe(time, value, lerpFunction) {
	
	this.time = time;
	this.value = value;
	this.lerpFunction = lerpFunction;
};

/*Function to lerp between keyframes.
* Each keyframe have the information about object that will be changed
	-maybe change that information to the sequence to optimize!
*/
Keyframe.prototype.lerp = function(object, attribute, keyframe2, t){

	var localTime = t - this.time;

	var deltaTime = keyframe2.time - this.time;

	var time = 0;

	if(deltaTime != 0)
		time = Math.abs(localTime/deltaTime);

	time = (time > 1)? 1 : time;

	object[attribute] = this.lerpFunction(this.value, keyframe2.value, time);
};

Keyframe.prototype.getTime = function(){

	return this.time;
};
