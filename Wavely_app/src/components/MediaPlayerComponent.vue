<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { usePlayerStore } from '../lib/player'
import { supabase } from '../lib/supabase.js'

const playerStore = usePlayerStore()
const audio = ref(null)
const user = ref(null)
const showAuthRequiredModal = ref(false)
const playError = ref('')

const isUserAuthenticated = computed(() => !!user.value) 

onMounted(async () => {
    await checkAuth()
    setupAuthListener()

    if (audio.value) {
        playerStore.setAudioElement(audio.value);
    }
});

const handlePlayError = (error) => {
  console.error('Play error:', error);
  playError.value = error.message;
  showNotification(error.message, 'error');
}

const checkAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Ошибка получения сессии:', error)
      return
    }
    
    if (session) {
      user.value = session.user
      console.log('Пользователь авторизован:', user.value.email)
    } else {
      console.log('Пользователь не авторизован')
    }
  } catch (error) {
    console.error('Ошибка при проверке авторизации:', error)
  }
}

const setupAuthListener = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event)
    if (event === 'SIGNED_IN' && session) {
      user.value = session.user
      showAuthRequiredModal.value = false
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      playerStore.pause()
    }
  })
}

const onLoadStart = () => {
  playerStore.isLoading = true;
}

const onCanPlay = () => {
  playerStore.isLoading = false;
}

const closePlayer = () => {
  playerStore.hidePlayer();
  playError.value = '';
}


const onTimeUpdate = () => {
    if (audio.value) {
        playerStore.updateProgress({
            currentTime: audio.value.currentTime,
            duration: audio.value.duration
        })
    }
}

const onLoadedMetadata = () => {
    if (audio.value) {
        playerStore.duration = audio.value.duration
    }
}

const onSeek = (e) => {
    const rect = e.target.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * playerStore.duration
    playerStore.seek(newTime)
}

const onError = (e) => {
    console.error('Audio element error:', e);
    console.error('Audio source:', audio.value?.src);
    playerStore.isPlaying = false;
    playerStore.isLoading = false;
    
    const error = audio.value.error;
    if (error) {
        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                handlePlayError(new Error('Воспроизведение было прервано'));
                break;
            case error.MEDIA_ERR_NETWORK:
                handlePlayError(new Error('Ошибка сети при загрузке трека'));
                break;
            case error.MEDIA_ERR_DECODE:
                handlePlayError(new Error('Ошибка декодирования аудиофайла'));
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                handlePlayError(new Error('Формат аудио не поддерживается'));
                break;
            default:
                handlePlayError(new Error('Неизвестная ошибка воспроизведения'));
        }
    }
}

const onEnded = () => {
    if (!playerStore.loop) {
        playerStore.pause();
    }
}

const handlePlay = async () => {
  if (!user.value) {
    showAuthRequiredModal.value = true
    return
  }
  
  try {
    await playerStore.play();
  } catch (error) {
    handlePlayError(error);
  }
}

const handlePause = () => {
  playerStore.pause()
}


const downloadTrack = () => {
    if (!playerStore.currentTrack?.src) return
    const link = document.createElement('a')
    link.href = playerStore.currentTrack.src
    link.download = playerStore.currentTrack.title || 'track.mp3'
    link.click()
}

const showNotification = (message, type = 'info') => {
  console.log(`${type}: ${message}`);
}

const toggleLike = async (index) => {
  if (!user.value) {
    showNotification('Пожалуйста, войдите в аккаунт, чтобы ставить лайки', 'info')
    return
  }

  const track = tracks.value[index]
  const isNowLiked = !track.isLikedByUser

  try {
    if (isNowLiked) {
      await supabase.from('likes').insert({
        idTrack: track.id,
        authorId: user.value.id
      })
      tracks.value[index].likesCount += 1
    } else {
      await supabase
        .from('likes')
        .delete()
        .match({ idTrack: track.id, authorId: user.value.id })
      tracks.value[index].likesCount -= 1
    }

    tracks.value[index].isLikedByUser = isNowLiked
    // Опционально: показать уведомление об успехе
    // showNotification(isNowLiked ? 'Лайк добавлен!' : 'Лайк убран', 'success')

  } catch (e) {
    console.error('Ошибка при лайке:', e)
    showNotification('Не удалось обновить лайк', 'error') // ✅ Исправлено: было alert
  }
}


