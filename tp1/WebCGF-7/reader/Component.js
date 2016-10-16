function Component(){

	this.id;
	this.material = [];
	this.texture;
	this.transformationRef = [];
	this.localTransformations = mat4.create();
	mat4.identify(this.localTransformations);
	this.children = [];
	this.primitivesRef = [];
	this.componentsRef = [];
};

Component.prototype = Object.create(Object.prototype);
Component.prototype.constructor = Component;

//Set id node
Component.prototype.setId = function(id){
	this.id = id;
};

// Set material node
Component.prototype.setMaterial = function(material){
	this.material = material;
};

// Set texture node
Component.prototype.setTexture = function(texture){
	this.texture = texture;
};

// Add child to node
Component.prototype.pushChild = function(child){
	this.children.push(child);
};

// Applies a rotation on X axis
Component.prototype.rotateOnX = function(rad){
	mat4.rotateOnX(this.localTransformations, this.localTransformations, rad);
};

// Applies a rotation on Y axis
Component.prototype.rotateOnY = function(rad){
	mat4.rotateOnY(this.localTransformations, this.localTransformations, rad);
};

// Applies a rotation on Z axis
Component.prototype.rotateOnZ = function(rad){
	mat4.rotateOnZ(this.localTransformations, this.localTransformations, rad);
};

// Applies a scale to node
Component.prototype.scale = function(x, y, z){
	mat4.scale(this.localTransformations, this.localTransformations, vec3.fromValues(x,y,z));
};

// Applies a translation to node
Component.prototype.translate = function(x, y, z){
	mat4.translate(this.localTransformations, this.localTransformations, vec3.fromValues(x,y,z));
};

// Add primitiveRef
Component.prototype.addPrimitiveRef = function(primitiveRef){
	this.primitivesRef.push(primitiveRef);
};

// Set primitiveRef
Component.prototype.setPrimitivesRefs = function (primitivesRef) {
    this.primitivesRef = primitivesRef;
};

// Add componentRef
Component.prototype.addComponentRef = function(componentRef){
	this.componentsRef.push(componentRef);
};

// Set componentRef
Component.prototype.setComponentsRefs = function (componentsRef) {
    this.componentsRef = componentsRef;
};