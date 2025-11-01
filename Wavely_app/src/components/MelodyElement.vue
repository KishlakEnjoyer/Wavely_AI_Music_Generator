<!-- src/components/MelodyElement.vue -->
<script setup>
import { defineProps, defineEmits, toRefs } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  track: {
    type: Object,
    required: true,
  },
  showArtistLink: {
    type: Boolean,
    default: true,
  },
  showMore: {
    type: Boolean,
    default: false,
  },
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

// toRefs сохраняет реактивность при "распаковке" props
const { track, showArtistLink, showMore, isPlaying } = toRefs(props);

const emit = defineEmits(["like", "play"]);

const onLike = () => {
  emit("like");
};

const onPlay = () => {
  emit("play");
};
</script>


<template>
  <div 
    class="track-item" 
    :class="{ active: isPlaying }"
    @click="onPlay"
  >
    <div class="track-left">
      <span
        @click.stop="onLike"
        class="heart-icon"
        style="cursor: pointer; display: flex; align-items: center"
      >
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
            <linearGradient
              id="paint0_linear_273_11"
              x1="3.43506"
              y1="4.00244"
              x2="24.4351"
              y2="21.0024"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#26CEE6" />
              <stop offset="1" stop-color="#DA27F5" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_273_11"
              x1="0.435059"
              y1="0.502441"
              x2="28.4351"
              y2="24.5024"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#26CEE6" />
              <stop offset="1" stop-color="#B747F2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span class="track-title">{{ track.title }}</span>
      <span class="separator">|</span>
      <RouterLink
        v-if="showArtistLink"
        :to="`/profile/${track.author}`"
        class="artist"
        @click.stop
        >{{ track.authorNick }}</RouterLink
      >
      <span v-else class="artist">{{ track.authorNick }}</span>
      
      <!-- Индикатор воспроизведения -->
      <span v-if="isPlaying" class="playing-indicator">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 2L13 8L3 14V2Z" fill="#26CEE6"/>
        </svg>
      </span>
    </div>
    <div class="track-right">
      <div class="duration" style="display: flex">
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.33333 2.83333V6.33333L8.66667 7.5M12.1667 6.33333C12.1667 9.55499 9.55499 12.1667 6.33333 12.1667C3.11167 12.1667 0.5 9.55499 0.5 6.33333C0.5 3.11167 3.11167 0.5 6.33333 0.5C9.55499 0.5 12.1667 3.11167 12.1667 6.33333Z"
            stroke="#F3F3F3"
            stroke-opacity="0.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ track.duration }}
      </div>
      <span class="separator">|</span>
      <div class="date" style="display: flex">
        <svg
          width="12"
          height="13"
          viewBox="0 0 12 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.08333 0.5V2.83333M3.41667 0.5V2.83333M0.5 5.16667H11M1.66667 1.66667H9.83333C10.4777 1.66667 11 2.189 11 2.83333V11C11 11.6443 10.4777 12.1667 9.83333 12.1667H1.66667C1.02233 12.1667 0.5 11.6443 0.5 11V2.83333C0.5 2.189 1.02233 1.66667 1.66667 1.66667Z"
            stroke="#F3F3F3"
            stroke-opacity="0.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span> {{ track.date }}</span>
      </div>
      <span class="separator">|</span>
      <div class="likes" style="display: flex">
        <svg
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.3609 1.57455C13.0204 1.23389 12.6161 0.963648 12.1711 0.779273C11.7261 0.594898 11.2492 0.5 10.7675 0.5C10.2859 0.5 9.80893 0.594898 9.36396 0.779273C8.91898 0.963648 8.5147 1.23389 8.17419 1.57455L7.46753 2.28122L6.76086 1.57455C6.07307 0.886756 5.14022 0.500357 4.16753 0.500357C3.19484 0.500357 2.26199 0.886756 1.57419 1.57455C0.886399 2.26235 0.5 3.19519 0.5 4.16788C0.5 5.14057 0.886399 6.07342 1.57419 6.76122L7.46753 12.6545L13.3609 6.76122C13.7015 6.42071 13.9718 6.01643 14.1561 5.57145C14.3405 5.12648 14.4354 4.64954 14.4354 4.16788C14.4354 3.68623 14.3405 3.20929 14.1561 2.76431C13.9718 2.31934 13.7015 1.91505 13.3609 1.57455Z"
            stroke="#5A5A5A"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span> {{ track.likesCount }}</span>
      </div>
      <div class="track-right">
      <!-- ... остальной код без изменений ... -->
      <!-- Изменяем условие отображения кнопки "ещё" -->
      <span
        v-if="showMore && showThreeDots"
        ref="moreButtonRef"
        class="more"
        style="font-weight: bold; cursor: pointer"
        @click.stop="toggleContextMenu"
      >
        ···
      </span>

      <!-- Контекстное меню -->
      <div
        v-if="isContextMenuOpen"
        ref="contextMenuRef"
        class="context-menu"
        @click.stop
      >
        <button
          class="context-menu-item"
          @click="togglePublicStatus"
        >
          {{ track.publicTrack ? 'Сделать приватным' : 'Сделать публичным' }}
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<style scoped>
.track-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e1e1e;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.track-item:hover {
  background-color: #252525;
}

.track-item.active {
  background: linear-gradient(90deg, rgba(38, 206, 230, 0.1) 0%, rgba(218, 39, 245, 0.05) 100%);
  border: 1px solid rgba(38, 206, 230, 0.3);
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
    position: relative; /* <-- ДОБАВЬТЕ ЭТУ СТРОКУ */

}

.track-title {
  font-weight: bold;
  font-size: 18px;
  padding: 0 0 0 10px;
}

.artist {
  color: #fff;
}

.separator {
  color: #a5a5a5;
  margin: 0 8px;
}

.duration,
.date,
.likes,
.more {
  display: flex;
  align-items: center;
  gap: 8px;
}

.heart-icon {
  font-size: 22px;
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

.heart-logo {
  animation: 0.8s ease-out;
}

.heart-logo:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 0 12px rgba(243, 243, 243, 0.6));
}

.heart-logo {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-origin: center;
}

.heart-logo {
  animation: bounceIn 0.8s ease-out;
}

.playing-indicator {
  margin-left: 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Стили для контекстного меню */
.context-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.context-menu-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: #f3f3f3;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #3a3a3a;
}
</style>