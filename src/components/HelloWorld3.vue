<template>
  <div id="container"></div>
  <div class="a">
  </div>
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
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    // 地板
    const planeG = new THREE.PlaneGeometry(1000, 1000)
    const textureLoader = new Bol3D.TextureLoader();
    const particleTexture = textureLoader.load('/5.png');
    const planeM = new THREE.MeshBasicMaterial({ color: 0x666666, map: particleTexture })
    const plane = new THREE.Mesh(planeG, planeM)
    plane.rotation.x = -Math.PI / 2
    scene.add(plane)




    // 测试罐子模型
    let model = null
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      '/GuanZi_Test.glb',
      function (gltf) {
        gltf.scene.scale.set(5, 5, 5)
        gltf.scene.position.y = 18
        scene.add(gltf.scene)
        model = gltf.scene

        const pian = model.children[0].children[0]
        console.log('pian: ', pian);

        const canvas = document.createElement('canvas')
        canvas.width = 1000
        canvas.height = 500
        const ctx = canvas.getContext('2d')
        ctx.font = "120px Arial"
        ctx.fillStyle = "red";
        ctx.fillText('1#油罐', 320, 400)



        let img2 = new Image()
        img2.src = '/4.png'
        img2.onload = () => {
          ctx.drawImage(img2, 250,0)

          const imgUrl = canvas.toDataURL()

          const img = new Image()
          img.src = imgUrl

          const a = document.getElementsByClassName('a')[0]
          a.appendChild(img)

          pian.material = pian.material.clone()
          pian.material.color.set(1, 1, 1)
          const textureLoader2 = new THREE.TextureLoader();
          const texture2 = textureLoader2.load(imgUrl)
          pian.material.transparent = true
          pian.material.opacity = 1
          pian.material.map = texture2


          // const g = new THREE.BoxGeometry(50, 50, 50)
          // const m = new THREE.MeshBasicMaterial({
          //   map: texture2,
          //   transparent: true,
          //   opacity: 0.5,
          //   side: THREE.DoubleSide
          // })
          // const box = new THREE.Mesh(g, m)
          // box.position.set(100, 26, 0)
          // scene.add(box)
        }






      }
    )





    // ========================================================================
    // render
    var clock = new THREE.Clock()
    var dt = 0


    render();
    function render() {
      renderer.setAnimationLoop(render);
      TWEEN.update()
      dt = clock.getElapsedTime()
      controls.update()

      renderer.render(scene, camera);
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

.a {
  position: fixed;
  left: 0;
  top: 0;
  width: 300px;
  height: 150px;

}

.a img {
  width: 100%;
}
</style>