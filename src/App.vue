
<template>
  <HelloWorld />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import HelloWorld2 from './components/HelloWorld2.vue'



onMounted(() => {
})

</script>


<style scoped>
.a3 {
  display: flex;
  flex-direction: column;
}

.a1 {
  position: absolute;
  width: 30vw;
  height: 30vh;
  top: 0;
  left: 0;
  border: 1px solid red;
}

input {
  position: absolute;
  margin-top: 20vh;
  left: 20%;
  width: 20vw;
}

button {
  position: absolute;
  margin-top: 20vh;
  left: 40%;
}
</style>
