#version 300 es
precision mediump float;

uniform sampler2D u_texLeft, u_texRight;

in vec2 v_texCoord;
out vec4 fragColor;

void main(){
  float x = v_texCoord.x;
  if (x < 0.5) {
    fragColor = texture(u_texLeft,  vec2(x*2.0, v_texCoord.y));
  } else {
    fragColor = texture(u_texRight, vec2((x-0.5)*2.0, v_texCoord.y));
  }
}
