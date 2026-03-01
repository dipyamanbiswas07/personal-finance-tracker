<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-surface disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

const sizeClasses = computed(() => ({
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}[props.size]))

const variantClasses = computed(() => ({
  primary: 'bg-accent hover:bg-accent-hover text-white focus:ring-accent',
  secondary: 'bg-white/10 hover:bg-white/15 text-text-primary focus:ring-white/30',
  danger: 'bg-expense/20 hover:bg-expense/30 text-expense border border-expense/30 focus:ring-expense',
  ghost: 'text-text-muted hover:text-text-primary hover:bg-white/5 focus:ring-white/20',
}[props.variant]))
</script>
