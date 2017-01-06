/*Sequence handles all the keyframes and select the best pair of keyframes to animate
*/
function Sequence(name, object, attribute) {
	
	this.name = name;
	this.startTime = 0;

	this.object = object;
	this.attribute = attribute;

	this.keyframes = [];

	this.times = [];
};

Sequence.prototype.clearKeyframes = function(time){

	if(!this.keyframes || !this.keys)
		return;

	var deleted = 0;
	var number = 0;
	
	for(var key in this.keyframes){
		number++;
		if(key > time){
			delete this.keyframes[key];
			deleted++;
		}
	}

	if(deleted == number){
		this.keys = null;
		return;
	}

	this.updateKeys();
};

Sequence.prototype.updateKeys = function(){

	this.keys= Object.keys(this.keyframes).sort(function(a,b) { return a - b;});
};

Sequence.prototype.update = function(time){

	if(!this.keys || !this.keyframes)
		return;

	var t1;
	var t2;

	var first = this.keyframes[this.keys[0]];
	var second = this.keyframes[this.keys[0]];

	for(var i = 0; i < this.keys.length; i++){
		var key = this.keys[i];
		if(key <= time){
			t1 = key;
			first = this.keyframes[key];
		}
		if(key > time){
			t2 = key;
			second = this.keyframes[key];
			break;
		}
	}

	if(!second)
		second = first;
	else{
		if(first.time > second.time)
			second = first;
	}
	
	first.lerp(this.object, this.attribute,second,time);
};

/*Generic method to add a keyframe
*/
Sequence.prototype.addKeyframe = function(keyframe){

	this.keyframes[keyframe.getTime()] = keyframe;

	this.updateKeys();
};

Sequence.prototype.getName = function(){

	return this.name;
};