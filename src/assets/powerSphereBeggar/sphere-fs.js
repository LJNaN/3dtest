const shader = `

// 解决深度问题
#include <logdepthbuf_pars_vertex>
#include <common>

uniform float time;
uniform sampler2D u_tex;
uniform vec3 myColor;
uniform int halfSphere;
uniform float opacity;

varying vec3 vPosition;
varying vec2 vUv;
float x;
float y;
float z;

varying float progress;

void main() {
    x = vPosition.x / 1.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
    y = vPosition.y / 1.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
    z = vPosition.z / 1.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)

    // 用 position 位置信息
    // gl_FragColor = vec4(x, y, z, 1.0);

    // 用 uv 信息
    // gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);

    vec4 baseColor = vec4(myColor,0.1);
    // 基础色

    vec4 color = baseColor;

    // 动态纹理
    vec4 maskA = texture(u_tex, vUv);
    maskA.a = maskA.r;
    color += maskA;
    
    if (halfSphere == 1 && y < 0.5) {
        discard;
    }

    // 透明度
    color.a =(-(progress-0.5) / sin((progress -0.5) * 6.0) + 1.3) * opacity;
    gl_FragColor = color;

    // 解决深度问题
    #include <logdepthbuf_vertex>
}
`;

export { shader };