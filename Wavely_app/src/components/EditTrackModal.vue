<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  trackTitle: String
})

const emit = defineEmits(['close', 'save'])

const localTrackTitle = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    localTrackTitle.value = props.trackTitle || ''
  }
}, { immediate: true })

const saveTrack = () => {
  const newTitle = localTrackTitle.value.trim()
  if (!newTitle) {
    // Можно добавить уведомление, если название пустое
    return
  }

  emit('save', { newTitle })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <h2>Редактировать трек</h2>
        <form @submit.prevent="saveTrack">
          <div class="form-group">
            <label for="trackTitle">Название трека</label>
            <input
              id="trackTitle"
              v-model="localTrackTitle"
              type="text"
              class="form-input"
              placeholder="Введите название"
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Отмена</button>
            <button type="submit" class="btn-save">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
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
  /* Центрирование с помощью transform */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2001;
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