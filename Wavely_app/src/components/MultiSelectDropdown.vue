<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  options: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Выберите инструменты' },
  disabled: { type: Boolean, default: false },
  valueKey: { type: String, default: 'value' },
  labelKey: { type: String, default: 'label' }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selected = ref([...props.modelValue])

watch(() => props.modelValue, (val) => {
  selected.value = [...val]
})

const selectedLabels = computed(() => {
  if (!selected.value.length) return props.placeholder
  const map = new Map(props.options.map(o => [o[props.valueKey], o[props.labelKey]]))
  return selected.value.map(v => map.get(v)).filter(Boolean).join(', ')
})

const toggleOpen = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const isChecked = (val) => selected.value.includes(val)

const toggleOption = (val) => {
  const idx = selected.value.indexOf(val)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else {
    selected.value.push(val)
  }
  emit('update:modelValue', [...selected.value])
}

const clearAll = () => {
  selected.value = []
  emit('update:modelValue', [])
}
</script>

<template>
  <div class="msd" :class="{ disabled }">
    <button type="button" class="msd-trigger" @click="toggleOpen">
      <span class="msd-text">{{ selectedLabels }}</span>
      <svg class="msd-caret" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </button>
    <div v-if="isOpen" class="msd-menu">
      <div class="msd-actions">
        <button type="button" class="msd-action" @click="clearAll">Сбросить</button>
      </div>
      <ul class="msd-list">
        <li v-for="opt in props.options" :key="opt[valueKey]" class="msd-item" @click="toggleOption(opt[valueKey])">
          <label class="msd-option">
            <input type="checkbox" :checked="isChecked(opt[valueKey])" @change.prevent />
            <span class="msd-label">{{ opt[labelKey] }}</span>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
 .msd { position: relative; width: 100%; max-width: 220px; }
.msd.disabled { opacity: 0.6; pointer-events: none; }
.msd-trigger {
  width: 100%; height: 46px; padding: 10px 14px; border-radius: 24px;
  border: 1px solid rgba(0,0,0,0.25); background: #0a0a0a60; color: #f3f3f3;
  display: flex; align-items: center; justify-content: space-between; cursor: pointer;
}
.msd-trigger:hover { border: 1px solid #00C4CC20; box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.2); }
.msd-trigger:focus { border: 1px solid #00C4CC; box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.4); }
.msd-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.msd-caret { opacity: 0.8; }
 .msd-menu {
  position: absolute; left: 0; top: calc(100% + 6px);
  min-width: 100%;
  background: #191919; border: 1px solid #00000027; border-radius: 12px;
  padding: 8px; z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
 }
.msd-actions { display: flex; justify-content: flex-end; margin-bottom: 6px; }
.msd-action { height: 30px; padding: 0 10px; border-radius: 10px; border: 1px solid #00000027; background: #0a0a0a80; color: #f3f3f3; }
.msd-list { list-style: none; margin: 0; padding: 0; max-height: 180px; overflow: auto; }
.msd-item { padding: 6px; border-radius: 8px; }
.msd-item:hover { background: #0a0a0a40; }
.msd-option { display: flex; align-items: center; gap: 8px; }
.msd-label { color: #f3f3f3; }

.dropdown-trigger.open {
  border: 1px solid #00C4CC;
  box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.4);
}

.display-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  color: rgb(220, 220, 220);
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #191919;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(0, 196, 204, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(220, 220, 220, 0.5);
  border-radius: 3px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #00C4CC;
  border-color: #00C4CC;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.item-text {
  color: rgb(220, 220, 220);
  font-size: 14px;
  flex: 1;
}

/* Стилизация скроллбара */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: rgba(0, 196, 204, 0.5);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 196, 204, 0.7);
}
</style>