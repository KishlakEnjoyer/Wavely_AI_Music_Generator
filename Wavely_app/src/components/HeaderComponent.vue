<script setup>
import { ref } from 'vue'
import AuthModal from './AuthModal.vue'

const authModal = ref(null)

const openAuthModal = () => {
  authModal.value.open()
}

const onLogin = (credentials) => {
  console.log('Пользователь вошёл:', credentials)
  // Здесь можно сохранить токен, перенаправить и т.д.
}
</script>

<template>
    <div class="header">
        <div class="header-content">
            <img src="./icons/logo.svg"></img>
            <p>Wavely</p>
        </div>
        <div class="header-content">
            <button class="login-btn" @click="openAuthModal">Войти</button>
            <button class="register-btn">Регистрация</button>
        </div>

        <AuthModal ref="authModal" @login="onLogin" />
    </div>
</template>

<style>
.login-btn {
    background-color: transparent;
    color: white;
    border: 2px solid white;
}
.login-btn:hover{
    font-size: 14px;
    color: #00F0FF;
    border-color: #00F0FF;
    transition: all 0.3s ease-out;
}

.register-btn {
    background-color: white;
    color: black;
    border-color:  transparent;
}
.register-btn:hover{
    font-size: 14px;
    border-color: #00F0FF;
    color: #00F0FF;
    transition: all 0.3s ease-out;
}
.register-btn:click{
    background-color: rgba(0, 0, 0, 0.2);
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
    border: 2px solid white;
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