<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// Состояния
const user = ref(null)
const tracks = ref([])
const likedTracks = ref([])
const stats = ref({
  totalTracks: 0,
  receivedLikes: 0,
  givenLikes: 0
})

// Загрузка данных при монтировании
onMounted(async () => {
  await loadProfileData()

  // Анимация blob-ов
  const blobs = document.querySelectorAll('.blob')
  setInterval(() => {
    blobs.forEach(blob => {
      const randomX = Math.random() * 40 - 20
      const randomY = Math.random() * 40 - 20
      const randomScale = 0.9 + Math.random() * 0.2
      blob.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`
    })
  }, 1500)
})

// Функция загрузки всех данных профиля
async function loadProfileData() {
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUser) {
    console.error('Не удалось получить пользователя:', authError)
    return
  }

  user.value = currentUser

  console.log(user);

  // Загрузка треков пользователя
  const { data: userTracks, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .eq('authorId', currentUser.id)
    .order('dateCreation', { ascending: false })

  if (tracksError) {
    console.error('Ошибка загрузки треков:', tracksError)
  } else {
    tracks.value = userTracks
    stats.value.totalTracks = userTracks.length
  }

  // Загрузка лайкнутых треков (лайки, поставленные текущим пользователем)
  const { data: givenLikes, error: likesError } = await supabase
    .from('likes')
    .select('track_id')
    .eq('authorId', currentUser.id)

  if (likesError) {
    console.error('Ошибка загрузки лайков:', likesError)
  } else {
    stats.value.givenLikes = givenLikes.length

    // Получаем полную информацию о лайкнутых треках
    if (givenLikes.length > 0) {
      const trackIds = givenLikes.map(like => like.track_id)
      const { data: likedTrackDetails, error: detailError } = await supabase
        .from('tracks')
        .select('*')
        .in('id', trackIds)
        .order('dateCreation', { ascending: false })

      if (detailError) {
        console.error('Ошибка загрузки деталей лайкнутых треков:', detailError)
      } else {
        likedTracks.value = likedTrackDetails
      }
    }
  }

  // Подсчёт полученных лайков (все лайки на треки пользователя)
  const { data: receivedLikesCount, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .in('track_id', userTracks.map(t => t.id))

  if (countError) {
    console.error('Ошибка подсчёта полученных лайков:', countError)
  } else {
    stats.value.receivedLikes = receivedLikesCount?.count || 0
  }
}

// Форматирование даты
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Форматирование времени (длительность)
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <!-- Фон -->
  <div class="background-container">
    <img src="@/assets/Background.png" alt="Фон" class="background-image" />
  </div>

  <div class="liquid-bg">
    <div class="blob"></div>
    <div class="blob"></div>
    <div class="blob"></div>
    <div class="blob"></div>
  </div>

  <!-- Профиль -->
  <div class="profile-page">
    <div class="profile-container">
      <!-- Шапка профиля -->
      <div class="profile-header">
        <h1 class="display-name">{{ user?.user_metadata?.display_name || user?.email }}</h1>
        <button class="edit-btn">Редактировать профиль</button>
      </div>

      <!-- Статистика -->
      <div class="stats">
        <p>● Кол-во мелодий: {{ stats.totalTracks }}</p>
        <p>● Кол-во полученных лайков: {{ stats.receivedLikes }}</p>
        <p>● Кол-во поставленных лайков: {{ stats.givenLikes }}</p>
      </div>

      <!-- Ваши мелодии -->
      <h2 class="section-title">Ваши мелодии</h2>
      <div v-if="tracks.length > 0" class="tracks-list">
        <div v-for="track in tracks" :key="track.id" class="track-item">
          <span class="heart-icon">❤️</span>
          <span class="track-title">{{ track.title }}</span>
          <span class="separator">|</span>
          <span class="track-artist">{{ track.artist }}</span>
          <div class="track-meta">
            <span class="duration">⏱️ {{ formatDuration(track.duration) }}</span>
            <span class="separator">|</span>
            <span class="date">📅 {{ formatDate(track.created_at) }}</span>
            <span class="separator">|</span>
            <span class="likes">❤️ {{ track.likes_count || 0 }}</span>
            <span class="more">...</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">У вас пока нет мелодий.</p>

      <!-- Ваши лайкнутые мелодии -->
      <h2 class="section-title">Ваши лайкнутые мелодии</h2>
      <div v-if="likedTracks.length > 0" class="tracks-list">
        <div v-for="track in likedTracks" :key="track.id" class="track-item">
          <span class="heart-icon">💜</span>
          <span class="track-title">{{ track.title }}</span>
          <span class="separator">|</span>
          <span class="track-artist">{{ track.artist }}</span>
          <div class="track-meta">
            <span class="duration">⏱️ {{ formatDuration(track.duration) }}</span>
            <span class="separator">|</span>
            <span class="date">📅 {{ formatDate(track.created_at) }}</span>
            <span class="separator">|</span>
            <span class="likes">❤️ {{ track.likes_count || 0 }}</span>
            <span class="more">...</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">Вы ещё не лайкнули ни одной мелодии.</p>
    </div>
  </div>
</template>

<style scoped>
/* === ФОН === */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.9;
}

.liquid-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: float 10s infinite ease-in-out;
  mix-blend-mode: overlay;
}

.blob:nth-child(1) {
  background: linear-gradient(135deg, #ffffff, #6ad7f5);
  width: 500px;
  height: 500px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob:nth-child(2) {
  background: linear-gradient(135deg, #6b9efc, #c74ce4);
  width: 600px;
  height: 600px;
  bottom: -150px;
  right: -100px;
  animation-delay: -1.5s;
}

.blob:nth-child(3) {
  background: linear-gradient(135deg, #c74ce4, #6af5cb);
  width: 400px;
  height: 400px;
  bottom: 50%;
  right: 30%;
  animation-delay: -3s;
}

.blob:nth-child(4) {
  background: linear-gradient(135deg, #6af5cb, #5b6eff);
  width: 350px;
  height: 350px;
  top: 40%;
  left: 10%;
  animation-delay: -4.5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  20% {
    transform: translate(80px, -80px) scale(1.1);
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
  40% {
    transform: translate(0, -150px) scale(1.2);
    border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
  }
  60% {
    transform: translate(-80px, -80px) scale(1.1);
    border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
  }
  80% {
    transform: translate(60px, 40px) scale(0.95);
    border-radius: 50% 50% 60% 40% / 60% 70% 30% 40%;
  }
}

/* === ПРОФИЛЬ === */
.profile-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'Jaldi', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-container {
  width: 100%;
  max-width: 650px;
  background-color: #121212f1;
  color: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.display-name {
  font-size: 30px;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.edit-btn {
  background-color: #2a2a2a;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.edit-btn:hover {
  background-color: #444;
}

.stats {
  margin-bottom: 35px;
  line-height: 1.8;
  font-size: 16px;
}

.section-title {
  font-size: 24px;
  margin: 40px 0 25px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.track-item {
  background-color: #1e1e1e;
  padding: 18px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: #252525;
}

.track-item .heart-icon {
  font-size: 22px;
}

.track-title {
  font-weight: 600;
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.separator {
  margin: 0 12px;
  color: #aaa;
  font-size: 14px;
}

.track-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #ccc;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 30px 0;
  font-style: italic;
  font-size: 16px;
}

.more {
  cursor: pointer;
  opacity: 0.7;
  font-size: 14px;
}

.more:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>