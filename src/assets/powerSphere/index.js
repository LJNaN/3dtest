import * as THREE from 'three'
import * as TWEEN from 'three/examples/jsm/libs/tween.module.min.js'
import { shader as depthVertexShader } from './depth-vs.js'
import { shader as depthFragmentShader } from './depth-fs.js'
import { shader as spheredVertexShader } from './sphere-vs.js'
import { shader as spheredFragmentShader } from './sphere-fs.js'

export default class PowerSphere {
  // 客制化属性
  color = '#007777'
  radius = 30
  speed = 0.2
  half = true
  textureEnabled = false
  textureUrl = './noise1.png'
  textureSpeed = 5

  // 场景属性
  scene = null
  camera = null
  renderer = null
  controls = null

  // 几何体
  sphere = null
  minRadius = 3

  // WebGlRender的属性
  depthMaterial = null
  depth = null
  hdr = null

  // tween
  TWEEN = TWEEN.TWEEN

  constructor(object, option = {}) {
    // 覆盖原有属性
    const { scene, camera, renderer, controls } = object
    const { color, radius, speed, half, textureEnabled, textureUrl, textureSpeed, } = option
    if (scene) this.scene = scene
    if (camera) this.camera = camera
    if (renderer) this.renderer = renderer
    if (controls) this.controls = controls
    if (color) this.color = color
    if (radius) this.radius = radius
    if (speed) this.speed = speed
    if (half) this.half = half
    if (textureEnabled) this.textureEnabled = textureEnabled
    if (textureUrl) this.textureUrl = textureUrl
    if (textureSpeed) this.textureSpeed = textureSpeed

    // weblglrender
    this.depthMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        radius: {
          value: this.minRadius
        }
      },
      vertexShader: depthVertexShader,
      fragmentShader: depthFragmentShader,
    })
    this.depth = new THREE.WebGLRenderTarget(1, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: true
    })
    this.hdr = new THREE.WebGLRenderTarget(1, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      stencilBuffer: false,
      depthBuffer: true
    })

    // sphere
    let texture = null
    if (this.textureEnabled) {
      const textureLoader = new THREE.TextureLoader()
      texture = textureLoader.load('./noise1.png')
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    }
    const spheredGeometry = new THREE.SphereBufferGeometry(this.minRadius, 128, 128)
    let myColor = new THREE.Color(this.color)
    const spheredMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        depthBuffer: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        bufColor: { value: null },
        u_tex: { value: null },
        time: { value: 0 },
        radius: { value: this.minRadius },
        myColor: { value: myColor },
        progress: { value: 0 },
        halfSphere: { value: this.half ? 1 : 0 }
      },
      vertexShader: spheredVertexShader,
      fragmentShader: spheredFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
    this.sphere = new THREE.Mesh(spheredGeometry, spheredMaterial)
    this.sphere.position.set(10, 0, 10)
    this.sphere.material.uniforms.depthBuffer.value = this.depth.texture
    this.sphere.material.uniforms.bufColor.value = this.depth.texture
    this.sphere.material.uniforms.u_tex.value = texture
    scene.add(this.sphere)

    this.resize()
  }

  resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    const dPR = window.devicePixelRatio
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.depth.setSize(width * dPR, height * dPR)
    this.hdr.setSize(width * dPR, height * dPR)
    this.sphere.material.uniforms.resolution.value.set(width * dPR, height * dPR)
  }

  animation1(dt) {
    this.sphere.visible = false
    this.scene.overrideMaterial = this.depthMaterial

    this.renderer.setRenderTarget(this.depth)
    this.renderer.render(this.scene, this.camera)

    this.sphere.visible = true
    this.scene.overrideMaterial = null
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)
    this.TWEEN.update()
    this.controls.update()

    const scale = (dt / (1 / this.speed) % 1.0 + 0.1) * (this.radius / this.minRadius)
    this.sphere.material.uniforms.time.value = dt * this.textureSpeed
    this.sphere.material.uniforms.radius.value = this.minRadius * scale / 3
    this.sphere.material.uniforms.progress.value = this.minRadius * scale / this.radius - 0.1

    this.depthMaterial.uniforms.radius.value = this.minRadius * scale / 3
    this.sphere.scale.set(scale, scale, scale)
  }
}