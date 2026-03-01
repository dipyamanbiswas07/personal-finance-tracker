<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-text-muted">
      {{ label }}
    </label>
    <div class="relative">
      <span
        v-if="prefix"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none select-none"
      >{{ prefix }}</span>
      <input
        :id="inputId"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full py-2 bg-bg-base border rounded-lg text-text-primary placeholder-text-muted/50 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          prefix ? 'pl-7 pr-3' : 'px-3',
          error
            ? 'border-expense/60 focus:ring-expense/40 focus:border-expense/60'
            : 'border-white/10 focus:ring-accent focus:border-accent/50',
        ]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="text-xs text-expense">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label:      { type: String,  default: '' },
  type:       { type: String,  default: 'text' },
  placeholder:{ type: String,  default: '' },
  disabled:   { type: Boolean, default: false },
  error:      { type: String,  default: '' },
  id:         { type: String,  default: '' },
  prefix:     { type: String,  default: '' },
})

defineEmits(['update:modelValue'])

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)
</script>
