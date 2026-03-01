<template>
  <div class="glass-card p-5">
    <h2 class="font-semibold text-text-primary mb-1">Budget Split</h2>
    <p class="text-text-muted text-xs mb-5">Breakdown by category type</p>

    <div v-if="store.totalBudget === 0" class="flex items-center justify-center h-40">
      <p class="text-text-muted text-sm">No data yet</p>
    </div>

    <div v-else class="flex items-center gap-6">
      <!-- SVG Donut -->
      <div class="relative shrink-0">
        <svg :width="size" :height="size" class="-rotate-90">
          <!-- Background ring -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            :stroke-width="strokeWidth"
          />
          <!-- Expense arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#ef4444"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.expense} ${circumference}`"
            stroke-dashoffset="0"
            class="transition-all duration-700"
          />
          <!-- Investment arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#10b981"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.investment} ${circumference}`"
            :stroke-dashoffset="-arcs.expense"
            class="transition-all duration-700"
          />
          <!-- EMI arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#f59e0b"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.emi} ${circumference}`"
            :stroke-dashoffset="-(arcs.expense + arcs.investment)"
            class="transition-all duration-700"
          />
          <!-- Short term saving arc -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            stroke="#8b5cf6"
            :stroke-width="strokeWidth"
            stroke-linecap="round"
            :stroke-dasharray="`${arcs.saving} ${circumference}`"
            :stroke-dashoffset="-(arcs.expense + arcs.investment + arcs.emi)"
            class="transition-all duration-700"
          />
        </svg>
        <!-- Center label -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xs text-text-muted">Total</span>
          <span class="text-sm font-bold text-text-primary">
            {{ store.settings.currencySymbol }}{{ formatK(store.totalBudget) }}
          </span>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-3 flex-1">
        <div v-for="item in legend" :key="item.label" class="space-y-1">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
              <span class="text-text-muted">{{ item.label }}</span>
            </div>
            <span class="font-semibold text-text-primary">{{ item.percent }}%</span>
          </div>
          <div class="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: item.percent + '%', backgroundColor: item.color }"
            />
          </div>
          <p class="text-xs text-text-muted">{{ store.settings.currencySymbol }}{{ formatAmount(item.amount) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

const store = useBudgetStore()

const size = 140
const cx = size / 2
const cy = size / 2
const r = 52
const strokeWidth = 18
const circumference = 2 * Math.PI * r

function pct(amount) {
  return store.totalBudget === 0 ? 0 : Math.round((amount / store.totalBudget) * 100)
}

const percents = computed(() => {
  const exp = pct(store.totalExpense)
  const inv = pct(store.totalInvestment)
  const emi = pct(store.totalEMI)
  const sav = 100 - exp - inv - emi
  return { exp, inv, emi, sav: Math.max(0, sav) }
})

const arcs = computed(() => ({
  expense:    (percents.value.exp / 100) * circumference,
  investment: (percents.value.inv / 100) * circumference,
  emi:        (percents.value.emi / 100) * circumference,
  saving:     (percents.value.sav / 100) * circumference,
}))

const legend = computed(() => [
  { label: 'Expenses',          color: '#ef4444', percent: percents.value.exp, amount: store.totalExpense    },
  { label: 'Investments',       color: '#10b981', percent: percents.value.inv, amount: store.totalInvestment },
  ...(store.totalEMI    > 0 ? [{ label: 'EMI / Loan',        color: '#f59e0b', percent: percents.value.emi, amount: store.totalEMI    }] : []),
  ...(store.totalSaving > 0 ? [{ label: 'Short term saving', color: '#8b5cf6', percent: percents.value.sav, amount: store.totalSaving }] : []),
])

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function formatK(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}
</script>
