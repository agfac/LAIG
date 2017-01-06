/* This File must be used to write your own lerp methods
	-Example: lerpFunction(firstValue, secondValue, time);
	The time is normalize between [0,1]
 */

/* function to interpolate between two points */

function transition_listener(p1, p2, time){

	p1.obj[p1.lstnr](p1.value);
	return p1.value;
};

function transition_rigid_float(p1, p2, time){

	return p1;
};

function transition_float(p1, p2, time){

	return p1 + (p2 - p1) * time;
};

function transition_rigid_vector2(p1, p2, time){

	var res= {
		x: p1.x,
		y: p1.y,
	}

	return res;
};

function transition_object(p1, p2, time){

	return p1;
};

function transition_occupy(p1, p2, time){

	if(p1.obj)
		p1.obj.occupy(p1.value);

	return p1.value;
};

function transition_parent(p1, p2, time){

	p1.obj.setParent(p1.parent);

	return p1.parent;
};

function transition_rigid_follow_vector3(p1, p2, time){

	return (p1.obj)? p1.obj.position : p1.pos;
};

function transition_follow_vector3(p1, p2, time){

	var point1 = (p1.obj)? p1.obj.position : p1.pos;
	var point2 = (p2.obj)? p2.obj.position : p2.pos;

	return transition_curved_vector3(point1, point2, time);
};

function transition_rigid_vector3(p1, p2, time){

	return p1;
};

function transition_vector3(p1, p2, time){

	var res= {
		x: p1.x + (p2.x - p1.x) * time,
		y: p1.y + (p2.y - p1.y) * time,
		z: p1.z + (p2.z - p1.z) * time
	}

	return res;
};

function transition_Array4To3(p1, p2, time){

	var res= [
		p1[0] + (p2[0] - p1[0]) * time,
		p1[1] + (p2[1] - p1[1]) * time,
		p1[2] + (p2[2] - p1[2]) * time
	];

	return res;
};

function transition_curved_vector3(p1, p2, time){

	var res= {
		x: p1.x + (p2.x - p1.x) * time,
		y: p1.y + (p2.y - p1.y) * time + 2 * (1 - Math.abs(time - 0.5)/0.5),
		z: p1.z + (p2.z - p1.z) * time
	}

	return res;
};

function copyVector3(v){
  
  return {x: v.x, y: v.y, z:v.z};
};