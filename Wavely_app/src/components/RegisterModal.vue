<!-- src/components/RegisterModal.vue -->
<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supaBaseClient'

const show = ref(false)
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

// Экспортируем методы для родителя
defineExpose({
  open: () => {
    show.value = true
  },
  close: () => {
    show.value = false
  }
})

const emit = defineEmits(['register', 'switch-to-login'])

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const togglePasswordConfirm = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value
}

const close = () => {
  show.value = false
}

const handleRegister = async () => {
  if (password.value !== passwordConfirm.value) {
    alert('Пароли не совпадают!')
    return
  }

  if (password.value.length < 6) {
    alert('Пароль должен быть не короче 6 символов')
    return
  }

  try {
    const nickname = email.value.split('@')[0]

    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          display_name: nickname // 👈 Сохраняем в user_metadata (опционально)
        }
      }
    })

    if (error) {
      alert('Ошибка регистрации: ' + error.message)
      return
    }

    // ✅ Обновляем Display name через updateUser
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        display_name: nickname // 👈 Это попадёт в поле "Display name" в админке!
      }
    })

    if (updateError) {
      console.warn('Не удалось обновить Display name:', updateError)
    }

    alert('Регистрация успешна!')
    emit('register', { user: data?.user })
    close()
  } catch (err) {
    console.error('Ошибка:', err)
    alert('Произошла ошибка при регистрации')
  }
}

