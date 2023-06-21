import * as THREE from 'three'
import { shader as spheredVertexShader } from './sphere-vs.js'
import { shader as spheredFragmentShader } from './sphere-fs.js'

export default class PowerSphere {
  // 客制化属性
  color = '#00ffff'
  radius = 30
  speed = 0.6
  half = true
  textureEnabled = true
  textureUrl = './noise1.png'
  textureSpeed = 5
  opacity = 0.7
  yScale = 0.8 // y轴压扁  缩放系数

  // 几何体
  sphere = null
  minRadius = 5

  constructor(option = {}) {
    // 覆盖原有属性
    const { color, radius, speed, half, textureEnabled, textureUrl, textureSpeed, opacity,yScale } = option
    
    
    this.color = color ?? this.color
    this.radius = radius ?? this.radius
    this.speed = speed ?? this.speed
    this.half = half ?? this.half
    this.textureEnabled = textureEnabled ?? this.textureEnabled
    this.textureUrl = textureUrl ?? this.textureUrl
    this.textureSpeed = textureSpeed ?? this.textureSpeed
    this.opacity = opacity ?? this.opacity
    this.yScale = yScale ?? this.yScale

    // sphere
    let texture = null
    if (this.textureEnabled) {
      const textureLoader = new THREE.TextureLoader()
      texture = textureLoader.load('./noise1.png')
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    }
    
    const spheredGeometry = new THREE.SphereGeometry(this.minRadius, 128, 128)
    let myColor = new THREE.Color(this.color)
    const spheredMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_tex: { value: null },
        time: { value: 0 },
        radius: { value: this.minRadius },
        targetRadius: {value: this.radius},
        myColor: { value: myColor },
        halfSphere: { value: this.half ? 1 : 0 },
        opacity: { value: this.opacity },
        speed: { value: this.speed },
        yScale: { value: this.yScale }
      },
      vertexShader: spheredVertexShader,
      fragmentShader: spheredFragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    })
    this.sphere = new THREE.Mesh(spheredGeometry, spheredMaterial)
    this.sphere.position.set(10, 0, 10)
    this.sphere.material.uniforms.u_tex.value = texture
    scene.add(this.sphere)
  }

  animation(dt) {
    this.sphere.material.uniforms.time.value = dt
  }
}