#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler; //Referencia da textura

uniform float time;
uniform float pieceN;
uniform float number;

varying vec2 vTextureCoord; //Variavel recebida do vertex shader
varying float newY;

void main( void ) {

    vec4 texel = texture2D(uSampler,vTextureCoord);
    
    float m = 0.3;
    
    float velo = 3.0;
    
    float q = 0.1;
    
    q = clamp(q, 0.499999,0.5);
    
    float k = 0.0;

    if( newY*pieceN > 0.5)
      k = 1.0;

    float numberColor = clamp(abs(pieceN - k) + number, 0.0, 1.0);
    
    float numberColor2 = clamp(abs(pieceN - (1.0-k)) - number, 0.0, 1.0);
    
    gl_FragColor = vec4(numberColor ,numberColor2, 0.0,1.0);
}
