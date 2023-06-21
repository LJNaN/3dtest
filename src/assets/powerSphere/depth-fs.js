const shader = `#version 300 es

precision highp float;


// 解决深度问题
#include <logdepthbuf_pars_vertex>
#include <common>

#include <packing>

uniform float radius;

in vec2 vUv;
in float vDepth;

out vec4 color;

void main() {
  float depth = (vDepth - .1) / ( radius * 50.0 -.1);
  color = packDepthToRGBA(depth);

  
  // 解决深度问题
  #include <logdepthbuf_vertex>
}
`;

export { shader };
