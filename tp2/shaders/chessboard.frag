#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;

varying vec2 vTextureCoord;
uniform vec2 size;

uniform vec2 selected;

uniform vec4 color1;
uniform vec4 color2;
uniform vec4 colorSel;

float grid(vec2 pos, vec2 dim){
    
    vec2 casas = dim;
    
    vec2 res = pos * casas;

    vec2 xy = vec2(mod(floor(res.x), 2.0),mod(floor(res.y), 2.0));

    float v = xy.x + xy.y;

    if(xy.x > 0.1 && xy.y > 0.1)
        v = 0.0;
    
    return v;
}

void main( void ) {

    vec2 position = vTextureCoord;
    
    vec4 pixelColor = texture2D(uSampler, vTextureCoord);

    float r = grid(vTextureCoord,size);
   
    vec4 overlay = r * color1 + (1.0-r) * color2;  
    
    vec2 res = position * size;

    float isSelect = 0.0;

    if(selected.x == floor(res.x) && selected.y == floor(res.y))
        isSelect = 1.0;

    if(isSelect > 0.1)
        overlay = colorSel;
    
    pixelColor.rgba *= overlay.rgba;

    gl_FragColor = pixelColor;
}