watch(() => playerStore.currentTime, (time) => {
    if (audio.value && Math.abs(audio.value.currentTime - time) > 0.5) {
        audio.value.currentTime = time
    }
})

watch(() => playerStore.volume, (vol) => {
    if (audio.value) audio.value.volume = vol
})

watch(() => playerStore.loop, (loop) => {
    if (audio.value) {
        audio.value.loop = loop;
    }
})

watch(() => playerStore.currentTrack, (newTrack) => {
  console.log('Current track changed:', newTrack);
});

watch(() => playerStore.isVisible, (visible) => {
  console.log('Player visibility:', visible);
});

watch(() => playerStore.isPlaying, (playing) => {
  console.log('Player playing state:', playing);
});
</script>

<template>
    <div v-if="playerStore.isVisible" class="media-player-fixed">
        <div class="player-container">
            <audio 
                ref="audio" 
                :src="playerStore.currentTrack?.src" 
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onLoadedMetadata" 
                @loadstart="onLoadStart"
                @canplay="onCanPlay"
                @ended="onEnded" 
                @error="onError" 
                preload="metadata"
                :loop="playerStore.loop" 
            />

            <div v-if="playerStore.isLoading" class="loading-indicator">
                Загрузка трека...
            </div>

            <div v-if="playError" class="error-message">
                {{ playError }}
            </div>

            <div class="player-content">
                <button @click="closePlayer" class="close-player-btn" title="Закрыть плеер">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <div class="track-info">
                    <div class="track-image">
                        <div class="image-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                    </div>
                    <div class="track-details">
                        <p class="track-title">{{ playerStore.currentTrack?.title || 'Выберите трек' }}</p>
                        <p class="track-artist">{{ playerStore.currentTrack?.artist || 'Неизвестный исполнитель' }}</p>
                    </div>
                    <button @click.stop="toggleLike(index)" class="like-btn" :class="{ liked: playerStore.currentTrack?.liked }">
                        <svg class="heart-logo" v-if="!playerStore.currentTrack?.liked" width="23" height="23"
                            viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M26.7217 3.1491C26.0407 2.46777 25.2321 1.9273 24.3422 1.55855C23.4522 1.1898 22.4984 1 21.5351 1C20.5717 1 19.6179 1.1898 18.7279 1.55855C17.838 1.9273 17.0294 2.46777 16.3484 3.1491L14.9351 4.56243L13.5217 3.1491C12.1461 1.77351 10.2804 1.00071 8.33505 1.00071C6.38968 1.00071 4.52398 1.77351 3.14839 3.1491C1.7728 4.52469 1 6.39039 1 8.33577C1 10.2811 1.7728 12.1468 3.14839 13.5224L14.9351 25.3091L26.7217 13.5224C27.403 12.8414 27.9435 12.0329 28.3123 11.1429C28.681 10.253 28.8708 9.29908 28.8708 8.33577C28.8708 7.37245 28.681 6.41857 28.3123 5.52863C27.9435 4.63868 27.403 3.83011 26.7217 3.1491Z"
                                stroke="#F3F3F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                        <svg v-else class="heart-logo" width="23" height="23" viewBox="0 0 29 26" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M26.2217 2.6491C25.5407 1.96777 24.7321 1.4273 23.8422 1.05855C22.9522 0.689796 21.9984 0.5 21.0351 0.5C20.0717 0.5 19.1179 0.689796 18.2279 1.05855C17.338 1.4273 16.5294 1.96777 15.8484 2.6491L14.4351 4.06243L13.0217 2.6491C11.6461 1.27351 9.78043 0.500713 7.83505 0.500713C5.88968 0.500713 4.02398 1.27351 2.64839 2.6491C1.2728 4.02469 0.5 5.89039 0.5 7.83577C0.5 9.78114 1.2728 11.6468 2.64839 13.0224L14.4351 24.8091L26.2217 13.0224C26.903 12.3414 27.4435 11.5329 27.8123 10.6429C28.181 9.75296 28.3708 8.79908 28.3708 7.83577C28.3708 6.87245 28.181 5.91857 27.8123 5.02863C27.4435 4.13868 26.903 3.33011 26.2217 2.6491Z"
                                fill="url(#paint0_linear_273_11)" stroke="url(#paint1_linear_273_11)"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <defs>
                                <linearGradient id="paint0_linear_273_11" x1="3.43506" y1="4.00244" x2="24.4351"
                                    y2="21.0024" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#26CEE6" />
                                    <stop offset="1" stop-color="#DA27F5" />
                                </linearGradient>
                                <linearGradient id="paint1_linear_273_11" x1="0.435059" y1="0.502441" x2="28.4351"
                                    y2="24.5024" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#26CEE6" />
                                    <stop offset="1" stop-color="#B747F2" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </button>
                </div>

                <div class="playback-controls">
                    <div class="control-buttons">

                        <button @click="playerStore.pause()" v-if="playerStore.isPlaying"
                            class="control-btn primary pause-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button @click="playerStore.togglePlay()" v-else class="control-btn primary play-btn"
                            :disabled="!playerStore.currentTrack">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                        </button>
                    </div>

                    <div class="progress-container" v-if="playerStore.duration > 0">
                        <div class="time-display">
                            {{ new Date(playerStore.currentTime * 1000).toISOString().substr(14, 5) }}
                        </div>
                        <div class="progress-bar" @click="onSeek">
                            <div class="progress-fill"
                                :style="{ width: playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 + '%' : '0%' }">
                            </div>
                            <div class="progress-thumb"></div>
                        </div>
                        <div class="time-display">
                            {{ new Date(playerStore.duration * 1000).toISOString().substr(14, 5) }}
                        </div>
                    </div>
                </div>

                <div class="additional-controls">
                    <button @click="playerStore.toggleLoop()" class="loop-btn" :class="{ active: playerStore.loop }"
                        title="Зациклить трек">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="M18 4L21 7M21 7L18 10M21 7H7C4.79086 7 3 8.79086 3 11M6 20L3 17M3 17L6 14M3 17H17C19.2091 17 21 15.2091 21 13"
                                    stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                </path>
                            </g>
                        </svg>
                    </button>

                    <div class="volume-control">
                        <svg class="volume-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                            stroke="#ffffff">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="M16.0004 9.00009C16.6281 9.83575 17 10.8745 17 12.0001C17 13.1257 16.6281 14.1644 16.0004 15.0001M18 5.29177C19.8412 6.93973 21 9.33459 21 12.0001C21 14.6656 19.8412 17.0604 18 18.7084M4.6 9.00009H5.5012C6.05213 9.00009 6.32759 9.00009 6.58285 8.93141C6.80903 8.87056 7.02275 8.77046 7.21429 8.63566C7.43047 8.48353 7.60681 8.27191 7.95951 7.84868L10.5854 4.69758C11.0211 4.17476 11.2389 3.91335 11.4292 3.88614C11.594 3.86258 11.7597 3.92258 11.8712 4.04617C12 4.18889 12 4.52917 12 5.20973V18.7904C12 19.471 12 19.8113 11.8712 19.954C11.7597 20.0776 11.594 20.1376 11.4292 20.114C11.239 20.0868 11.0211 19.8254 10.5854 19.3026L7.95951 16.1515C7.60681 15.7283 7.43047 15.5166 7.21429 15.3645C7.02275 15.2297 6.80903 15.1296 6.58285 15.0688C6.32759 15.0001 6.05213 15.0001 5.5012 15.0001H4.6C4.03995 15.0001 3.75992 15.0001 3.54601 14.8911C3.35785 14.7952 3.20487 14.6422 3.10899 14.4541C3 14.2402 3 13.9601 3 13.4001V10.6001C3 10.04 3 9.76001 3.10899 9.54609C3.20487 9.35793 3.35785 9.20495 3.54601 9.10908C3.75992 9.00009 4.03995 9.00009 4.6 9.00009Z"
                                    stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                </path>
                            </g>
                        </svg>
                        <input type="range" min="0" max="1" step="0.01" :value="playerStore.volume"
                            @input="(e) => playerStore.setVolume(parseFloat(e.target.value))" class="volume-slider" />
                    </div>

                    <button @click="downloadTrack" class="download-btn" :disabled="!playerStore.currentTrack">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path
                                    d="M5.625 15C5.625 14.5858 5.28921 14.25 4.875 14.25C4.46079 14.25 4.125 14.5858 4.125 15H5.625ZM4.875 16H4.125H4.875ZM19.275 15C19.275 14.5858 18.9392 14.25 18.525 14.25C18.1108 14.25 17.775 14.5858 17.775 15H19.275ZM11.1086 15.5387C10.8539 15.8653 10.9121 16.3366 11.2387 16.5914C11.5653 16.8461 12.0366 16.7879 12.2914 16.4613L11.1086 15.5387ZM16.1914 11.4613C16.4461 11.1347 16.3879 10.6634 16.0613 10.4086C15.7347 10.1539 15.2634 10.2121 15.0086 10.5387L16.1914 11.4613ZM11.1086 16.4613C11.3634 16.7879 11.8347 16.8461 12.1613 16.5914C12.4879 16.3366 12.5461 15.8653 12.2914 15.5387L11.1086 16.4613ZM8.39138 10.5387C8.13662 10.2121 7.66533 10.1539 7.33873 10.4086C7.01212 10.6634 6.95387 11.1347 7.20862 11.4613L8.39138 10.5387ZM10.95 16C10.95 16.4142 11.2858 16.75 11.7 16.75C12.1142 16.75 12.45 16.4142 12.45 16H10.95ZM12.45 5C12.45 4.58579 12.1142 4.25 11.7 4.25C11.2858 4.25 10.95 4.58579 10.95 5H12.45ZM4.125 15V16H5.625V15H4.125ZM4.125 16C4.125 18.0531 5.75257 19.75 7.8 19.75V18.25C6.61657 18.25 5.625 17.2607 5.625 16H4.125ZM7.8 19.75H15.6V18.25H7.8V19.75ZM15.6 19.75C17.6474 19.75 19.275 18.0531 19.275 16H17.775C17.775 17.2607 16.7834 18.25 15.6 18.25V19.75ZM19.275 16V15H17.775V16H19.275ZM12.2914 16.4613L16.1914 11.4613L15.0086 10.5387L11.1086 15.5387L12.2914 16.4613ZM12.2914 15.5387L8.39138 10.5387L7.20862 11.4613L11.1086 16.4613L12.2914 15.5387ZM12.45 16V5H10.95V16H12.45Z"
                                    fill="#ffffff"></path>
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loop-btn {
    height: 30px;
    width: 30px;
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: #a1a1aa;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.loop-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.loop-btn.active {
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
}

