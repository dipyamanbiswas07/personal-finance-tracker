<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="glass-card p-4 space-y-3"
    >
      <div class="flex items-start justify-between">
        <p class="text-xs font-medium text-text-muted uppercase tracking-wider">{{ card.label }}</p>
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', card.iconBg]">
          <component :is="card.icon" class="w-4 h-4" :class="card.iconColor" />
        </div>
      </div>
      <div>
        <p class="text-xl font-bold text-text-primary">
          <span v-if="card.prefix" class="text-sm font-normal text-text-muted mr-0.5">{{ card.prefix }}</span>
          {{ card.value }}
          <span v-if="card.suffix" class="text-sm font-normal text-text-muted ml-0.5">{{ card.suffix }}</span>
        </p>
        <p class="text-xs text-text-muted mt-0.5">{{ card.sub }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

const store = useBudgetStore()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

const sym = computed(() => store.settings.currencySymbol)

const monthCompletion = computed(() => store.completionForMonth(currentYear, currentMonth))

// SVG icon components (inline to avoid file bloat)
const WalletIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
  ])
}
const ExpIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 12H4m8-8l-8 8 8 8' })
  ])
}
const InvIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' })
  ])
}
const CheckIcon = {
  render: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])
}

const cards = computed(() => [
  {
    label: 'Total Budget',
    value: fmt(store.totalBudget),
    prefix: sym.value,
    sub: 'per month',
    icon: WalletIcon,
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent',
  },
  {
    label: 'Total Expenses',
    value: fmt(store.totalExpense),
    prefix: sym.value,
    sub: `${store.expenses.length} categories`,
    icon: ExpIcon,
    iconBg: 'bg-expense/15',
    iconColor: 'text-expense',
  },
  {
    label: 'Investments',
    value: fmt(store.totalInvestment),
    prefix: sym.value,
    sub: `${store.investments.length} categories`,
    icon: InvIcon,
    iconBg: 'bg-investment/15',
    iconColor: 'text-investment',
  },
  {
    label: 'This Month',
    value: monthCompletion.value.percent,
    suffix: '%',
    sub: `${monthCompletion.value.done}/${monthCompletion.value.total} done`,
    icon: CheckIcon,
    iconBg: monthCompletion.value.percent === 100 ? 'bg-investment/15' : 'bg-accent/15',
    iconColor: monthCompletion.value.percent === 100 ? 'text-investment' : 'text-accent',
  },
])
</script>
