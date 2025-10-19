<script setup>
import { ref, computed } from 'vue'

const promptText = ref('')
const isHovered = ref(false)
const isPressed = ref(false)

const hasText = computed(() => promptText.value.trim().length > 0)

const submitPrompt = () => {
  if (hasText.value) {
    console.log('Промпт отправлен:', promptText.value)
  }
}

const handlePress = () => {
  if (!hasText.value) return
  isPressed.value = true
  setTimeout(() => {
    isPressed.value = false
  }, 300)
}
</script>

<template>
    <div class="center-container">
        <div class="welcome-text">
            <h1>Приветствуем вас в <span class="brand">Wavely!</span></h1>
            <p>В нашем сервисе вы сможете создавать свои уникальные композиции, всего лишь написав промпт для нашей
                модели.</p>
        </div>
        <div class="prompt-form">
            <form @submit.prevent="submitPrompt">
                <div class="input-wrapper">
                    <input v-model="promptText" type="text" placeholder="Введите свою уникальную и интересную идею..."
                        class="prompt-input" required>
                    <button type="submit" class="submit-button"                         
                        :class="{ 
                          'active': hasText, 
                          'hovered': hasText && isHovered,
                          'pressed': isPressed
                        }"
                        @mouseenter="isHovered = true"
                        @mouseleave="isHovered = false"
                        @mousedown="handlePress"
                        @mouseup="isPressed = false"
                        @touchstart="handlePress"
                        @touchend="isPressed = false">
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5 18.9584V2.04169M10.5 2.04169L2.04163 10.5M10.5 2.04169L18.9583 10.5"
                                stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <div class="overlay"></div>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.center-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    text-align: center;
}

.welcome-text {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    font-weight: bold;
}

h1 {
    color: white;
    margin-bottom: 20px;
    font-size: 40px;
}

p {
    color: white;
    font-size: 16px;
    line-height: 1.6;
}

.brand {
    font-weight: bolder;
}

.prompt-form {
    margin-top: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.input-wrapper {
    position: relative;
    width: 590px;
}

.prompt-input {
    width: 100%;
    height: 62px;
    padding: 15px 70px 15px 20px;
    font-size: 16px;
    color: rgb(220, 220, 220);
    border: 1px solid rgba(0, 0, 0, 0.25);
    background-color: #04040460;
    border-radius: 31px;
    transition: all 0.3s ease;
    margin-bottom: 15px;
    box-sizing: border-box;
    outline: none;
}

.prompt-input:hover {
    border: 1px solid #00C4CC20;
    box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.2);
}

.prompt-input:focus {
    border: 1px solid #00C4CC;
    box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.4);
}

.prompt-input::placeholder {
    color: #8c8c8c;
}

.submit-button {
    position: absolute;
    width: 54px;
    height: 54px;
    right: 4px;
    top: 4px;
    background: linear-gradient(-43deg, #31CEF461, #E82ECC61);
    color: rgba(243, 243, 243, 0.61);
    border: 1px #00000027 solid;
    border-radius: 31px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transform: scale(1);
    overflow: hidden;
}

.submit-button.active {
    background: linear-gradient(-43deg, rgba(49, 206, 244, 1), rgba(232, 46, 204, 1));
    color: rgba(243, 243, 243, 1);
    opacity: 1;
}

.submit-button.hovered {
    transform: scale(1.05);
}

.submit-button.pressed {
    transform: scale(0.95);
}

.submit-button.pressed .overlay {
    opacity: 1;
    transform: scale(1);
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 31px;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.5s ease;
    pointer-events: none;
}

.submit-button:not(.active) {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>