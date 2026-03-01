<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm max-w-xs"
          :class="containerClass(t.type)"
        >
          <!-- Colored left border accent via border-l-2 -->
          <div class="shrink-0 mt-0.5">
            <!-- success icon -->
            <svg v-if="t.type === 'success'" class="w-4 h-4 text-investment" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <!-- error icon -->
            <svg v-else-if="t.type === 'error'" class="w-4 h-4 text-expense" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- warning icon -->
            <svg v-else class="w-4 h-4 text-emi" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p class="text-sm text-text-primary leading-snug">{{ t.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js'

const { toasts } = useToast()

function containerClass(type) {
  if (type === 'success') return 'bg-bg-card/95 border-investment/30 border-l-2 border-l-investment'
  if (type === 'error')   return 'bg-bg-card/95 border-expense/30 border-l-2 border-l-expense'
  return 'bg-bg-card/95 border-emi/30 border-l-2 border-l-emi'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.96);
}
</style>