const onOverlayClick = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    close()
  }
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content">
      <h2>Регистрация</h2>

      <form @submit.prevent="handleRegister">
        <!-- Email -->
        <div class="input-group">
          <i class="icon-envelope">
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 18.5H6C3 18.5 1 17 1 13.5V6.5C1 3 3 1.5 6 1.5H16C19 1.5 21 3 21 6.5V13.5C21 17 19 18.5 16 18.5Z" stroke="currentColor" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17.7698 5.7688L12.2228 10.0551C11.5025 10.6116 10.4973 10.6116 9.777 10.0551L4.22998 5.7688" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </i>
          <input v-model="email" type="email" placeholder="Введите почту" required />
        </div>

        <!-- Password -->
        <div class="input-group">
          <i class="icon-lock">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8.0288C4.47142 8 5.05259 8 5.8 8H12.2C12.9474 8 13.5286 8 14 8.0288M4 8.0288C3.41168 8.0647 2.99429 8.1455 2.63803 8.327C2.07354 8.6146 1.6146 9.0735 1.32698 9.638C1 10.2798 1 11.1198 1 12.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H12.2C13.8802 19 14.7202 19 15.362 18.673C15.9265 18.3854 16.3854 17.9265 16.673 17.362C17 16.7202 17 15.8802 17 14.2V12.8C17 11.1198 17 10.2798 16.673 9.638C16.3854 9.0735 15.9265 8.6146 15.362 8.327C15.0057 8.1455 14.5883 8.0647 14 8.0288M4 8.0288V6C4 3.23858 6.23858 1 9 1C11.7614 1 14 3.23858 14 6V8.0288" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </i>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Введите пароль"
            required
          />
          <i class="toggle-password" @click="togglePassword">
            <svg v-if="!showPassword" width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8C14 9.6569 12.6569 11 11 11C9.3431 11 8 9.6569 8 8C8 6.3431 9.3431 5 11 5C12.6569 5 14 6.3431 14 8Z" stroke="currentColor" stroke-width="1.7"/>
              <path d="M5.94969 3.05025C8.68336 0.316582 13.1155 0.316582 15.8491 3.05025L17.9705 5.17157C19.3038 6.5049 19.9705 7.1716 19.9705 8C19.9705 8.8284 19.3038 9.4951 17.9705 10.8284L15.8491 12.9497C13.1155 15.6834 8.68336 15.6834 5.94969 12.9497L3.82837 10.8284C2.49503 9.4951 1.82837 8.8284 1.82837 8C1.82837 7.1716 2.49503 6.5049 3.82837 5.17157L5.94969 3.05025Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8C14 9.6569 12.6569 11 11 11C9.3431 11 8 9.6569 8 8C8 6.3431 9.3431 5 11 5C12.6569 5 14 6.3431 14 8Z" stroke="currentColor" stroke-width="1.7"/>
              <path d="M5.94969 3.05025C8.68336 0.316582 13.1155 0.316582 15.8491 3.05025L17.9705 5.17157C19.3038 6.5049 19.9705 7.1716 19.9705 8C19.9705 8.8284 19.3038 9.4951 17.9705 10.8284L15.8491 12.9497C13.1155 15.6834 8.68336 15.6834 5.94969 12.9497L3.82837 10.8284C2.49503 9.4951 1.82837 8.8284 1.82837 8C1.82837 7.1716 2.49503 6.5049 3.82837 5.17157L5.94969 3.05025Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              <path d="M3 3L18 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </i>
        </div>

        <!-- Confirm Password -->
        <div class="input-group">
          <i class="icon-lock">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8.0288C4.47142 8 5.05259 8 5.8 8H12.2C12.9474 8 13.5286 8 14 8.0288M4 8.0288C3.41168 8.0647 2.99429 8.1455 2.63803 8.327C2.07354 8.6146 1.6146 9.0735 1.32698 9.638C1 10.2798 1 11.1198 1 12.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H12.2C13.8802 19 14.7202 19 15.362 18.673C15.9265 18.3854 16.3854 17.9265 16.673 17.362C17 16.7202 17 15.8802 17 14.2V12.8C17 11.1198 17 10.2798 16.673 9.638C16.3854 9.0735 15.9265 8.6146 15.362 8.327C15.0057 8.1455 14.5883 8.0647 14 8.0288M4 8.0288V6C4 3.23858 6.23858 1 9 1C11.7614 1 14 3.23858 14 6V8.0288" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </i>
          <input
            :type="showPasswordConfirm ? 'text' : 'password'"
            v-model="passwordConfirm"
            placeholder="Подтвердите пароль"
            required
          />
          <i class="toggle-password" @click="togglePasswordConfirm">
            <svg v-if="!showPasswordConfirm" width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8C14 9.6569 12.6569 11 11 11C9.3431 11 8 9.6569 8 8C8 6.3431 9.3431 5 11 5C12.6569 5 14 6.3431 14 8Z" stroke="currentColor" stroke-width="1.7"/>
              <path d="M5.94969 3.05025C8.68336 0.316582 13.1155 0.316582 15.8491 3.05025L17.9705 5.17157C19.3038 6.5049 19.9705 7.1716 19.9705 8C19.9705 8.8284 19.3038 9.4951 17.9705 10.8284L15.8491 12.9497C13.1155 15.6834 8.68336 15.6834 5.94969 12.9497L3.82837 10.8284C2.49503 9.4951 1.82837 8.8284 1.82837 8C1.82837 7.1716 2.49503 6.5049 3.82837 5.17157L5.94969 3.05025Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8C14 9.6569 12.6569 11 11 11C9.3431 11 8 9.6569 8 8C8 6.3431 9.3431 5 11 5C12.6569 5 14 6.3431 14 8Z" stroke="currentColor" stroke-width="1.7"/>
              <path d="M5.94969 3.05025C8.68336 0.316582 13.1155 0.316582 15.8491 3.05025L17.9705 5.17157C19.3038 6.5049 19.9705 7.1716 19.9705 8C19.9705 8.8284 19.3038 9.4951 17.9705 10.8284L15.8491 12.9497C13.1155 15.6834 8.68336 15.6834 5.94969 12.9497L3.82837 10.8284C2.49503 9.4951 1.82837 8.8284 1.82837 8C1.82837 7.1716 2.49503 6.5049 3.82837 5.17157L5.94969 3.05025Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              <path d="M3 3L18 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
            </svg>
          </i>
        </div>

        <button type="submit" class="login-btn">Зарегистрироваться</button>

        <div class="divider">
          <span>или</span>
        </div>

        <p class="register-link">
          Уже есть аккаунт?
          <a href="#" @click.prevent="emit('switch-to-login')">Войти</a>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  background: rgba(255, 255, 255, 0.3);
  padding: 2rem;
  border-radius: 15px;
  position: relative;
  max-width: 400px;
  width: 90%;
  box-shadow:
    0 10px 30px -10px rgba(0, 0, 0, 0.3),
    0 20px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.4s ease-out;
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #fff;
  font-weight: 500;
  font-family: 'Jaldi', sans-serif;
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #1f1f1f;
  padding: 5px 15px;
  border-radius: 20px;
}

.input-group i {
  flex-shrink: 0;
  color: #c4c4c4;
}

.input-group input {
  flex: 1;
  padding: 0.75rem;
  border-radius: 20px;
  font-size: 1rem;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  color: white;
  caret-color: white;
  background-color: transparent;
  outline: none !important;
}

.input-group input::placeholder {
  color: #aaa;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
  z-index: 10;
}

.toggle-password:hover {
  color: #00c4cc;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #00c4cc;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #00b0b3;
  transform: translateY(-1px);
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #aaa;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #ddd;
  margin: 0 0.5rem;
}

.register-link {
  text-align: center;
  font-size: 0.9rem;
  color: #ccc;
}

.register-link a {
  color: #00c4cc;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>