<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/lib/supabase";
import EditProfileModal from "@/components/EditProfileModal.vue";
import MelodyElement from "@/components/MelodyElement.vue";

const route = useRoute();

// Состояния
const user = ref(null);
const tracks = ref([]);
const likedTracks = ref([]);
const stats = ref({
  totalTracks: 0,
  receivedLikes: 0,
  givenLikes: 0,
});
const isEditModalOpen = ref(false);
const currentDisplayName = ref("");
const currentAvatarUrl = ref("");

// Уведомление
const notification = ref({
  show: false,
  message: "",
  type: "info", // 'info', 'success', 'error'
});

// Текущий авторизованный пользователь
const currentUser = ref(null);
const targetUserId = computed(() => route.params.userId);
const isOwnProfile = computed(() => currentUser.value && currentUser.value.id === targetUserId.value);

// Загрузка данных при монтировании
onMounted(async () => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  currentUser.value = authUser;

  // Загружаем данные при первом входе
  await loadProfileData();
});

// 🔁 Следим за изменением userId в маршруте
watch(
  () => route.params.userId,
  async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      await loadProfileData();
    }
  }
);

// === Общая функция загрузки профиля ===
async function loadProfileData() {
  if (!targetUserId.value) return;

  // Сброс данных перед загрузкой нового профиля
  user.value = null;
  tracks.value = [];
  likedTracks.value = [];
  stats.value = {
    totalTracks: 0,
    receivedLikes: 0,
    givenLikes: 0,
  };

  if (isOwnProfile.value) {
    await loadOwnProfileData();
  } else {
    await loadOtherUserProfileData();
  }

  // Анимация blob-ов (только один раз при монтировании, но можно и перезапускать)
  const blobs = document.querySelectorAll(".blob");
  blobs.forEach((blob) => {
    const randomX = Math.random() * 40 - 20;
    const randomY = Math.random() * 40 - 20;
    const randomScale = 0.9 + Math.random() * 0.2;
    blob.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
  });
}

