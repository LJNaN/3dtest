<template>
  <div id="container"></div>
  <div class="a"></div>
  <div class="b">
    <div class="b1"></div>
    <div class="fuckzh">
      <div class="b4"></div>
      <div class="b2" ref="b2" :style="{height: sliderValue + '%'}"></div>
    </div>
    <div class="b3"></div>

    <el-slider class="b5" v-model="sliderValue"></el-slider>
  </div>
</template>

<script setup>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import PowerSphere from '../assets/powerSphereBeggar/index'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import * as TWEEN from '@tweenjs/tween.js'
import { Reflector } from './Reflector';
import { ref, onMounted } from 'vue'

const Bol3D = THREE
const b2 = ref(null)

onMounted(() => {

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
      ctx.font = "bold 120px Arial"
      ctx.fillStyle = "#1e4f91";
      ctx.textAlign = 'center';
      ctx.fillText('1305_T_05', 500, 400)



      let img2 = new Image()
      img2.src = '/11.png'
      img2.onload = () => {
        ctx.drawImage(img2, 250, 80, 500, 160)

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

})

const sliderValue = ref(50)
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
  border: 1px solid red;

}

.a img {
  width: 100%;
}

.b {
  position: absolute;
  top: 30%;
  left: 5%;
  width: 50px;
  height: 250px;
}


.b1,
.b3 {
  position: absolute;
}

.b1 {
  background: url('/21.png') center / 100% 100% no-repeat;
  top: 1%;
  height: 99%;
  width: 100%;
}


.fuckzh {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.b2 {
  height: 100%;
  width: 70%;
  margin-left: 15%;
  margin-bottom: 20%;
  background: url('/22.png') center / 100% 100% no-repeat;
  transform-origin: bottom;
}

.b4 {
  background: url('/23.png') center / 100% 100% no-repeat;
  left: 0;
  width: 70%;
  margin-left: 15%;
  height: 4%;
  transform: translateY(60%);
}

.b3 {
  background: url('/24.png') center / 100% 100% no-repeat;
  z-index: 5;
  width: 100%;
  height: 4%;
  top: 0;
}

.b5 {
  width: 300px;
  position: absolute;
  top: 120%;
}
</style>