<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-xl font-semibold text-text-primary">Monthly Tracker</h1>
      <p class="text-text-muted text-sm mt-0.5">Track completed items for each month</p>
    </div>
    <div class="flex items-center gap-2 bg-bg-card rounded-xl border border-white/10 p-1">
      <button
        class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
        @click="store.setYear(store.settings.currentYear - 1)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span class="w-14 text-center text-sm font-semibold text-text-primary">
        {{ store.settings.currentYear }}
      </span>
      <button
        class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
        @click="store.setYear(store.settings.currentYear + 1)"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useBudgetStore } from '../../stores/budgetStore.js'
const store = useBudgetStore()
</script>
