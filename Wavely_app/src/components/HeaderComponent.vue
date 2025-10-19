<script setup>
import { ref } from 'vue'
import AuthModal from './AuthModal.vue'
import RegisterModal from './RegisterModal.vue'

const authModal = ref(null)
const registerModal = ref(null)

const loginModal = ref(null)

const openAuthModal = () => {
  authModal.value.open()
}

const openRegisterModal = () => {
    registerModal.value.open()
}

//Переключение между окнами
const switchToRegister = () => {
  authModal.value.close()
  registerModal.value.open()
}

const switchToAuth = () => {
  registerModal.value.close()
  authModal.value.open()
}

const onLogin = (data) => {
  console.log('Вход успешен:', data)
}

const onRegister = (data) => {
  console.log('Регистрация успешна:', data)
}
</script>

<template>
    <div class="header">
        <div class="header-content">
            <img src="../assets/icons/logo.svg"></img>
            <p>Wavely</p>
        </div>
        <div class="header-content">
            <button class="login-btn" @click="openAuthModal">Войти</button>
            <button class="register-btn" @click="openRegisterModal">Регистрация</button>
        </div>

        <AuthModal ref="authModal" @login="onLogin" @switch-to-register="switchToRegister"/>
        <RegisterModal ref="registerModal" @register="onRegister" @switch-to-login="switchToAuth"/>
    </div>
</template>

<style>
.login-btn {
    background-color: transparent;
    color: white;
    border-color: transparent;
    &:hover {
        color: #00F0FF;
        border-color: #00F0FF;
        background-color: #007bff;
        transition: all 0.3s ease-out;
        transform: none;
    }
}

.register-btn {
    background-color: white;
    color: black;
    border-color:  transparent;
    &:hover {
        border-color: #00F0FF;
        color: #00F0FF;
        transition: all 0.3s ease-out;
        background-color: #007bff;
        transform: none;
    }
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-content p {
    font-size: 40px;
    color: white;
}

.header-content button {
    padding: 10px 40px;
    border-radius: 29px;
    font-size: 13px;
    border: solid white;
    font-family: 'Jaldi', sans-serif;
    transition: all 0.3s ease;
}


.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 26px;
    height: 97px;
    width: 100%;
    padding: 0 160px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}
</style>