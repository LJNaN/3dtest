const shader = `
// 解决深度问题
#include <logdepthbuf_pars_vertex>
#include <common>

// 获取时间 颜色 位置 uv信息等基本属性
uniform float time;
uniform float targetRadius;
uniform float radius;
uniform float speed;
uniform float yScale;
varying vec3 vColor;
varying vec3 vPosition;
varying vec2 vUv;
varying float progress;

void main() { 
  // 输出位置 uv信息
  vPosition = vec3(position.x, position.y, position.z);

  vUv = vec2(uv.x, uv.y);
  vUv.x += time * 0.5 * speed; 
  vUv.y += time * 0.5 * speed; 
  float scale = mod((time / (1.0 / speed)), 1.0) * (targetRadius / radius);
  
  progress = radius * scale / targetRadius;
  
  vPosition.x *= scale;
  vPosition.y *= yScale * scale;
  vPosition.z *= scale;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);


  // 解决深度问题
  #include <logdepthbuf_vertex>
} 
`;

export { shader };
