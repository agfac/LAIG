/*Call that handles sequences and iterates over them to play a sequence
* Each sequence defines an animation of a certain object
* Each Animated Object must have an Animation class and must be added to the Animator
*/
function Sequencer() {

	this.startTime = 0;

	this.sequences = [];
};

Sequencer.prototype.update = function(time){

	for(var key in this.sequences)
		this.sequences[key].update(time);
};

/*Adding a keyframe to an sequence, needs an uniqueID and an keyframe
* The sequence must be registered prior to this point.
*/
Sequencer.prototype.clearKeyframes = function(time){

	for(var key in this.sequences)
		this.sequences[key].clearKeyframes(time);
};

/*Adding a keyframe to an sequence, needs an uniqueID and an keyframe
* The sequence must be registered prior to this point.
*/
Sequencer.prototype.addKeyframe = function(sequenceName, keyframe){

	if(!this.sequences[sequenceName]){
		console.error("Sequence don't exist :" + sequenceName);
		return;
	}

	this.sequences[sequenceName].addKeyframe(keyframe);
};

/* Method to register a sequence, each sequence need:
* 	-UniqueID
*	-the object to edit an it's attribute.
*/
Sequencer.prototype.registerSequence = function(sequenceName, object, attribute){

	if(!this.sequences[sequenceName])
		this.sequences[sequenceName] = new Sequence(sequenceName, object,attribute);
	else
		console.warn("Sequence already exists!" + sequenceName);
};