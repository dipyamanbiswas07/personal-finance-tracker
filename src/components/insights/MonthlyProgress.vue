<template>
  <div class="glass-card p-5">
    <h2 class="font-semibold text-text-primary mb-1">Monthly Progress</h2>
    <p class="text-text-muted text-xs mb-5">Completion rate for each month in {{ currentYear }}</p>

    <div class="space-y-2.5">
      <div
        v-for="(comp, idx) in completions"
        :key="idx"
        class="flex items-center gap-3"
      >
        <span
          :class="[
            'text-xs font-medium w-8 shrink-0',
            idx + 1 === currentMonth ? 'text-accent' : 'text-text-muted',
          ]"
        >{{ MONTHS[idx] }}</span>

        <div class="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="comp.percent === 100 ? 'bg-investment' : idx + 1 === currentMonth ? 'bg-accent' : 'bg-accent/60'"
            :style="{ width: comp.percent + '%' }"
          />
        </div>

        <div class="flex items-center gap-1.5 w-16 justify-end shrink-0">
          <span
            :class="[
              'text-xs font-medium',
              comp.percent === 100 ? 'text-investment' : 'text-text-muted',
            ]"
          >{{ comp.percent }}%</span>
          <svg v-if="comp.percent === 100" class="w-3 h-3 text-investment" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const store = useBudgetStore()
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const completions = computed(() => store.completionForYear(currentYear))
</script>
