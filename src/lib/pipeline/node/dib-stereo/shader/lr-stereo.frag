#version 300 es
precision highp float;

uniform sampler2D u_color;
uniform sampler2D u_depth;        // R32F texture
uniform float     u_eyeSeparation;
uniform float     u_focusDistance; // normalized [0..1]
uniform float     u_gamma;

in vec2 v_texCoord;

layout(location=0) out vec4 outLeft;
layout(location=1) out vec4 outRight;

void main(){
  float dRaw = texture(u_depth, v_texCoord).r;
  float depth = pow(dRaw, u_gamma);
  float disp = u_eyeSeparation * (u_focusDistance - depth) / u_focusDistance;
  float shL  = -0.5 * disp;
  float shR  =  0.5 * disp;
  outLeft  = texture(u_color, v_texCoord + vec2(shL, 0.0));
  outRight = texture(u_color, v_texCoord + vec2(shR, 0.0));
}
