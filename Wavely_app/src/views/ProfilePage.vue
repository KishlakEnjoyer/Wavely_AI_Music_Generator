<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "@/lib/supabase";
import EditProfileModal from "@/components/EditProfileModal.vue";

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
          <div v-for="track in tracks" :key="track.id" class="track-item">
            <div class="track-left">
              <span @click.stop="toggleLike(track.id)" class="heart-icon" style="cursor: pointer; display: flex; align-items: center">
                <svg
                  class="heart-logo"
                  v-if="!track.isLikedByUser"
                  width="23"
                  height="23"
                  viewBox="0 0 30 27"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M26.7217 3.1491C26.0407 2.46777 25.2321 1.9273 24.3422 1.55855C23.4522 1.1898 22.4984 1 21.5351 1C20.5717 1 19.6179 1.1898 18.7279 1.55855C17.838 1.9273 17.0294 2.46777 16.3484 3.1491L14.9351 4.56243L13.5217 3.1491C12.1461 1.77351 10.2804 1.00071 8.33505 1.00071C6.38968 1.00071 4.52398 1.77351 3.14839 3.1491C1.7728 4.52469 1 6.39039 1 8.33577C1 10.2811 1.7728 12.1468 3.14839 13.5224L14.9351 25.3091L26.7217 13.5224C27.403 12.8414 27.9435 12.0329 28.3123 11.1429C28.681 10.253 28.8708 9.29908 28.8708 8.33577C28.8708 7.37245 28.681 6.41857 28.3123 5.52863C27.9435 4.63868 27.403 3.83011 26.7217 3.1491Z"
                    stroke="#F3F3F3"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  v-else
                  class="heart-logo"
                  width="23"
                  height="23"
                  viewBox="0 0 29 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M26.2217 2.6491C25.5407 1.96777 24.7321 1.4273 23.8422 1.05855C22.9522 0.689796 21.9984 0.5 21.0351 0.5C20.0717 0.5 19.1179 0.689796 18.2279 1.05855C17.338 1.4273 16.5294 1.96777 15.8484 2.6491L14.4351 4.06243L13.0217 2.6491C11.6461 1.27351 9.78043 0.500713 7.83505 0.500713C5.88968 0.500713 4.02398 1.27351 2.64839 2.6491C1.2728 4.02469 0.5 5.89039 0.5 7.83577C0.5 9.78114 1.2728 11.6468 2.64839 13.0224L14.4351 24.8091L26.2217 13.0224C26.903 12.3414 27.4435 11.5329 27.8123 10.6429C28.181 9.75296 28.3708 8.79908 28.3708 7.83577C28.3708 6.87245 28.181 5.91857 27.8123 5.02863C27.4435 4.13868 26.903 3.33011 26.2217 2.6491Z"
                    fill="url(#paint0_linear_273_11)"
                    stroke="url(#paint1_linear_273_11)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <defs>
                    <linearGradient id="paint0_linear_273_11" x1="3.43506" y1="4.00244" x2="24.4351" y2="21.0024" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#26CEE6" />
                      <stop offset="1" stop-color="#DA27F5" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_273_11" x1="0.435059" y1="0.502441" x2="28.4351" y2="24.5024" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#26CEE6" />
                      <stop offset="1" stop-color="#B747F2" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span class="track-title">{{ track.title }}</span>
              <span class="separator">|</span>
              <RouterLink v-if="!isOwnProfile" :to="`/profile/${track.author}`" class="artist">{{ track.authorNick }}</RouterLink>
              <span v-else class="artist">{{ track.authorNick }}</span>
            </div>
            <div class="track-right">
              <div class="duration" style="display: flex">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.33333 2.83333V6.33333L8.66667 7.5M12.1667 6.33333C12.1667 9.55499 9.55499 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.55499 0.5 12.1667 3.11167 12.1667 6.33333Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ track.duration }}
              </div>
              <span class="separator">|</span>
              <div class="date" style="display: flex">
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.08333 0.5V2.83333M3.41667 0.5V2.83333M0.5 5.16667H11M1.66667 1.66667H9.83333C10.4777 1.66667 11 2.189 11 2.83333V11C11 11.6443 10.4777 12.1667 9.83333 12.1667H1.66667C1.02233 12.1667 0.5 11.6443 0.5 11V2.83333C0.5 2.189 1.02233 1.66667 1.66667 1.66667Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span> {{ track.date }}</span>
              </div>
              <span class="separator">|</span>
              <div class="likes" style="display: flex">
                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3609 1.57455C13.0204 1.23389 12.6161 0.963648 12.1711 0.779273C11.7261 0.594898 11.2492 0.5 10.7675 0.5C10.2859 0.5 9.80893 0.594898 9.36396 0.779273C8.91898 0.963648 8.5147 1.23389 8.17419 1.57455L7.46753 2.28122L6.76086 1.57455C6.07307 0.886756 5.14022 0.500357 4.16753 0.500357C3.19484 0.500357 2.26199 0.886756 1.57419 1.57455C0.886399 2.26235 0.5 3.19519 0.5 4.16788C0.5 5.14057 0.886399 6.07342 1.57419 6.76122L7.46753 12.6545L13.3609 6.76122C13.7015 6.42071 13.9718 6.01643 14.1561 5.57145C14.3405 5.12648 14.4354 4.64954 14.4354 4.16788C14.4354 3.68623 14.4354 3.20929 14.1561 2.76431C13.9718 2.31934 13.7015 1.91505 13.3609 1.57455Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span> {{ track.likesCount }}</span>
              </div>
              <span v-if="isOwnProfile" class="more" style="font-weight: bold">···</span>
            </div>
          </div>
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
            <div v-for="track in likedTracks" :key="track.id" class="track-item">
              <div class="track-left">
                <span @click.stop="toggleLike(track.id)" class="heart-icon" style="cursor: pointer; display: flex; align-items: center">
                  <svg
                    class="heart-logo"
                    v-if="!track.isLikedByUser"
                    width="23"
                    height="23"
                    viewBox="0 0 30 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M26.7217 3.1491C26.0407 2.46777 25.2321 1.9273 24.3422 1.55855C23.4522 1.1898 22.4984 1 21.5351 1C20.5717 1 19.6179 1.1898 18.7279 1.55855C17.838 1.9273 17.0294 2.46777 16.3484 3.1491L14.9351 4.56243L13.5217 3.1491C12.1461 1.77351 10.2804 1.00071 8.33505 1.00071C6.38968 1.00071 4.52398 1.77351 3.14839 3.1491C1.7728 4.52469 1 6.39039 1 8.33577C1 10.2811 1.7728 12.1468 3.14839 13.5224L14.9351 25.3091L26.7217 13.5224C27.403 12.8414 27.9435 12.0329 28.3123 11.1429C28.681 10.253 28.8708 9.29908 28.8708 8.33577C28.8708 7.37245 28.681 6.41857 28.3123 5.52863C27.9435 4.63868 27.403 3.83011 26.7217 3.1491Z"
                      stroke="#F3F3F3"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    class="heart-logo"
                    width="23"
                    height="23"
                    viewBox="0 0 29 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M26.2217 2.6491C25.5407 1.96777 24.7321 1.4273 23.8422 1.05855C22.9522 0.689796 21.9984 0.5 21.0351 0.5C20.0717 0.5 19.1179 0.689796 18.2279 1.05855C17.338 1.4273 16.5294 1.96777 15.8484 2.6491L14.4351 4.06243L13.0217 2.6491C11.6461 1.27351 9.78043 0.500713 7.83505 0.500713C5.88968 0.500713 4.02398 1.27351 2.64839 2.6491C1.2728 4.02469 0.5 5.89039 0.5 7.83577C0.5 9.78114 1.2728 11.6468 2.64839 13.0224L14.4351 24.8091L26.2217 13.0224C26.903 12.3414 27.4435 11.5329 27.8123 10.6429C28.181 9.75296 28.3708 8.79908 28.3708 7.83577C28.3708 6.87245 28.181 5.91857 27.8123 5.02863C27.4435 4.13868 26.903 3.33011 26.2217 2.6491Z"
                      fill="url(#paint0_linear_273_11)"
                      stroke="url(#paint1_linear_273_11)"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <defs>
                      <linearGradient id="paint0_linear_273_11" x1="3.43506" y1="4.00244" x2="24.4351" y2="21.0024" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#26CEE6" />
                        <stop offset="1" stop-color="#DA27F5" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_273_11" x1="0.435059" y1="0.502441" x2="28.4351" y2="24.5024" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#26CEE6" />
                        <stop offset="1" stop-color="#B747F2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span class="track-title">{{ track.title }}</span>
                <span class="separator">|</span>
                <RouterLink :to="`/profile/${track.author}`" class="artist">{{ track.authorNick }}</RouterLink>
              </div>
              <div class="track-right">
                <div class="duration" style="display: flex">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.33333 2.83333V6.33333L8.66667 7.5M12.1667 6.33333C12.1667 9.55499 9.55499 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.55499 0.5 12.1667 3.11167 12.1667 6.33333Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ track.duration }}
                </div>
                <span class="separator">|</span>
                <div class="date" style="display: flex">
                  <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.08333 0.5V2.83333M3.41667 0.5V2.83333M0.5 5.16667H11M1.66667 1.66667H9.83333C10.4777 1.66667 11 2.189 11 2.83333V11C11 11.6443 10.4777 12.1667 9.83333 12.1667H1.66667C1.02233 12.1667 0.5 11.6443 0.5 11V2.83333C0.5 2.189 1.02233 1.66667 1.66667 1.66667Z" stroke="#F3F3F3" stroke-opacity="0.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span> {{ track.date }}</span>
                </div>
                <span class="separator">|</span>
                <div class="likes" style="display: flex">
                  <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3609 1.57455C13.0204 1.23389 12.6161 0.963648 12.1711 0.779273C11.7261 0.594898 11.2492 0.5 10.7675 0.5C10.2859 0.5 9.80893 0.594898 9.36396 0.779273C8.91898 0.963648 8.5147 1.23389 8.17419 1.57455L7.46753 2.28122L6.76086 1.57455C6.07307 0.886756 5.14022 0.500357 4.16753 0.500357C3.19484 0.500357 2.26199 0.886756 1.57419 1.57455C0.886399 2.26235 0.5 3.19519 0.5 4.16788C0.5 5.14057 0.886399 6.07342 1.57419 6.76122L7.46753 12.6545L13.3609 6.76122C13.7015 6.42071 13.9718 6.01643 14.1561 5.57145C14.3405 5.12648 14.4354 4.64954 14.4354 4.16788C14.4354 3.68623 14.4354 3.20929 14.1561 2.76431C13.9718 2.31934 13.7015 1.91505 13.3609 1.57455Z" stroke="#5A5A5A" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span> {{ track.likesCount }}</span>
                </div>
                <span class="more" style="font-weight: bold">···</span>
              </div>
            </div>
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