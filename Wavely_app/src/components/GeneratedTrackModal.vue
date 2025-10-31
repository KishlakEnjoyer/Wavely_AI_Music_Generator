<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  track: { type: Object, default: null }
})
const emit = defineEmits(['close', 'save'])

const title = ref('')
const publish = ref(false)

watch(() => props.track, (t) => {
  if (!t) return
  title.value = t.title || ''
  publish.value = !!t.publicTrack
}, { immediate: true })

const close = () => emit('close')
const save = () => emit('save', { title: title.value.trim() || 'Untitled track', publish: publish.value })
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-body">
      <div class="modal-title">Параметры трека</div>
      <div class="modal-field">
        <label>Название</label>
        <input v-model="title" type="text" class="modal-input" placeholder="Введите название" />
      </div>
      <div class="modal-field">
        <label class="checkbox">
          <input type="checkbox" v-model="publish" />
          Опубликовать трек
        </label>
      </div>
      <div class="modal-actions">
        <button class="modal-btn" @click="close">Отмена</button>
        <button class="modal-btn primary" @click="save">Сохранить</button>
      </div>
    </div>
  </div>
  </template>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index: 1000; }
.modal-body { width: 520px; background: #191919; border: 1px solid #00000027; border-radius: 16px; padding: 18px; color: #f3f3f3; }
.modal-title { font-weight: 700; margin-bottom: 12px; }
.modal-field { margin-bottom: 12px; }
.modal-input { width: 100%; height: 44px; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.25); background: #0a0a0a60; color: #f3f3f3; }
.checkbox { display: flex; align-items: center; gap: 8px; opacity: 0.9; }
.modal-actions { display:flex; justify-content:flex-end; gap: 8px; margin-top: 10px; }
.modal-btn { height: 40px; padding: 0 14px; border-radius: 12px; border: 1px solid #00000027; background: #0a0a0a80; color: #f3f3f3; }
.modal-btn.primary { background: linear-gradient(-43deg, rgba(49, 206, 244, 1), rgba(232, 46, 204, 1)); }
</style>