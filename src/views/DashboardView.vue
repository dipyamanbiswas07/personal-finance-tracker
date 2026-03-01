<template>
  <div class="space-y-6">

    <!-- Hero greeting -->
    <div class="anim-fade-up" style="animation-delay:0s">
      <div class="relative glass-card px-6 py-5 flex items-center justify-between overflow-hidden">
        <!-- Gradient wash from left -->
        <div class="absolute inset-0 bg-gradient-to-r from-accent/[0.07] via-transparent to-transparent pointer-events-none" />
        <!-- Subtle right-corner orb -->
        <div class="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

        <div class="relative">
          <p class="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-1.5">{{ formattedDate }}</p>
          <h1 class="text-2xl font-semibold text-text-primary tracking-tight">{{ greeting }}</h1>
        </div>

        <!-- Mini completion ring -->
        <div class="relative flex items-center gap-4 shrink-0">
          <svg width="52" height="52" class="-rotate-90" style="filter:drop-shadow(0 0 8px rgba(99,102,241,0.25))">
            <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4.5" />
            <circle
              cx="26" cy="26" r="20" fill="none"
              :stroke="monthCompletion.percent === 100 ? '#10b981' : '#6366f1'"
              stroke-width="4.5"
              stroke-linecap="round"
              :stroke-dasharray="`${(monthCompletion.percent / 100) * 2 * Math.PI * 20} 999`"
              class="transition-all duration-700"
            />
          </svg>
          <div>
            <p
              class="text-2xl font-bold tabular-nums leading-none"
              :class="monthCompletion.percent === 100 ? 'text-investment' : 'text-accent'"
            >
              {{ monthCompletion.percent }}<span class="text-sm font-normal text-text-muted ml-0.5">%</span>
            </p>
            <p class="text-xs text-text-muted mt-0.5">{{ currentMonthName }}</p>
            <p class="text-[10px] text-text-muted/60 mt-0.5">{{ monthCompletion.done }}/{{ monthCompletion.total }} done</p>
          </div>
        </div>
      </div>
    </div>

    <div class="anim-fade-up" style="animation-delay:0.07s">
      <SummaryCards />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 anim-fade-up" style="animation-delay:0.14s">
      <DonutChart />
      <QuickTracker />
    </div>

    <div class="anim-fade-up" style="animation-delay:0.21s">
      <YTDSummary />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 anim-fade-up" style="animation-delay:0.28s">
      <MonthlyProgress />
      <CategoryBreakdown />
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budgetStore.js'
import SummaryCards from '../components/insights/SummaryCards.vue'
import DonutChart from '../components/insights/DonutChart.vue'
import QuickTracker from '../components/tracker/QuickTracker.vue'
import YTDSummary from '../components/insights/YTDSummary.vue'
import MonthlyProgress from '../components/insights/MonthlyProgress.vue'
import CategoryBreakdown from '../components/insights/CategoryBreakdown.vue'

const store = useBudgetStore()

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const currentMonthName = now.toLocaleString('default', { month: 'long' })

const monthCompletion = computed(() => store.completionForMonth(currentYear, currentMonth))
</script>
