<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase.js'
import AuthModal from './AuthModal.vue'
import RegisterModal from './RegisterModal.vue'

const authModal = ref(null)
const registerModal = ref(null)

const currentUser = ref(null)

let authListener

onMounted(() => {
  supabase.auth.getUser().then(({ data, error }) => {
    if (error) {
      console.error('Ошибка получения пользователя:', error)
    } else {
      currentUser.value = data.user
    }
  })

  authListener = supabase.auth.onAuthStateChange((event, session) => {
    currentUser.value = session?.user ?? null
  })
})

onUnmounted(() => {
  if (authListener) {
    authListener.data.subscription.unsubscribe()
  }
})

const openAuthModal = () => authModal.value.open()
const openRegisterModal = () => registerModal.value.open()

const switchToRegister = () => {
  authModal.value.close()
  registerModal.value.open()
}
const switchToAuth = () => {
  registerModal.value.close()
  authModal.value.open()
}

const onLogin = (data) => {
  currentUser.value = data.user
  console.log('Вход успешен:', data)
}
const onRegister = (data) => {
  currentUser.value = data.user
  console.log('Регистрация успешна:', data)
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  currentUser.value = null
}
</script>

<template>
    <div class="header">
        <div class="header-content">
            <img src="../assets/icons/logo.svg" alt="Logo" />
            <p>Wavely</p>
        </div>
        <div class="header-content">
            <!-- Отображаем кнопки, если пользователь не авторизован -->
            <template v-if="!currentUser">
                <button class="login-btn" @click="openAuthModal">Войти</button>
                <button class="register-btn" @click="openRegisterModal">Регистрация</button>
            </template>

            <!-- Отображаем ссылку с никнеймом, если пользователь авторизован -->
            <template v-else>
                <RouterLink to="/profile" class="user-nickname" >
                  {{ currentUser.user_metadata?.display_name || currentUser.email }}
                </RouterLink>
                <button @click="handleLogout" class="logout-btn">Выйти</button>
            </template>
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
    border-color: transparent;
    &:hover {
        border-color: #00F0FF;
        color: #00F0FF;
        transition: all 0.3s ease-out;
        background-color: #007bff;
        transform: none;
    }
}

.logout-btn {
    background-color: transparent;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 13px;
    &:hover {
        color: #00F0FF;
    }
}

.user-nickname {
    color: white;
    text-decoration: none;
    margin-right: 15px;
    &:hover {
        text-decoration: underline;
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