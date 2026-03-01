<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-text-muted">
      {{ label }}
    </label>
    <select
      :id="selectId"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      class="w-full px-3 py-2 bg-bg-base border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors appearance-none cursor-pointer"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="text-xs text-expense">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const selectId = computed(() => props.id || `select-${Math.random().toString(36).slice(2, 9)}`)
</script>
