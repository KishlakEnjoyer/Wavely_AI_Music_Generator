<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  placeholder: { type: String, default: 'Выберите...' }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const selectedLabels = computed(() => {
  const set = new Set(props.modelValue)
  const labels = props.options
    .filter(o => set.has(o[props.valueKey]))
    .map(o => o[props.labelKey])
  if (labels.length === 0) return props.placeholder
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
})

const toggleOpen = () => { open.value = !open.value }
const close = () => { open.value = false }

const onDocClick = (e) => {
  if (!root.value) return
  if (!root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const isChecked = (val) => props.modelValue.includes(val)
const toggleValue = (val) => {
  const next = isChecked(val)
    ? props.modelValue.filter(v => v !== val)
    : [...props.modelValue, val]
  emit('update:modelValue', next)
}
</script>

<template>
  <div ref="root" class="mcx-select">
    <button type="button" class="mcx-control">
      <span class="mcx-label" @click="toggleOpen">{{ selectedLabels }}</span>
      <span class="mcx-caret" @click="toggleOpen">▾</span>
    </button>
    <div v-if="open" class="mcx-dropdown">
      <div class="mcx-list">
        <label v-for="opt in options" :key="opt[valueKey]" class="mcx-item">
          <input type="checkbox" :checked="isChecked(opt[valueKey])" @change="toggleValue(opt[valueKey])" />
          <span class="mcx-text">{{ opt[labelKey] }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mcx-select { position: relative; }
.mcx-control { height: 46px; padding: 10px 14px; font-size: 14px; color: rgb(220,220,220); border: 1px solid rgba(0,0,0,0.25); background-color: #04040460; border-radius: 24px; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.mcx-control:hover { border: 1px solid #00C4CC20; box-shadow: 0 0 0 2px rgba(0, 196, 204, 0.2); }
.mcx-label { flex: 1; text-align: left; }
.mcx-caret { opacity: 0.8; }
.mcx-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #0a0a0a; border: 1px solid rgba(0,0,0,0.35); border-radius: 12px; z-index: 10; padding: 8px; box-shadow: 0 6px 14px rgba(0,0,0,0.35); }
.mcx-list { max-height: 180px; overflow: auto; display: flex; flex-direction: column; gap: 6px; }
.mcx-item { display: flex; align-items: center; gap: 8px; color: #ddd; font-size: 14px; padding: 6px 8px; border-radius: 8px; }
.mcx-item:hover { background: rgba(255,255,255,0.06); }
.mcx-item input { width: 16px; height: 16px; accent-color: #31CEF4; }
.mcx-text { user-select: none; }
</style>