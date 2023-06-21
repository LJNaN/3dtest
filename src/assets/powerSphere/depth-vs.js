const shader = `#version 300 es

// 解决深度问题
#include <logdepthbuf_pars_vertex>
#include <common>

precision highp float;

in vec3 position;
in vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float radius;

out vec2 vUv;
out float vDepth;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vDepth = gl_Position.z;

  
  // 解决深度问题
  #include <logdepthbuf_vertex>
}
`;

export { shader };