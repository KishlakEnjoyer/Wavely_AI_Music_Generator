<script>
import HeaderComponent from './components/HeaderComponent.vue';
import CenterComponent from './components/CenterComponent.vue';

export default {
  components: {
    CenterComponent,
    HeaderComponent
  },
  mounted() {
    const blobs = document.querySelectorAll('.blob');
    
    setInterval(() => {
      blobs.forEach(blob => {
        const randomX = Math.random() * 40 - 20;
        const randomY = Math.random() * 40 - 20;
        const randomScale = 0.9 + Math.random() * 0.2;
        
        blob.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
      });
    }, 1500);
  }
}
</script>

<template>
    <HeaderComponent/>
    <CenterComponent/>

    <div class="background-container">
        <img src="./assets/Background.png" alt="Фон" class="background-image">
    </div>

    <div class="liquid-bg">
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
    </div>
</template>

<style>

* {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family:'Jaldi', sans-serif;
        }

        body {
            color: white;
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
            20% { /* Быстрее достигаем первой точки */
                transform: translate(80px, -80px) scale(1.1); /* Увеличено перемещение */
                border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }
            40% { /* Быстрее достигаем второй точки */
                transform: translate(0, -150px) scale(1.2); /* Увеличено перемещение */
                border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
            }
            60% { /* Быстрее достигаем третьей точки */
                transform: translate(-80px, -80px) scale(1.1); /* Увеличено перемещение */
                border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
            }
            80% { /* Добавлена дополнительная точка для большего движения */
                transform: translate(60px, 40px) scale(0.95);
                border-radius: 50% 50% 60% 40% / 60% 70% 30% 40%;
            }
        }
</style>