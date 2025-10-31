<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  track: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])

const title = ref('')
const publish = ref(false)

// Аудиоплеер
const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const progressPercent = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

watch(() => props.track, (t) => {
  if (!t) return
  title.value = t.title || ''
  publish.value = !!t.publicTrack
  // Сбрасываем состояние плеера
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
}, { immediate: true })

const close = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    isPlaying.value = false
  }
  emit('close')
}

const save = () => emit('save', { title: title.value.trim() || 'Untitled track', publish: publish.value })

// Функции аудиоплеера
const togglePlay = () => {
  if (!audioRef.value) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const updateDuration = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration || 0
  }
}

const updateProgress = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime || 0
  }
}

const seek = (event) => {
  if (!audioRef.value) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  
  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-body">
      <div class="modal-title">Параметры трека</div>
      <div class="modal-field">
        <label>Название</label>
        <input v-model="title" type="text" class="modal-input" placeholder="Введите название" />
      </div>
      
      <!-- Аудиоплеер для прослушивания трека -->
      <div v-if="track?.audioUrl" class="modal-field">
        <label>Прослушать трек</label>
        <div class="audio-player">
          <audio ref="audioRef" :src="track.audioUrl" @loadedmetadata="updateDuration" @timeupdate="updateProgress"></audio>
          <div class="player-controls">
            <button class="play-btn" @click="togglePlay">
              <svg v-if="!isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
            <div class="progress-container">
              <div class="progress-bar" @click="seek">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-field">
        <label class="checkbox">
          <input type="checkbox" v-model="publish" />
          Опубликовать трек
        </label>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" @click="close">Отмена</button>
        <button class="modal-btn primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
  </template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index: 1000; }
.modal-body { width: 520px; background: #191919; border: 1px solid #00000027; border-radius: 16px; padding: 18px; color: #f3f3f3; }
.modal-title { font-weight: 700; margin-bottom: 12px; }
.modal-field { margin-bottom: 12px; }
.modal-input { width: 100%; height: 44px; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.25); background: #0a0a0a60; color: #f3f3f3; }
.checkbox { display: flex; align-items: center; gap: 8px; opacity: 0.9; }
.modal-actions { display:flex; justify-content:flex-end; gap: 8px; margin-top: 10px; }
.modal-btn { height: 40px; padding: 0 14px; border-radius: 12px; border: 1px solid #00000027; background: #0a0a0a80; color: #f3f3f3; }
.modal-btn.primary { background: linear-gradient(-43deg, rgba(49, 206, 244, 1), rgba(232, 46, 204, 1)); }

/* Аудиоплеер */
.audio-player { background: #0a0a0a60; border: 1px solid rgba(0,0,0,0.25); border-radius: 12px; padding: 10px; }
.player-controls { display: flex; align-items: center; gap: 12px; }
.play-btn { height: 36px; width: 48px; border-radius: 10px; border: 1px solid #00000027; background: #0a0a0a80; color: #f3f3f3; display: inline-flex; align-items: center; justify-content: center; }
.progress-container { flex: 1; }
.progress-bar { width: 100%; height: 8px; background-color: rgba(0, 0, 0, 0.3); border-radius: 4px; overflow: hidden; cursor: pointer; }
.progress-fill { height: 100%; background: linear-gradient(-43deg, rgba(49, 206, 244, 1), rgba(232, 46, 204, 1)); border-radius: 4px; transition: width 0.2s ease; }
.time-display { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; opacity: 0.8; }
</style>