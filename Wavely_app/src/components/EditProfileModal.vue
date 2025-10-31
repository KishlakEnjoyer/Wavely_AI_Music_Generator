<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  displayName: String,
  userUsesPasswordAuth: Boolean
})

const emit = defineEmits(['close', 'save'])

const localDisplayName = ref('')
const localNewPassword = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localDisplayName.value = props.displayName || ''
    localNewPassword.value = ''
  }
})

const saveProfile = () => {
  const displayName = localDisplayName.value.trim() || null
  const newPassword = localNewPassword.value.trim() || null

  // Передаём только данные, не пытаемся обновить user.value здесь
  emit('save', { displayName, newPassword })
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>Редактировать профиль</h2>
      <form @submit.prevent="saveProfile">
        <div class="form-group">
          <label for="displayName">Отображаемое имя</label>
          <input
            id="displayName"
            v-model="localDisplayName"
            type="text"
            class="form-input"
            placeholder="Введите имя"
          />
        </div>

        <!-- Поле для нового пароля (только если авторизация по email/password) -->
        <div class="form-group">
          <label for="newPassword">Новый пароль (опционально)</label>
          <input
            id="newPassword"
            v-model="localNewPassword"
            type="password"
            class="form-input"
            placeholder="Введите новый пароль"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Отмена</button>
          <button type="submit" class="btn-save">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #1e1e1e;
  color: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.modal-content h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ccc;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: white;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #26CEE6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel {
  background: #333;
  color: #ccc;
}

.btn-cancel:hover {
  background: #444;
}

.btn-save {
  background: linear-gradient(-43deg, #31CEF4, #E82ECC);
  color: white;
  font-weight: bold;
}

.btn-save:hover {
  opacity: 0.9;
}
</style>