// === Загрузка своего профиля ===
async function loadOwnProfileData() {
  if (!currentUser.value) return;

  user.value = currentUser.value;
  currentDisplayName.value = user.value?.user_metadata?.display_name || "";
  currentAvatarUrl.value = user.value?.user_metadata?.avatar_url || "";

  // Загрузка треков
  const { data: userTracks, error: tracksError } = await supabase
    .from("tracks")
    .select("idTrack, titleTrack, durationTrack, dateCreation, authorId, profiles!inner(nickname)")
    .eq("authorId", currentUser.value.id)
    .order("dateCreation", { ascending: false });

  if (tracksError) {
    console.error("Ошибка загрузки треков:", tracksError);
  } else {
    const trackIds = userTracks.map((t) => t.idTrack);
    let likesMap = {};
    const userLikes = {};

    if (trackIds.length > 0) {
      const { data: likesData } = await supabase
        .from("likes")
        .select("idTrack")
        .in("idTrack", trackIds);
      if (likesData) {
        likesMap = likesData.reduce((acc, like) => {
          acc[like.idTrack] = (acc[like.idTrack] || 0) + 1;
          return acc;
        }, {});
      }

      const { data: userLikesData } = await supabase
        .from("likes")
        .select("idTrack")
        .eq("authorId", currentUser.value.id)
        .in("idTrack", trackIds);
      if (userLikesData) {
        userLikesData.forEach((like) => {
          userLikes[like.idTrack] = true;
        });
      }
    }

    tracks.value = userTracks.map((track) => ({
      id: track.idTrack,
      title: track.titleTrack,
      author: track.authorId || "Аноним",
      authorNick: track.profiles.nickname,
      duration: formatDuration(track.durationTrack),
      date: formatDate(track.dateCreation),
      dateCreation: track.dateCreation,
      likesCount: likesMap[track.idTrack] || 0,
      isLikedByUser: !!userLikes[track.idTrack],
    }));
    stats.value.totalTracks = tracks.value.length;
  }

  // Загрузка лайкнутых треков
  const { data: givenLikes } = await supabase
    .from("likes")
    .select("idTrack")
    .eq("authorId", currentUser.value.id);

  stats.value.givenLikes = givenLikes?.length || 0;

  if (givenLikes?.length > 0) {
    const trackIds = givenLikes.map((like) => like.idTrack);
    const { data: likedTrackDetails } = await supabase
      .from("tracks")
      .select("idTrack, titleTrack, durationTrack, dateCreation, authorId, profiles!inner(nickname)")
      .in("idTrack", trackIds)
      .order("dateCreation", { ascending: false });

    if (likedTrackDetails) {
      const likedTrackIds = likedTrackDetails.map((t) => t.idTrack);
      let likedTrackLikesMap = {};
      const likedUserLikes = {};

      if (likedTrackIds.length > 0) {
        const { data: likesData } = await supabase
          .from("likes")
          .select("idTrack")
          .in("idTrack", likedTrackIds);
        if (likesData) {
          likedTrackLikesMap = likesData.reduce((acc, like) => {
            acc[like.idTrack] = (acc[like.idTrack] || 0) + 1;
            return acc;
          }, {});
        }

        const { data: userLikesData } = await supabase
          .from("likes")
          .select("idTrack")
          .eq("authorId", currentUser.value.id)
          .in("idTrack", likedTrackIds);
        if (userLikesData) {
          userLikesData.forEach((like) => {
            likedUserLikes[like.idTrack] = true;
          });
        }
      }

      likedTracks.value = likedTrackDetails.map((track) => ({
        id: track.idTrack,
        title: track.titleTrack,
        author: track.authorId || "Аноним",
        authorNick: track.profiles.nickname,
        duration: formatDuration(track.durationTrack),
        date: formatDate(track.dateCreation),
        dateCreation: track.dateCreation,
        likesCount: likedTrackLikesMap[track.idTrack] || 0,
        isLikedByUser: !!likedUserLikes[track.idTrack],
      }));
    }
  }

  // Подсчёт полученных лайков
  const userTrackIds = userTracks?.map((t) => t.idTrack) || [];
  if (userTrackIds.length > 0) {
    const { count: receivedLikesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .in("idTrack", userTrackIds);
    stats.value.receivedLikes = receivedLikesCount || 0;
  } else {
    stats.value.receivedLikes = 0;
  }
}

// === Загрузка чужого профиля ===
async function loadOtherUserProfileData() {
  // Получаем nickname из таблицы profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, userid")
    .eq("userid", targetUserId.value)
    .single();

  if (!profile) {
    console.error("Профиль не найден");
    return;
  }

  user.value = {
    id: profile.userid,
    nickname: profile.nickname,
  };

  // Загрузка только публичных треков
  const { data: userTracks } = await supabase
    .from("tracks")
    .select("idTrack, titleTrack, durationTrack, dateCreation, publicTrack, authorId, profiles!inner(nickname)")
    .eq("authorId", targetUserId.value)
    .eq("publicTrack", true)
    .order("dateCreation", { ascending: false });

  const trackIds = userTracks?.map((t) => t.idTrack) || [];
  let likesMap = {};
  const userLikes = {};

  if (trackIds.length > 0) {
    const { data: likesData } = await supabase
      .from("likes")
      .select("idTrack")
      .in("idTrack", trackIds);
    if (likesData) {
      likesMap = likesData.reduce((acc, like) => {
        acc[like.idTrack] = (acc[like.idTrack] || 0) + 1;
        return acc;
      }, {});
    }

    if (currentUser.value) {
      const { data: userLikesData } = await supabase
        .from("likes")
        .select("idTrack")
        .eq("authorId", currentUser.value.id)
        .in("idTrack", trackIds);
      if (userLikesData) {
        userLikesData.forEach((like) => {
          userLikes[like.idTrack] = true;
        });
      }
    }
  }

  tracks.value = (userTracks || []).map((track) => ({
    id: track.idTrack,
    title: track.titleTrack,
    author: track.authorId?.substring(0, 8) || "Аноним",
    authorNick: track.profiles.nickname,
    duration: formatDuration(track.durationTrack),
    date: formatDate(track.dateCreation),
    dateCreation: track.dateCreation,
    likesCount: likesMap[track.idTrack] || 0,
    isLikedByUser: !!userLikes[track.idTrack],
  }));

  stats.value.totalTracks = tracks.value.length;

  // Подсчёт полученных лайков
  if (trackIds.length > 0) {
    const { count: receivedLikesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .in("idTrack", trackIds);
    stats.value.receivedLikes = receivedLikesCount || 0;
  } else {
    stats.value.receivedLikes = 0;
  }
}

// === Форматирование ===
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// === Лайки ===
const toggleLike = async (trackId) => {
  if (!currentUser.value) {
    showNotification("Пожалуйста, войдите в аккаунт, чтобы ставить лайки", "info");
    return;
  }

  try {
    const isNowLiked = !(
      tracks.value.find(t => t.id === trackId)?.isLikedByUser ||
      likedTracks.value.find(t => t.id === trackId)?.isLikedByUser
    );

    if (isNowLiked) {
      await supabase.from("likes").insert({
        idTrack: trackId,
        authorId: currentUser.value.id,
      });
    } else {
      await supabase
        .from("likes")
        .delete()
        .match({ idTrack: trackId, authorId: currentUser.value.id });
    }

    // Обновляем локальное состояние
    const trackInOwn = tracks.value.find(t => t.id === trackId);
    if (trackInOwn) {
      trackInOwn.isLikedByUser = isNowLiked;
      trackInOwn.likesCount += isNowLiked ? 1 : -1;
    }

    const trackInLiked = likedTracks.value.find(t => t.id === trackId);
    if (trackInLiked) {
      trackInLiked.isLikedByUser = isNowLiked;
      trackInLiked.likesCount += isNowLiked ? 1 : -1;
    }

    // Обновляем статистику
    if (isOwnProfile.value) {
      stats.value.givenLikes += isNowLiked ? 1 : -1;
    } else {
      stats.value.receivedLikes += isNowLiked ? 1 : -1;
    }
  } catch (e) {
    console.error("Ошибка при лайке:", e);
    showNotification("Не удалось обновить лайк", "error");
  }
};

// === Редактирование профиля ===
const saveProfile = async ({ displayName, newPassword }) => {
  try {
    if (displayName !== null) {
      const { error: nameErr } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (nameErr) throw nameErr;
      currentUser.value.user_metadata.display_name = displayName;
      currentDisplayName.value = displayName;
    }

    if (displayName !== null) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ nickname: displayName })
        .eq("userid", currentUser.value.id);
      if (profileErr) throw profileErr;
    }

    if (newPassword) {
      const { error: pwdErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (pwdErr) throw pwdErr;
    }

    showNotification("Профиль успешно обновлён!", "success");
  } catch (e) {
    console.error("Ошибка обновления профиля:", e.message);
    showNotification("Не удалось сохранить изменения", "error");
  }
};

