<script>
import HeaderComponent from '../components/HeaderComponent.vue';
import CenterComponent from '../components/CenterComponent.vue';

export default {
  components: {
    CenterComponent,
    HeaderComponent
  },
  data() {
    return {
      showBackToTop: false,
    };
  },
  mounted() {
    // Анимация blob-ов
    const blobs = document.querySelectorAll('.blob');
    setInterval(() => {
      blobs.forEach(blob => {
        const randomX = Math.random() * 40 - 20;
        const randomY = Math.random() * 40 - 20;
        const randomScale = 0.9 + Math.random() * 0.2;
        blob.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
      });
    }, 1500);

    // Отслеживание прокрутки
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      // Проверяем, прокрутили ли мы более 50% высоты вьюпорта
      this.showBackToTop = window.scrollY > window.innerHeight * 0.5;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Плавная прокрутка
      });
    }
  }
}
</script>

<template>
  <HeaderComponent class="header"/>
  <CenterComponent/>

  <div class="background-container">
    <img src="../assets/Background.png" alt="Фон" class="background-image">
  </div>

  <div class="liquid-bg">
    <div class="blob"></div>
    <div class="blob"></div>
    <div class="blob"></div>
    <div class="blob"></div>
  </div>

  <!-- Кнопка "Вверх" -->
  <button
    v-if="showBackToTop"
    @click="scrollToTop"
    class="back-to-top"
    title="Наверх"
  >
    <!-- Стрелка вверх -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 19V5M5 12L12 5L19 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Jaldi', sans-serif;
}

.header {
  z-index: 1;
}

body {
  color: black;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -20;
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
  z-index: -3;
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

/* === КНОПКА НАВЕРХ === */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  animation: fadeIn 0.3s ease-out forwards;
}

.back-to-top:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.back-to-top:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>