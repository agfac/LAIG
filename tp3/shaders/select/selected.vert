attribute vec3 aVertexPosition; //Valor default
attribute vec3 aVertexNormal; //Valor default
attribute vec2 aTextureCoord; //Valor default

uniform mat4 uMVMatrix; //Matrix relativa ao objecto
uniform mat4 uPMatrix; //Matrix relativa ao objecto
uniform mat4 uNMatrix; //Matrix relativa ao objecto

uniform float time;
uniform float inv;

varying vec2 vTextureCoord; //Parametro a ser partilhado com o fragment shader
varying float newY; //Parametro da nova altura do vertice para determinar a sua cor


void main( void ) {
	
	float pi = 3.14;
	
	float d = inv;

  	vec4 temp = uPMatrix * vec4(aVertexPosition, 1.0);

  	vec2 pos = temp.xz;

  	float waveFactor = 0.1;
  
  	float c = (time * 3.0 + pos.y);
  
  	newY = (1.0 + cos(c)) * 0.5;
  
  	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  
  	vTextureCoord = aTextureCoord;

}
