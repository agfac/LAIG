function Component(scene){

	CGFobject.call(this, scene);

	this.scene = scene;

	//Id
	this.id = "";

	//Texture
	this.texture = "none";

	//Materials
	this.material = null;
	this.materials = [];
	this.indexMaterial = 0;
	this.materialChanged = false;

	//Transformations
	this.matrix = mat4.create();

	//Primitives
	this.primitives = [];

	//PrimitivesRefs
	this.primitivesID = [];

	//Components
	this.components = [];

	//ComponentsRefs
	this.componentsID = [];
};

Component.prototype = Object.create(CGFobject.prototype);
Component.prototype.constructor = Component;

Component.prototype.display = function(material, texture){

	this.scene.pushMatrix();
	this.scene.multMatrix(this.matrix);

	var mat = this.material;

	if(this.material == "inherit")
		mat = material;

	var tex = this.texture;
	switch(tex){
		case "none":
			tex = null;
			break;
		case "inherit":
			tex = texture;
			break;
	}

	for(var i = 0; i < this.components.length; i++){
		if(tex != null)
			mat.setTexture(tex.texFile)
		else
			mat.setTexture(tex);
		mat.apply();

		if(this.components[i] != null)
			this.components[i].display(mat,tex);
	}

	if(tex != null)
		mat.setTexture(tex.texFile);
	else
		mat.setTexture(tex);
	mat.apply();

	for(var i = 0; i < this.primitives.length; i++){
		if(tex != null)
			if(this.primitives[i].updateTexCoords != null)
				this.primitives[i].updateTexCoords(tex.length_s, tex.length_t);

		this.primitives[i].display(null, null);
	}

	this.scene.popMatrix();
};

Component.prototype.changeMaterial = function(){

	if(this.indexMaterial < this.materials.length - 1)
		this.indexMaterial++;
	else
		this.indexMaterial = 0;

	this.material = this.materials[this.indexMaterial];
};