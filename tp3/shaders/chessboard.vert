attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform vec2 size;

varying vec2 vTextureCoord;
uniform vec2 selected;
uniform float altura;

void main( void ) {
        
    vec2 res = aTextureCoord * size;
    
    float multi = 0.0;

	if(selected.x >= 0.0 && selected.y >= 0.0)
		if(selected.x <= floor(res.x - 0.0) && selected.y <= floor(res.y - 0.0))
			if(selected.x >= floor(res.x -0.1) && selected.y >= floor(res.y -0.1))
			multi = altura;

    vTextureCoord = aTextureCoord;
    
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + aVertexNormal * multi, 1.0);
}