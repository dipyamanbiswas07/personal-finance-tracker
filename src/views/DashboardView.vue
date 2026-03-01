<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-xl font-semibold text-text-primary">Dashboard</h1>
      <p class="text-text-muted text-sm mt-0.5">{{ greeting }} — {{ formattedDate }}</p>
    </div>

    <SummaryCards />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickTracker />

      <!-- Get started card (only when no categories) -->
      <div v-if="store.categories.length === 0" class="glass-card p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-text-primary">Get Started</h3>
          <p class="text-text-muted text-sm mt-1">Set up your budget categories first, then start tracking your monthly spending and investments.</p>
        </div>
        <RouterLink
          to="/categories"
          class="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Categories
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budgetStore.js'
import SummaryCards from '../components/insights/SummaryCards.vue'
import QuickTracker from '../components/tracker/QuickTracker.vue'

const store = useBudgetStore()

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>
