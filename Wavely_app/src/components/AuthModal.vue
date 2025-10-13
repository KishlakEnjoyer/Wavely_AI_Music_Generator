<script setup>
import { ref } from 'vue'

const show = ref(false)
const email = ref('')
const password = ref('')

// Экспортируем методы для родительского компонента
defineExpose({
open: () => {
    show.value = true
}})

const emit = defineEmits(['login'])

const handleLogin = () => {
// Здесь можно добавить логику входа (например, API запрос)
console.log('Логин:', email.value, password.value)
emit('login', { email: email.value, password: password.value })
close()
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Авторизация</h2>
      <form>
        <div class="input-group">
          <i class="fas fa-envelope"></i>
          <input type="email" v-model="email" placeholder="Введите почту" required />
        </div>

        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Введите пароль" required />
          <i class="fas fa-eye toggle-password" @click="togglePassword"></i>
        </div>

        <div class="options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            Запомнить меня
          </label>
          <a href="#" class="forgot-password">Забыли пароль?</a>
        </div>

        <button type="submit" class="login-btn">Войти</button>

        <div class="divider">
          <span>или</span>
        </div>

        <p class="register-link">
          Нет аккаунта? <a href="#">регистрация</a>
        </p>

      </form>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* полупрозрачный чёрный */
  backdrop-filter: blur(2px);      /* ← вот это создаёт размытие */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 16px;
  position: relative;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-content h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.input-group {
  position: relative;
  margin-bottom: 1rem;
}

.input-group i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.input-group input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
}

.toggle-password:hover {
  color: #007bff;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007bff;
}

.forgot-password {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: #0056b3;
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
  color: #666;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>