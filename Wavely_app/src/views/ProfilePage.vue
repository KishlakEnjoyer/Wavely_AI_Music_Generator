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
  console.log(tracks);
  console.log(stats);

  // Загрузка лайкнутых треков (лайки, поставленные текущим пользователем)
  const { data: givenLikes, error: likesError } = await supabase
    .from('likes')
    .select('idTrack')
    .eq('authorId', currentUser.id)

  if (likesError) {
    console.error('Ошибка загрузки лайков:', likesError)
  } else {
    stats.value.givenLikes = givenLikes.length

    // Получаем полную информацию о лайкнутых треках
    if (givenLikes.length > 0) {
      const trackIds = givenLikes.map(like => like.idTrack)
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
  const { data, count, error } = await supabase
    .from('likes')
    .select('*')
    .in('idTrack', userTracks.map(t => t.idTrack))

  if (error) { // Используем 'error', а не 'countError'
    console.error('Ошибка подсчёта полученных лайков:', error)
  } else {
    stats.value.receivedLikes = count || 0 // Используем 'count', а не 'receivedLikesCount?.count'
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
          <div class="track-left">
            <svg class="heart-logo" width="23" height="23" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26.7217 3.1491C26.0407 2.46777 25.2321 1.9273 24.3422 1.55855C23.4522 1.1898 22.4984 1 21.5351 1C20.5717 1 19.6179 1.1898 18.7279 1.55855C17.838 1.9273 17.0294 2.46777 16.3484 3.1491L14.9351 4.56243L13.5217 3.1491C12.1461 1.77351 10.2804 1.00071 8.33505 1.00071C6.38968 1.00071 4.52398 1.77351 3.14839 3.1491C1.7728 4.52469 1 6.39039 1 8.33577C1 10.2811 1.7728 12.1468 3.14839 13.5224L14.9351 25.3091L26.7217 13.5224C27.403 12.8414 27.9435 12.0329 28.3123 11.1429C28.681 10.253 28.8708 9.29908 28.8708 8.33577C28.8708 7.37245 28.681 6.41857 28.3123 5.52863C27.9435 4.63868 27.403 3.83011 26.7217 3.1491Z" stroke="#F3F3F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="track-title">{{ track.titleTrack }}</span>
            <span class="separator">|</span>
            <span class="artist">{{ track.artist }}</span>
          </div>
          <div class="track-right">
            <div class="duration">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.33333 2.83333V6.33333L8.66667 7.5M12.1667 6.33333C12.1667 9.55499 9.55499 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.55499 0.5 12.1667 3.11167 12.1667 6.33333Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ formatDuration(track.durationTrack) }}
            </div>
            <span class="separator">|</span>
            <div class="date">
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.08333 0.5V2.83333M3.41667 0.5V2.83333M0.5 5.16667H11M1.66667 1.66667H9.83333C10.4777 1.66667 11 2.189 11 2.83333V11C11 11.6443 10.4777 12.1667 9.83333 12.1667H1.66667C1.02233 12.1667 0.5 11.6443 0.5 11V2.83333C0.5 2.189 1.02233 1.66667 1.66667 1.66667Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ formatDate(track.dateCreation) }}
            </div>
            <span class="separator">|</span>
            <div class="likes">
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3609 1.57455C13.0204 1.23389 12.6161 0.963648 12.1711 0.779273C11.7261 0.594898 11.2492 0.5 10.7675 0.5C10.2859 0.5 9.80893 0.594898 9.36396 0.779273C8.91898 0.963648 8.5147 1.23389 8.17419 1.57455L7.46753 2.28122L6.76086 1.57455C6.07307 0.886756 5.14022 0.500357 4.16753 0.500357C3.19484 0.500357 2.26199 0.886756 1.57419 1.57455C0.886399 2.26235 0.5 3.19519 0.5 4.16788C0.5 5.14057 0.886399 6.07342 1.57419 6.76122L7.46753 12.6545L13.3609 6.76122C13.7015 6.42071 13.9718 6.01643 14.1561 5.57145C14.3405 5.12648 14.4354 4.64954 14.4354 4.16788C14.4354 3.68623 14.3405 3.20929 14.1561 2.76431C13.9718 2.31934 13.7015 1.91505 13.3609 1.57455Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ track.likes_count || 0 }}
            </div>
            <span class="more">...</span>
          </div>
        </div>
      </div>
      <p v-else class="empty-state">У вас пока нет мелодий.</p>

      <!-- Ваши лайкнутые мелодии -->
      <h2 class="section-title">Ваши лайкнутые мелодии</h2>
      <div v-if="likedTracks.length > 0" class="tracks-list">
        <div v-for="track in likedTracks" :key="track.id" class="track-item">
          <div class="track-left">
            <svg class="heart-logo" width="23" height="23" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26.7217 3.1491C26.0407 2.46777 25.2321 1.9273 24.3422 1.55855C23.4522 1.1898 22.4984 1 21.5351 1C20.5717 1 19.6179 1.1898 18.7279 1.55855C17.838 1.9273 17.0294 2.46777 16.3484 3.1491L14.9351 4.56243L13.5217 3.1491C12.1461 1.77351 10.2804 1.00071 8.33505 1.00071C6.38968 1.00071 4.52398 1.77351 3.14839 3.1491C1.7728 4.52469 1 6.39039 1 8.33577C1 10.2811 1.7728 12.1468 3.14839 13.5224L14.9351 25.3091L26.7217 13.5224C27.403 12.8414 27.9435 12.0329 28.3123 11.1429C28.681 10.253 28.8708 9.29908 28.8708 8.33577C28.8708 7.37245 28.681 6.41857 28.3123 5.52863C27.9435 4.63868 27.403 3.83011 26.7217 3.1491Z" stroke="#F3F3F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="track-title">{{ track.titleTrack }}</span>
            <span class="separator">|</span>
            <span class="artist">{{ track.artist }}</span>
          </div>
          <div class="track-right">
            <div class="duration">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.33333 2.83333V6.33333L8.66667 7.5M12.1667 6.33333C12.1667 9.55499 9.55499 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.55499 0.5 12.1667 3.11167 12.1667 6.33333Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ formatDuration(track.durationTrack) }}
            </div>
            <span class="separator">|</span>
            <div class="date">
              <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.08333 0.5V2.83333M3.41667 0.5V2.83333M0.5 5.16667H11M1.66667 1.66667H9.83333C10.4777 1.66667 11 2.189 11 2.83333V11C11 11.6443 10.4777 12.1667 9.83333 12.1667H1.66667C1.02233 12.1667 0.5 11.6443 0.5 11V2.83333C0.5 2.189 1.02233 1.66667 1.66667 1.66667Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ formatDate(track.dateCreation) }}
            </div>
            <span class="separator">|</span>
            <div class="likes">
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3609 1.57455C13.0204 1.23389 12.6161 0.963648 12.1711 0.779273C11.7261 0.594898 11.2492 0.5 10.7675 0.5C10.2859 0.5 9.80893 0.594898 9.36396 0.779273C8.91898 0.963648 8.5147 1.23389 8.17419 1.57455L7.46753 2.28122L6.76086 1.57455C6.07307 0.886756 5.14022 0.500357 4.16753 0.500357C3.19484 0.500357 2.26199 0.886756 1.57419 1.57455C0.886399 2.26235 0.5 3.19519 0.5 4.16788C0.5 5.14057 0.886399 6.07342 1.57419 6.76122L7.46753 12.6545L13.3609 6.76122C13.7015 6.42071 13.9718 6.01643 14.1561 5.57145C14.3405 5.12648 14.4354 4.64954 14.4354 4.16788C14.4354 3.68623 14.3405 3.20929 14.1561 2.76431C13.9718 2.31934 13.7015 1.91505 13.3609 1.57455Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ track.likes_count || 0 }}
            </div>
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
  justify-content: space-between; /* Изменено с align-items */
  align-items: center;
  gap: 14px;
  font-size: 16px;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: #252525;
}

.track-left {
  display: flex;
  align-items: center;
  gap: 10px; /* Увеличен отступ */
  flex-grow: 1; /* Занимает всё доступное пространство слева */
  overflow: hidden; /* Скрывает переполняющий текст */
}

.track-right {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 14px;
  color: #ccc;
  flex-shrink: 0; /* Не сжимается */
}

.heart-logo {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.track-title {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artist {
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.separator {
  margin: 0 8px;
  color: #a5a5a5;
}

.duration, .date, .likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more {
  cursor: pointer;
  opacity: 0.7;
  margin-left: 8px; /* Отступ слева от лайков */
}

.more:hover {
  opacity: 1;
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  color: #888;
  padding: 30px 0;
  font-style: italic;
  font-size: 16px;
}
</style>