.media-player-fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.player-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 12px 20px;
}

.player-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.track-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 200px;
}

.track-image {
    flex-shrink: 0;
}

.image-placeholder {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.track-details {
    flex: 1;
    min-width: 0;
}

.track-title {
    font-weight: 600;
    font-size: 14px;
    color: white;
    margin: 0 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    font-size: 12px;
    color: #a1a1aa;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.like-btn {
    background: none;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: #a1a1aa;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.like-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f87171;
}

.like-btn.liked {
    color: #ef4444;
}

.heart-icon {
    width: 20px;
    height: 20px;
}

.heart-icon.filled {
    fill: currentColor;
}

/* Playback Controls */
.playback-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 2;
    max-width: 500px;
}

.control-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-btn {
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.control-btn.secondary {
    width: 32px;
    height: 32px;
    color: #a1a1aa;
    background: transparent;
}

.control-btn.secondary:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.control-btn.primary {
    width: 44px;
    height: 44px;
    color: white;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.control-btn.primary:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
}

/* Progress Bar */
.progress-container {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
}

.time-display {
    font-size: 11px;
    color: #a1a1aa;
    font-variant-numeric: tabular-nums;
    min-width: 35px;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    transition: height 0.2s ease;
}

.progress-bar:hover {
    height: 6px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 2px;
    position: relative;
    transition: width 0.1s linear;
}

.progress-thumb {
    position: absolute;
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-bar:hover .progress-thumb {
    opacity: 1;
}

/* Additional Controls */
.additional-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
}

.volume-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-icon {
    width: 20px;
    height: 20px;
    color: #a1a1aa;
}

.volume-slider {
    width: 80px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.download-btn {
    background: none;
    height: 40px;
    width: 40px;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    color: white;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
}

.download-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
    .player-content {
        flex-direction: column;
        gap: 12px;
    }

    .playback-controls {
        order: -1;
        width: 100%;
    }

    .track-info,
    .additional-controls {
        width: 100%;
        justify-content: center;
    }

    .player-container {
        padding: 10px 15px;
    }
}

@media (max-width: 480px) {
    .volume-control {
        display: none;
    }

    .track-info {
        min-width: auto;
    }
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 10;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ff4d4d;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 10;
}

.close-player-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 10;
}

.close-player-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
</style>