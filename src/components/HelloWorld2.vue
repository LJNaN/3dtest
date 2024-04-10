<template>
  <div id="container">
    <video id="video1" autoplay width="900" height="900"></video>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
let webRtcServer = null
const url = 'rtsp://2h93115c04.51vip.biz:58009/live'

onMounted(() => {
  //video：需要绑定的video控件ID
  //127.0.0.1:8000：启动webrtc-streamer的设备IP和端口，默认8000
  webRtcServer = new WebRtcStreamer('video1', location.protocol + '//127.0.0.1:8000')
  //需要查看的rtsp地址
  webRtcServer.connect(url)
})
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
  padding: 2rem;
  text-shadow: 0 .1rem 0 rgba(255, 255, 255, .5);
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