<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ src: { type: String, required: true }, title: { type: String, default: 'Трек' } })
const audioRef = ref(null)
const isPlaying = ref(false)

const toggle = () => {
  if (!audioRef.value) return
  if (isPlaying.value) { audioRef.value.pause() } else { audioRef.value.play() }
}

watch(isPlaying, (val) => {})

const onPlay = () => { isPlaying.value = true }
const onPause = () => { isPlaying.value = false }
</script>

<template>
  <div class="square-player">
    <div class="artwork"></div>
    <div class="controls">
      <button class="play-btn" :class="{ active: isPlaying }" @click="toggle">
        <span v-if="!isPlaying">▶</span>
        <span v-else>⏸</span>
      </button>
      <div class="title">{{ title }}</div>
    </div>
    <audio ref="audioRef" :src="src" @play="onPlay" @pause="onPause" />
  </div>
  
</template>

<style scoped>
.square-player { width: 280px; height: 280px; border-radius: 16px; background: #0a0a0a80; border: 1px solid #00000027; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 16px; box-sizing: border-box; }
.artwork { width: 100%; height: 60%; border-radius: 12px; background: linear-gradient(-43deg, rgba(49,206,244,0.3), rgba(232,46,204,0.3)); }
.controls { width: 100%; display: flex; align-items: center; gap: 12px; }
.play-btn { width: 48px; height: 48px; border-radius: 24px; border: 1px solid #00000027; background: linear-gradient(-43deg, #31CEF461, #E82ECC61); color: rgba(243,243,243,0.9); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.play-btn.active { background: linear-gradient(-43deg, rgba(49,206,244,1), rgba(232,46,204,1)); color: #fff; }
.title { color: #eaeaea; font-size: 14px; }
</style>