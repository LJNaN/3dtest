<template>
  <div id="container"></div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import PowerSphere from '../assets/powerSphereBeggar/index'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Reflector } from './Reflector';

const Bol3D = THREE

export default {
  name: 'lineFloating',
  data() {
    return {}
  },
  mounted() {
    const container = document.getElementById('container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 10000);
    camera.position.set(0, 100, 100);

    const gridHelper = new THREE.GridHelper(20);
    scene.add(gridHelper);
    window.scene = scene

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    // 光源
    scene.add(new THREE.AmbientLight(0xffffff));

    // 地板
    const planeG = new THREE.PlaneGeometry(1000, 1000)
    const planeM = new THREE.MeshBasicMaterial({ color: 0x888888 })
    const plane = new THREE.Mesh(planeG, planeM)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)

    const selects = []

    // ======================================================================
    // 模板
    const shaderConfigTemplate = {
      uniform: {
        iTime: { value: 0 }
      },
      vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
      // 片元着色器
      fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float iTime;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;
  
        void main() {
          x = vPosition.x / 1.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 1.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 1.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
    }

    // ========================================shader========================
    // 星球
    let geo1 = null
    let mat1 = null
    let mesh1 = null
    initShader1()
    function initShader1() {
      geo1 = new THREE.BoxGeometry(10, 10, 10)
      mat1 = new THREE.ShaderMaterial()

      const shaderConfigTemplate = {
        uniform: {
          iTime: { value: 0 }
        },
        vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
        // 片元着色器
        fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float iTime;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;
  
        void main() {
          x = vPosition.x / 1.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 1.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 1.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
      }

      const shaderConfig = {
        uniform: {
          iTime: { value: 0 }
        },
        vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
        // 片元着色器
        fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float iTime;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;
  
        
        #define NUM_NOISE_OCTAVES 10
        #define PLANET_SIZE		0.75
        #define SMOOTH
  
  
        float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
        float noise(vec3 x) {
        const vec3 step = vec3(110, 241, 171);
        vec3 i = floor(x);
        vec3 f = fract(x);
        float n = dot(i, step);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
        mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
        mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
        mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
        }
  
        float fbm(vec3 x) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100);
        for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
        }
        return v;
        }
  
        const float pi          = 3.1415926535;
        const float inf         = 9999999.9;
        float square(float x) { return x * x; }
        float infIfNegative(float x) { return (x >= 0.0) ? x : inf; }
  
        float intersectSphere(vec3 C, float r, vec3 P, vec3 w) {	
        vec3 v = P - C;
        float b = -dot(w, v);
        float c = dot(v, v) - square(r);
        float d = (square(b) - c);
        if (d < 0.0) { return inf; }	
        float dsqrt = sqrt(d);
  
        return min(infIfNegative((b - dsqrt)), infIfNegative((b + dsqrt)));
        }
  
        float max33 (vec3 v) {
          return max (max (v.x, v.y), v.z);
        }
  
        vec3 getColorForCoord(vec2 fragCoord) {
        vec3 q = vec3(0.0);
        vec3 r = vec3(0.0);
        float v = 0.0;
        vec3 color = vec3(0.0);
  
        float theta = iTime * 0.15;  
        mat3 rot = mat3(
        cos(theta), 0, sin(theta),	// column 1
        0, 1, 0,	                // column 2
        -sin(theta), 0, cos(theta)	// column 3
        );
  
        const float verticalFieldOfView = 25.0 * pi / 180.0;
  
        vec3 P = vec3(0.0, 0.0, 5.0);
        vec3 w = normalize(vec3(fragCoord.xy * 1.0 - 0.5, 1.0 / (-1.0 * tan(verticalFieldOfView / 1.0))));
        // vec3 w = normalize(vec3(fragCoord.xy - vUv.xy * 0.5, (vUv.y) / (-2.0 * tan(verticalFieldOfView / 2.0))));
  
        float t = intersectSphere(vec3(0, 0, 0), PLANET_SIZE, P, w);
  
        if (t < inf) {
        vec3 X = P + w*t;
  
        X = rot*X;
  
        q = vec3(fbm(X + 0.025*iTime), fbm(X), fbm(X));
        r = vec3(fbm(X + 1.0*q + 0.01*iTime), fbm(X + q), fbm(X + q));
        v = fbm(X + 5.0*r + iTime*0.005);
        } else {
        return vec3(0.0);
        }
  
        vec3 col_top = vec3(1.0, 1.0, 1.0);
        vec3 col_bot = vec3(0.0, 0.0, 0.0);
        vec3 col_mid1 = vec3(0.1, 0.2, 0.0);
        vec3 col_mid2 = vec3(0.7, 0.4, 0.3);
        vec3 col_mid3 = vec3(1.0, 0.4, 0.2);
  
        vec3 col_mid = mix(col_mid1, col_mid2, clamp(r, 0.0, 1.0));
        col_mid = mix(col_mid, col_mid3, clamp(q, 0.0, 1.0));
        col_mid = col_mid;
  
        float pos = v * 2.0 - 1.0;
        color = mix(col_mid, col_top, clamp(pos, 0.0, 1.0));
        color = mix(color, col_bot, clamp(-pos, 0.0, 1.0));
  
        color = color / max33(color);
  
        color = (clamp((0.4 * pow(v,3.) + pow(v,2.) + 0.5*v), 0.0, 1.0) * 0.9 + 0.1) * color;
  
        float diffuse = max(0.0, dot(P + w*t, vec3(1.0, sqrt(0.5), 1.0)));
        float ambient = 0.1;
        color *= clamp((diffuse + ambient), 0.0, 1.0);
  
        #ifdef SMOOTH
        color *= (P + w*t).z * 2.0;
        #endif    
  
        return color;
        }
  
  
        void main() {
          x = vPosition.x / 10.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 10.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 10.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          // gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);
  
          
          vec2 fragCoord = vUv;
  
          float color_alpha = getColorForCoord(fragCoord).r + getColorForCoord(fragCoord).g + getColorForCoord(fragCoord).b;
  
          #ifdef SHARPEN 
          gl_FragColor = vec4(getColorForCoord(fragCoord) * 3. -
            getColorForCoord(fragCoord + vec2(1.0, 0.0)) * 0.5 -
            getColorForCoord(fragCoord + vec2(0.0, 1.0)) * 0.5 -
            getColorForCoord(fragCoord - vec2(1.0, 0.0)) * 0.5 -
            getColorForCoord(fragCoord - vec2(0.0, 1.0)) * 0.5, 1.0);
            
          #else
  
          gl_FragColor = vec4(getColorForCoord(fragCoord), 1.0);
          #endif
  
  
          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
      }
      mat1.uniforms = shaderConfig.uniform
      mat1.vertexShader = shaderConfig.vertexShader
      mat1.fragmentShader = shaderConfig.fragmentShader
      mat1.transparent = true
      mat1.side = 2
      mesh1 = new THREE.Mesh(geo1, mat1)
      scene.add(mesh1)
      selects.push(mesh1)
    }





    // ========================================================================
    // 飞线
    class FlyLine {
      // 输出实例
      flyLine = null

      // 基本属性
      source = { x: 0, y: 0, z: 0 } // 开始位置
      target = { x: 100, y: 100, z: 100 } // 目标位置
      range = 100 // 流线拖尾长度
      height = 100 // 流线能跳多高，与 target.y 相同的话效果就是( 终点.y - 起点.y )的 1.5 倍高
      color = '#00ffff' // 颜色
      size = 30 // 粒子大小
      density = 2.0 // 粒子密度
      speed = 1.0 // 速度 需要与 gap 配合调整
      gap = 1.1 // 流线出现间隔 (大于等于1) 需要与 speed 配合调整



      constructor(option = {}) {
        const { source, target, range, height, color, speed, size, density, gap } = option
        if (source) this.source = source
        if (target) this.target = target
        if (range) this.range = range
        if (height) this.height = height
        if (color) this.color = color
        if (speed) this.speed = speed
        if (size) this.size = size
        if (density) this.density = density
        if (gap) this.gap = gap

        this.flyLine = this.init()
      }

      init() {
        const positions = []
        const attrPositions = []
        const attrCindex = []
        const attrCnumber = []

        const _source = new Bol3D.Vector3(this.source.x, this.source.y, this.source.z)
        const _target = new Bol3D.Vector3(this.target.x, this.target.y, this.target.z)
        const _center = _target.clone().lerp(_source, 0.5)
        _center.y += this.height

        const number = parseInt(_source.distanceTo(_center) + _target.distanceTo(_center)) * this.density
        const curve = new Bol3D.QuadraticBezierCurve3(
          _source,
          _center,
          _target
        )

        const points = curve.getPoints(number);
        // 粒子位置计算 
        points.forEach((elem, i) => {
          const index = i / (number - 1);
          positions.push({
            x: elem.x,
            y: elem.y,
            z: elem.z
          });
          attrCindex.push(index);
          attrCnumber.push(i);
        })


        positions.forEach((p) => {
          attrPositions.push(p.x, p.y, p.z);
        })

        const geometry = new Bol3D.BufferGeometry();

        geometry.setAttribute('position', new Bol3D.Float32BufferAttribute(attrPositions, 3));
        // 传递当前所在位置
        geometry.setAttribute('index', new Bol3D.Float32BufferAttribute(attrCindex, 1));
        geometry.setAttribute('current', new Bol3D.Float32BufferAttribute(attrCnumber, 1));

        const shader = new Bol3D.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          depthTest: false,
          blending: Bol3D.AdditiveBlending,
          uniforms: {
            uColor: {
              value: new Bol3D.Color(this.color) // 颜色
            },
            uRange: {
              value: this.range
            },
            uSize: {
              value: this.size
            },
            uTotal: {
              value: number
            },
            uGap: {
              value: this.gap
            },
            uSpeed: {
              value: this.speed
            },
            time: {
              value: 0
            }
          },
          vertexShader: `
          attribute float index;
          attribute float current;
          uniform float time;
          uniform float uSize; // 大小
          uniform float uRange; // 展示区间
          uniform float uTotal; // 粒子总数
          uniform float uSpeed; // 速度
          uniform float uGap; // 间隔
          uniform vec3 uColor; // 颜色
          
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
              // 需要当前显示的索引
              float size = uSize;
              float showNumber = uTotal * mod(time, uGap) * uSpeed;
              if (showNumber > current && showNumber < current + uRange) {
                  float uIndex = ((current + uRange) - showNumber) / uRange;
                  size *= uIndex;
                  vOpacity = 1.0;
              } else {
                  vOpacity = 0.0;
              }

              // 顶点着色器计算后的Position
              vColor = uColor;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition; 
              // 大小
              gl_PointSize = size * 30.0 / (-mvPosition.z);
          }`,
          fragmentShader: `
          varying vec3 vColor; 
          varying float vOpacity;
          void main() {
              gl_FragColor = vec4(vColor, vOpacity);
          }`
        });

        const point = new Bol3D.Points(geometry, shader);
        return point
      }

      animation(elapsedTime) {
        this.flyLine.material.uniforms.time.value = elapsedTime
      }
    }
    const flyline1 = new FlyLine
    scene.add(flyline1.flyLine)


    // ========================================================================
    // 扫描线
    let geo2 = null
    let mat2 = null
    let mesh2 = null
    initShader2()
    function initShader2() {
      geo2 = new THREE.SphereGeometry(5, 64, 64)
      mat2 = new THREE.ShaderMaterial()

      const shaderConfig = {
        uniform: {
          iTime: { value: 0 }
        },
        vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
        // 片元着色器
        fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float iTime;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;
  
        void main() {
          x = vPosition.x / 10.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 10.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 10.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          // gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);

          vec2 uv = vec2(x,y);
    
          float y = mod(iTime / 1.0, 2.0) - 0.5 ;
          float str = -pow((uv.y - y) * 110., 2.) + .8;
          uv.x -= clamp(str * .01, 0., 1.);
          
          float colorAdd = pow(1. - pow(abs(uv.y - y), .3), 3.);
          gl_FragColor = vec4(0.3, 0.3, 0.3 ,1.0);
          
          gl_FragColor.g += colorAdd * 1.0;
          gl_FragColor.b += colorAdd * 1.0;
          // gl_FragColor.r = colorAdd * 1.0;
  
  
          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
      }
      mat2.uniforms = shaderConfig.uniform
      mat2.vertexShader = shaderConfig.vertexShader
      mat2.fragmentShader = shaderConfig.fragmentShader
      mat2.transparent = true
      mat2.side = 2
      mesh2 = new THREE.Mesh(geo2, mat2)
      mesh2.position.set(15, 0, 0)
      scene.add(mesh2)



    }



    // ========================================================================
    // 能量球
    const powerSphere = new PowerSphere({ half: false })

    powerSphere.sphere.renderOrder = 2



    // ========================================================================
    // 右边那个原型波浪扩散立方体
    const abaaba = {
      uniform: {
        color: { value: new THREE.Color('#00ffff') },
        opacity: { value: 1 },
        uSpeed: { value: 0.25 },
        uSge: { value: 3 },
        uRadius: { value: 5 },
        time: { value: 0 }
      },
      vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
      // 片元着色器
      fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        uniform float uSpeed;
        uniform float uSge;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;

        // float PI = 3.14159265;
        float drawCircle(float index, float range) {
            float opaa = 1.0;
            if (index >= 1.0 - range) {
              opaa = 1.0 - (index - (1.0 - range)) / range;
            } else if(index <= range) {
              opaa = index / range;
            }
            return opaa;
        }
        float distanceTo(vec2 src, vec2 dst) {
            float dx = src.x - dst.x;
            float dy = src.y - dst.y;
            float dv = dx * dx + dy * dy;
            return sqrt(dv);
        }
  
        void main() {
          x = vPosition.x / 1.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 1.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 1.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          // gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);

          float iTime = -time * uSpeed;
          float opa = 0.0;
          float len = distanceTo(vec2(0.5, 0.5), vec2(vUv.x, vUv.y));

          float size = 1.0 / uSge;
          vec2 range = vec2(0.65, 0.85);
          float index = mod(iTime + len, size);

          if (index < size && len <= 0.5) {
              float i = sin(index / size * PI);

              // 处理边缘锯齿
              if (i >= range.x && i <= range.y){
                  // 归一
                  float t = (i - range.x) / (range.y - range.x);
                  // 边缘锯齿范围
                  float r = 0.3;
                  opa = drawCircle(t, r);

              }
              // 渐变
              opa *=  1.0 - len / 0.5;
          };

          if( opacity * opa <= 0.0){
            discard;
          }else{
            gl_FragColor = vec4(color, opacity * opa);
          }

          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
    }

    let geo3 = new THREE.BoxGeometry(10, 10, 10)
    let mat3 = new THREE.ShaderMaterial()
    mat3.uniforms = abaaba.uniform
    mat3.vertexShader = abaaba.vertexShader
    mat3.fragmentShader = abaaba.fragmentShader
    mat3.transparent = true
    mat3.side = 2
    const mesh3 = new THREE.Mesh(geo3, mat3)
    mesh3.position.set(30, 5, 0)
    scene.add(mesh3)
    // Instantiate a loader
    const loader = new GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    // Load a glTF resource
    loader.load(
      // resource URL
      '/dsa.glb',
      // called when the resource is loaded
      function (gltf) {
        gltf.scene.scale.set(5, 5, 5)
        gltf.scene.position.set(-200, -20, 75)
        gltf.scene.children[0].material = mat3

        scene.add(gltf.scene)
      }
    )



    // ========================================================================
    // 扩散
    let mesh4 = null
    let shanghaiMainModelMaterial = new THREE.ShaderMaterial()
    new FBXLoader().load('./shanghai.FBX', obj => {
      obj.scale.set(0.1, 0.1, 0.1)
      obj.position.set(-150, -1.5, -50)
      const LANDMASS = obj.children.find(e => e.name === 'LANDMASS')
      LANDMASS.visible = false
      const shanghaiMainModel = obj.children.find(e => e.name === 'CITY_UNTRIANGULATED')
      shanghaiMainModel.geometry.computeBoundingBox()
      shanghaiMainModel.geometry.computeBoundingSphere()
      const { center, radius } = shanghaiMainModel.geometry.boundingSphere
      const { max, min } = shanghaiMainModel.geometry.boundingBox
      const size = new THREE.Vector3(max.x - min.x, max.y - min.y, max.z - min.z)

      const shaderConfig = {
        uniform: {
          time: { value: 0 },
          uCenter: { value: center }, // 模型中心点
          uSize: { value: size }, // 模型尺寸
          uTopColor: { value: new THREE.Color('#00ffff') }, // 越往上越靠近这个颜色
          uRadius: { value: radius / 1.4 }, // 扩散光的半径
          uDiffusion: {
            value: new THREE.Vector3(
              1, // 0 1开关
              200, // 扩散光的粗细
              600 // 速度
            )
          },
          // 扩散中心点
          uDiffusionCenter: {
            value: new THREE.Vector3(
              0, 0, 0
            )
          },
          uColor: { value: new THREE.Color("#00ffff") }, // 扩散的颜色
          uModRange: { value: 6 }, // 密度
          uModWidth: { value: 1.5 } // 线条粗细
        },
        vertexShader: `
        // 解决深度问题
        #include <logdepthbuf_pars_vertex>
        #include <common>
  
        // 获取时间 颜色 位置 uv信息等基本属性
        uniform float iTime;
        varying vec3 vColor;
        varying vec3 vPosition;
        varying vec2 vUv;
  
        
        void main() { 
          // 输出位置 uv信息
          vPosition = vec3(position.x, position.y, position.z);
          vUv = vec2(uv.x, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
  
          // 解决深度问题
          #include <logdepthbuf_vertex>
        } 
      `,
        // 片元着色器
        fragmentShader: ` 
        // 解决深度问题
        #include <logdepthbuf_pars_fragment>
        #include <common>
  
        // 接收位置
        uniform float time;
        uniform vec3 uCenter;
        uniform vec3 uSize;
        uniform vec3 uTopColor;
        uniform vec3 uDiffusion;
        uniform vec3 uDiffusionCenter;
        uniform vec3 uColor;
        uniform float uRadius;
        uniform float uModRange;
        uniform float uModWidth;
        varying vec3 vPosition;
        varying vec2 vUv;
        float x;
        float y;
        float z;

        float distanceTo(vec2 src, vec2 dst) {
          float dx = src.x - dst.x;
          float dy = src.y - dst.y;
          float dv = dx * dx + dy * dy;
          return sqrt(dv);
        }

        float lerp(float x, float y, float t) {
          return (1.0 - t) * x + t * y;
        }

        vec3 getGradientColor(vec3 color1, vec3 color2, float index) {
          float r = lerp(color1.r, color2.r, index);
          float g = lerp(color1.g, color2.g, index);
          float b = lerp(color1.b, color2.b, index);
          return vec3(r, g, b);
        }

      
        void main() {
          x = vPosition.x / 1.0 + 0.5;  // 除以模型长宽高的 x  +0.5是让坐标系变为0-1(居中)
          y = vPosition.y / 1.0 + 0.5;  // 除以模型长宽高的 y  +0.5是让坐标系变为0-1(居中)
          z = vPosition.z / 1.0 + 0.5;  // 除以模型长宽高的 z  +0.5是让坐标系变为0-1(居中)
  
          // 用 position 位置信息
          // gl_FragColor = vec4(x, y, z, 1.0);
  
          // 用 uv 信息
          // gl_FragColor = vec4(vUv.x, 0.8, vUv.y, 1.0);

          vec3 distColor = vec3(1.0, 1.0, 1.0);
          float dstOpacity = 1.0;
          
          float indexMix = z / (uSize.z * 0.6);
          distColor = mix(distColor, uTopColor, indexMix);

          // 开启扩散波
          vec2 position2D = vec2(x, y);
          float mx = mod(x, uModRange);
          float my = mod(y, uModRange);
          float mz = mod(z, uModRange);

          if (uDiffusion.x > 0.5) {
            // 扩散速度
            float dTime = mod(time * uDiffusion.z, uRadius * 2.0);
            // 当前的离中心点距离
            float uLen = distanceTo(position2D, vec2(uCenter.x, uCenter.z));

            // 扩散范围
            if (uLen < dTime && uLen > dTime - uDiffusion.y) {
              // 颜色渐变
              float dIndex = sin((dTime - uLen) / uDiffusion.y * PI);
              distColor = mix(uColor, distColor, 1.0 - dIndex);
            }

            // 扫描中间格子
            if (uLen < dTime) {
              if (mx < uModWidth || my < uModWidth || mz < uModWidth ) {
                distColor = vec3(0.7);
              }
            }
          }

          gl_FragColor = vec4(distColor, dstOpacity * time);

          // 解决深度问题
          #include <logdepthbuf_fragment>
        }
      `
      }
      shanghaiMainModelMaterial.uniforms = shaderConfig.uniform
      shanghaiMainModelMaterial.vertexShader = shaderConfig.vertexShader
      shanghaiMainModelMaterial.fragmentShader = shaderConfig.fragmentShader
      shanghaiMainModel.material = shanghaiMainModelMaterial


      mesh4 = obj
      scene.add(obj)
    });

    // ========================================================================
    // 挖煤的粒子
    class BladePoints {
      constructor(particleCount = 200, imageUrl = '') {
        this.velocities = null
        this.imageUrl = imageUrl
        this.particleCount = particleCount
        this.particlesGeometry = null
        this.point = {}
        this.play = true
        // 设置初始速度和时间
        this.initialVelocities = new Float32Array(this.particleCount).fill(0).map(() => Math.random() * 2);
        this.times = new Float32Array(this.particleCount).fill(0);
        // 重力
        this.gravity = -9.81 * 2;
        this.init()
      }
      init() {
        this.createPoints()
        this.animation()
      }
      createPoints() {
        this.particlesGeometry = new Bol3D.BufferGeometry();
        let particleCount = this.particleCount
        const positions = new Float32Array(particleCount * 3);
        this.velocities = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
          positions[i] = (Math.random() - 0.5) * 5;
          positions[i + 1] = (Math.random() - 0.5) * 10;
          positions[i + 2] = (Math.random() - 0.5) * 5;
          this.velocities[i] = 0;
          this.velocities[i + 1] = 0;
          this.velocities[i + 2] = 0;
        }

        const sizes = new Float32Array(particleCount);
        // 设置粒子大小范围为0.05到1.5
        for (let i = 0; i < particleCount; i++) {
          sizes[i] = Math.random() * 5 + 0.3;
        }
        this.particlesGeometry.setAttribute('size', new Bol3D.BufferAttribute(sizes, 1));

        this.particlesGeometry.setAttribute('position', new Bol3D.BufferAttribute(positions, 3));

        // 加载贴图
        const textureLoader = new Bol3D.TextureLoader();
        const particleTexture = textureLoader.load(this.imageUrl);

        // 创建粒子材质，并设置贴图
        const vertexShader = `
    #include <logdepthbuf_pars_vertex>
    #include <common>

    attribute float size;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;

        #include <logdepthbuf_vertex>
    }
    
  `;

        const fragmentShader = `
    #include <logdepthbuf_pars_fragment>
    #include <common>
    uniform sampler2D pointTexture;
    varying vec2 vUv;
    void main() {
        vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
        // if (textureColor.a < 0.5) discard;
        gl_FragColor = vec4(textureColor.r * 1.0, textureColor.g * 1.0, textureColor.b * 1.0, textureColor.a);
        #include <logdepthbuf_fragment>
    }
  `;

        const particleMaterial = new Bol3D.ShaderMaterial({
          uniforms: {
            pointTexture: { value: particleTexture },
          },
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          alphaToCoverage: true,
          transparent: true
        });

        const particles = new Bol3D.Points(this.particlesGeometry, particleMaterial);
        this.point = particles
      }
      animation() {
        if (this.point != null) {
          // 更新粒子位置
          for (let i = 0; i < this.particleCount; i++) {
            const pos = this.particlesGeometry.attributes.position;
            const currentPosition = new Bol3D.Vector3(pos.array[i * 3], pos.array[i * 3 + 1], pos.array[i * 3 + 2]);

            // 更新速度
            const velocity = this.initialVelocities[i] + (this.gravity * this.times[i]);
            this.velocities[i * 3 + 1] = velocity;

            // 添加随机横向扩散（从立方体中心向四周扩散）
            const direction = new Bol3D.Vector3(pos.array[i * 3], 0, pos.array[i * 3 + 2]).normalize();
            const spreadSpeed = Math.random() * 0.6;
            const spreadVector = direction.multiplyScalar(spreadSpeed);

            currentPosition.add(new Bol3D.Vector3(spreadVector.x, this.velocities[i * 3 + 1] * 0.016, spreadVector.z));
            pos.array[i * 3] = currentPosition.x;
            pos.array[i * 3 + 1] = currentPosition.y;
            pos.array[i * 3 + 2] = currentPosition.z;

            // 如果粒子达到一定高度，将其重新设置回初始位置
            if (this.play) {
              if (!this.point.visible) this.point.visible = true
              if (currentPosition.y < -10) {
                pos.array[i * 3] = (Math.random() - 0.5) * 5;
                pos.array[i * 3 + 1] = (Math.random() - 0.5) * 10;
                pos.array[i * 3 + 2] = (Math.random() - 0.5) * 5;
                this.times[i] = 0;
                this.initialVelocities[i] = Math.random() * 2;
              } else {
                this.times[i] += 0.1;
              }
            } else {
              this.times[i] += 0.1;
              if (this.point.visible && currentPosition.y < -50) this.point.visible = false
            }
          }

          this.particlesGeometry.attributes.position.needsUpdate = true;



          requestAnimationFrame(this.animation.bind(this));
        }
      }
    }
    const bladePoint = new BladePoints(200, './3.png')
    bladePoint.point.position.set(50, 20, 50)
    const bladePoint1 = new BladePoints(200, './2.png')
    bladePoint1.point.position.set(50, 20, 50)

    scene.add(bladePoint.point);
    scene.add(bladePoint1.point);


    // ========================================================================
    // copyFramebufferToTexture

    const dpr = window.devicePixelRatio;
    const textureSize = [window.innerWidth, window.innerHeight];

    const framebufferToTexture = new THREE.FramebufferTexture(textureSize[0], textureSize[1], THREE.RGBAFormat);

    const geo4 = new THREE.BoxGeometry(19.2, 10, 10.8)
    const mat4 = new THREE.MeshBasicMaterial({ map: framebufferToTexture })
    mat4.needsUpdate = true
    const cube4 = new THREE.Mesh(geo4, mat4)
    scene.add(cube4)
    cube4.position.set(50, 5, 10)


    // ========================================================================
    // 镜子
    const reflector = new Reflector(new THREE.PlaneGeometry(100, 100), {
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      blur: 0.3
    });

    reflector.position.set(0, 50, 0)

    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.addEventListener('dragging-changed', function (event) {
      controls.enabled = !event.value;
    });
    scene.add(transformControls)
    // transformControls.attach(reflector)
    // 将反射器添加到场景中
    scene.add(reflector);


    // ========================================================================
    // tween
    window.THREE = THREE

    const geo5 = new THREE.BoxGeometry(10, 10, 10)
    const mat5 = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    const box5 = new THREE.Mesh(geo5, mat5)
    scene.add(box5)
    box5.position.set(100, 10, 50)
    // transformControls.attach(box5)

    const geo6 = new THREE.BoxGeometry(10, 10, 10)
    const mat6 = new THREE.MeshBasicMaterial({ color: 0xff00ff })
    const box6 = new THREE.Mesh(geo6, mat6)
    scene.add(box6)
    box6.position.set(120, 10, -120)

    const tween1 = new TWEEN.Tween(box6.position)
    tween1.to(box5.position)
    tween1.dynamic(true)
    tween1.easing(TWEEN.Easing.Quadratic.InOut)
    tween1.duration(3000)
    tween1.start()

    // const tween2 = new TWEEN.Tween(box5.position)
    // tween2.to({
    //   x: -50
    // })
    // tween2.duration(3000)
    // tween2.start()

    // ========================================================================
    // xx

    const loader2 = new GLTFLoader();
    const dracoLoader2 = new DRACOLoader();
    dracoLoader2.setDecoderPath('/draco/');
    loader2.setDRACOLoader(dracoLoader2);

    // Load a glTF resource
    loader2.load(
      // resource URL
      '/FOSB.glb',
      // called when the resource is loaded
      function (gltf) {
        console.log('gltf: ', gltf);
        gltf.scene.scale.set(50, 50, 50)
        gltf.scene.position.set(0, 0, 2)

        scene.add(gltf.scene)

        transformControls.attach(gltf.scene)
      }
    )


    // ========================================================================
    // render
    var clock = new THREE.Clock()
    var dt = 0


    render();
    function render() {

      TWEEN.update()
      renderer.setAnimationLoop(render);
      dt = clock.getElapsedTime()
      // dt = clock.getDelta()

      mat1.uniforms.iTime.value = dt
      mat2.uniforms.iTime.value = dt
      mat3.uniforms.time.value = dt
      if (shanghaiMainModelMaterial?.uniforms?.time) {
        shanghaiMainModelMaterial.uniforms.time.value = dt
      }
      flyline1.animation(dt)
      powerSphere.animation(dt)
      controls.update()

      renderer.render(scene, camera);
      renderer.copyFramebufferToTexture(new THREE.Vector2(0, 0), framebufferToTexture);
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  overflow: hidden;
  font-family: Lato, sans-serif;
  width: 100%;
  height: 100%;
  background-color: #dedede;
  color: #202020;
  padding: 20px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, .5);
}

#container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
</style>