// === Уведомления ===
const showNotification = (message, type = "info") => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};
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

  <!-- Обертка для скролла -->
  <div class="profile-page">
    <button class="back-button" @click="$router.back()">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div class="profile-container">
      <div class="profile-header">
        <h1 class="display-name">
          {{ isOwnProfile ? (user?.user_metadata?.display_name || user?.email) : (user?.nickname || 'Пользователь') }}
        </h1>
        <button v-if="isOwnProfile" class="edit-btn" @click="isEditModalOpen = true">
          Редактировать профиль
        </button>
      </div>

      <div class="stats">
        <p>● Кол-во мелодий: {{ stats.totalTracks }}</p>
        <p>● Кол-во полученных лайков: {{ stats.receivedLikes }}</p>
        <p v-if="isOwnProfile">● Кол-во поставленных лайков: {{ stats.givenLikes }}</p>
      </div>

      <!-- Ваши / Публичные мелодии -->
      <h2 class="section-title">{{ isOwnProfile ? 'Ваши мелодии' : 'Публичные мелодии' }}</h2>
      <div class="track-scroll-area">
        <div v-if="tracks.length > 0" class="tracks-list">
          <MelodyElement
              v-for="track in tracks"
              :key="track.id"
              :track="track"
              :show-artist-link="true"
              :show-more="true"
              @like="() => toggleLike(track.id)"
            />
        </div>
        <p v-else class="empty-state">
          {{ isOwnProfile ? 'У вас пока нет мелодий.' : 'У пользователя пока нет мелодий.' }}
        </p>
      </div>

      <!-- Лайкнутые мелодии (только для своего профиля) -->
      <template v-if="isOwnProfile">
        <h2 class="section-title">Ваши лайкнутые мелодии</h2>
        <div class="track-scroll-area">
          <div v-if="likedTracks.length > 0" class="tracks-list">
            <MelodyElement
              v-for="track in likedTracks"
              :key="track.id"
              :track="track"
              :show-artist-link="true"
              :show-more="true"
              @like="() => toggleLike(track.id)"
            />
          </div>
          <p v-else class="empty-state">Вы ещё не лайкнули ни одной мелодии.</p>
        </div>
      </template>
    </div>
  </div>

  <!-- Уведомление -->
  <div
    v-if="notification.show"
    class="notification"
    :class="`notification--${notification.type}`"
  >
    {{ notification.message }}
  </div>

  <!-- Модальное окно редактирования -->
  <EditProfileModal
    v-if="isOwnProfile"
    :is-open="isEditModalOpen"
    :display-name="currentDisplayName"
    :avatar-url="currentAvatarUrl"
    @close="isEditModalOpen = false"
    @save="saveProfile"
  />
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
  0%,
  100% {
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
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px 0;
  margin: 0;
  box-sizing: border-box;
  font-family: "Jaldi", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  z-index: 1;
}
.profile-container {
  width: 100%;
  max-width: 850px;
  background-color: #121212f1;
  color: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
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
.artist {
  color: #fff;
}
.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e1e1e;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}
.track-item:hover {
  background-color: #252525;
}
.track-item .heart-icon {
  font-size: 22px;
}
.track-left {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
}
.track-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #bbb;
}
.track-title {
  font-weight: bold;
  font-size: 18px;
  padding: 0px 0px 0px 10px;
}
.separator {
  color: #a5a5a5;
  margin: 0 8px;
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
.duration,
.date,
.likes,
.more {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* === УВЕДОМЛЕНИЯ === */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background-color: #333;
  animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s;
}
.notification--success {
  background-color: #4caf50;
}
.notification--error {
  background-color: #f44336;
}
.notification--info {
  background-color: #2196f3;
}

/* === НЕЗАВИСИМЫЕ ПРОКРУЧИВАЕМЫЕ ОБЛАСТИ ДЛЯ ТРЕКОВ === */
.track-scroll-area {
  max-height: 220px;
  overflow-y: auto;
  padding: 8px 0;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #1a1a1a10;
}
.track-scroll-area::-webkit-scrollbar {
  width: 6px;
}
.track-scroll-area::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}
.track-scroll-area::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 3px;
}
.track-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}

/* === КНОПКА НАЗАД === */
.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s ease;
}
.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>