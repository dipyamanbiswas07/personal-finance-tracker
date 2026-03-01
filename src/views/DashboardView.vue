<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-semibold text-text-primary">Dashboard</h1>
      <p class="text-text-muted text-sm mt-0.5">{{ greeting }} — {{ formattedDate }}</p>
    </div>

    <SummaryCards />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DonutChart />
      <QuickTracker />
    </div>

    <YTDSummary />
    <MonthlyProgress />
    <CategoryBreakdown />
  </div>
</template>

<script setup>
import SummaryCards from '../components/insights/SummaryCards.vue'
import DonutChart from '../components/insights/DonutChart.vue'
import QuickTracker from '../components/tracker/QuickTracker.vue'
import YTDSummary from '../components/insights/YTDSummary.vue'
import MonthlyProgress from '../components/insights/MonthlyProgress.vue'
import CategoryBreakdown from '../components/insights/CategoryBreakdown.vue'

const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const formattedDate = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>
