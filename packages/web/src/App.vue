<script setup lang="ts">
import { onMounted } from 'vue'
// import x from '@idgtn-game-sdk/core'


onMounted(() => {
  // console.log(x)
  fetch('http://localhost:3000/game-files/list').then(res => res.json()).then(res => {
    console.log(res)
  })
})

function createGame() {
  fetch('http://localhost:3000/game-files/create-local-game-dir', {
    method: 'POST', // 使用 POST 方法
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://vivo-center.minigame.vip/game/block-puzzle-guardian/play?from=home'
    })
  }).then(res => res.json()).then(res => {
    console.log(res)
  })
}
</script>

<template>
  <div>
    <button @click="createGame">create</button>
  </div>
</template>


