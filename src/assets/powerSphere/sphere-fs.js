const shader = `#version 300 es


precision highp float;

// 解决深度问题
#include <logdepthbuf_pars_vertex>
#include <common>

#include <packing>

uniform sampler2D depthBuffer;
uniform vec2 resolution;
uniform float time;
uniform sampler2D u_tex;
uniform float radius;
uniform vec3 myColor;
uniform float progress;
uniform int halfSphere; 

in float vRim;
in vec2 vUv;
in float vDepth;

out vec4 color;

void main() {
    vec4 baseColor = vec4(myColor,0.1);
    // 基础色
    color = baseColor;
    

    // 动态纹理
    vec4 maskA = texture(u_tex, vUv);
    maskA.a = maskA.r;
    color += maskA;
    
    
    // 边界高亮
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 packedDepth = texture(depthBuffer, uv);
    float sceneDepth = unpackRGBAToDepth(packedDepth);
    float depth = (vDepth - .1) / ( radius * 50.0 -.1);
    float diff = abs(depth - sceneDepth);
    float contact = diff * 20.;
    contact = 1. - contact;
    contact = max(contact, 0.);
    contact = pow(contact, 20.);
    contact *= diff*1000.;
    float a = max(contact, vRim);
    float fade = 1. - pow(vRim, 10.);
    color += a * fade;

    if (halfSphere == 1 && vUv.y < 0.5) {
        discard;
    }

    
    // 透明度
    // color.a = -(progress-0.5) / sin((progress -0.5) * 6.0) + 1.15;
    color.a = -(progress-0.5) / sin((progress -0.5) * 6.0) + 1.0;

    // 解决深度问题
    #include <logdepthbuf_vertex>
}
`;

export { shader };