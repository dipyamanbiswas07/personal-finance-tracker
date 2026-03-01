<template>
  <div class="space-y-6">
    <SummaryCards />
    <YTDSummary />
    <LineChart />
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DonutChart />
      <MonthlyProgress />
    </div>
    <CategoryBreakdown />
  </div>
</template>

<script setup>
import SummaryCards from '../components/insights/SummaryCards.vue'
import YTDSummary from '../components/insights/YTDSummary.vue'
import LineChart from '../components/insights/LineChart.vue'
import DonutChart from '../components/insights/DonutChart.vue'
import MonthlyProgress from '../components/insights/MonthlyProgress.vue'
import CategoryBreakdown from '../components/insights/CategoryBreakdown.vue'
</script>
