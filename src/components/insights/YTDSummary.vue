<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="font-semibold text-text-primary">Year to Date — {{ currentYear }}</h2>
        <p class="text-text-muted text-xs mt-0.5">Jan – {{ currentMonthName }} ({{ currentMonth }} of 12 months elapsed)</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-text-muted">Annual budget</p>
        <p class="text-sm font-bold text-text-primary">
          {{ store.settings.currencySymbol }}{{ formatAmount(store.totalBudget * 12) }}
        </p>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Investments YTD -->
      <div class="p-4 bg-bg-base rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-investment" />
            <span class="text-xs font-medium text-text-muted">Investments YTD</span>
          </div>
          <span class="text-xs font-semibold text-investment">{{ investmentPercent }}%</span>
        </div>
        <p class="text-xl font-bold text-text-primary">
          {{ store.settings.currencySymbol }}{{ formatAmount(investmentDoneYTD) }}
        </p>
        <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-investment rounded-full transition-all duration-700"
            :style="{ width: Math.min(investmentPercent, 100) + '%' }"
          />
        </div>
        <div class="flex items-center justify-between text-xs text-text-muted">
          <span>of {{ store.settings.currencySymbol }}{{ formatAmount(investmentPlannedYTD) }} planned</span>
          <span>{{ store.settings.currencySymbol }}{{ formatAmount(investmentPlannedYTD - investmentDoneYTD) }} left</span>
        </div>
      </div>

      <!-- Expenses YTD -->
      <div class="p-4 bg-bg-base rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-expense" />
            <span class="text-xs font-medium text-text-muted">Expenses YTD</span>
          </div>
          <span class="text-xs font-semibold text-expense">{{ expensePercent }}%</span>
        </div>
        <p class="text-xl font-bold text-text-primary">
          {{ store.settings.currencySymbol }}{{ formatAmount(expenseDoneYTD) }}
        </p>
        <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-expense rounded-full transition-all duration-700"
            :style="{ width: Math.min(expensePercent, 100) + '%' }"
          />
        </div>
        <div class="flex items-center justify-between text-xs text-text-muted">
          <span>of {{ store.settings.currencySymbol }}{{ formatAmount(expensePlannedYTD) }} planned</span>
          <span>{{ store.settings.currencySymbol }}{{ formatAmount(expensePlannedYTD - expenseDoneYTD) }} left</span>
        </div>
      </div>

      <!-- EMI YTD -->
      <div class="p-4 bg-bg-base rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-emi" />
            <span class="text-xs font-medium text-text-muted">EMI / Loan YTD</span>
          </div>
          <span class="text-xs font-semibold text-emi">{{ emiPercent }}%</span>
        </div>
        <p class="text-xl font-bold text-text-primary">
          {{ store.settings.currencySymbol }}{{ formatAmount(emiDoneYTD) }}
        </p>
        <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-emi rounded-full transition-all duration-700"
            :style="{ width: Math.min(emiPercent, 100) + '%' }"
          />
        </div>
        <div class="flex items-center justify-between text-xs text-text-muted">
          <span>of {{ store.settings.currencySymbol }}{{ formatAmount(emiPlannedYTD) }} planned</span>
          <span>{{ store.settings.currencySymbol }}{{ formatAmount(emiPlannedYTD - emiDoneYTD) }} left</span>
        </div>
      </div>

      <!-- Total YTD -->
      <div class="p-4 bg-bg-base rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-accent" />
            <span class="text-xs font-medium text-text-muted">Total YTD</span>
          </div>
          <span class="text-xs font-semibold text-accent">{{ totalPercent }}%</span>
        </div>
        <p class="text-xl font-bold text-text-primary">
          {{ store.settings.currencySymbol }}{{ formatAmount(totalDoneYTD) }}
        </p>
        <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            class="h-full bg-accent rounded-full transition-all duration-700"
            :style="{ width: Math.min(totalPercent, 100) + '%' }"
          />
        </div>
        <div class="flex items-center justify-between text-xs text-text-muted">
          <span>of {{ store.settings.currencySymbol }}{{ formatAmount(totalPlannedYTD) }} planned</span>
          <span>{{ store.settings.currencySymbol }}{{ formatAmount(totalPlannedYTD - totalDoneYTD) }} left</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'

const store = useBudgetStore()

const now = new Date()
const currentYear  = now.getFullYear()
const currentMonth = now.getMonth() + 1
const currentMonthName = now.toLocaleString('default', { month: 'long' })

// Use actual tracked amounts (full or partial) for each category
function doneForMonth(type, month) {
  return store.categories
    .filter(c => c.type === type)
    .reduce((sum, c) => {
      const v = store.getTrackingValue(currentYear, month, c.id)
      if (v === true) return sum + c.amount
      if (typeof v === 'number' && v > 0) return sum + v
      return sum
    }, 0)
}

function ytdDone(type) {
  return Array.from({ length: currentMonth }, (_, i) => doneForMonth(type, i + 1))
    .reduce((s, v) => s + v, 0)
}

const investmentDoneYTD = computed(() => ytdDone('Investment'))
const expenseDoneYTD    = computed(() => ytdDone('Expense'))
const emiDoneYTD        = computed(() => ytdDone('EMI / Loan'))
const savingDoneYTD     = computed(() => ytdDone('Short term saving'))
const totalDoneYTD      = computed(() =>
  investmentDoneYTD.value + expenseDoneYTD.value + emiDoneYTD.value + savingDoneYTD.value
)

const investmentPlannedYTD = computed(() => store.totalInvestment * currentMonth)
const expensePlannedYTD    = computed(() => store.totalExpense * currentMonth)
const emiPlannedYTD        = computed(() => store.totalEMI * currentMonth)
const totalPlannedYTD      = computed(() => store.totalBudget * currentMonth)

function pct(done, planned) {
  return planned === 0 ? 0 : Math.round((done / planned) * 100)
}

const investmentPercent = computed(() => pct(investmentDoneYTD.value, investmentPlannedYTD.value))
const expensePercent    = computed(() => pct(expenseDoneYTD.value,    expensePlannedYTD.value))
const emiPercent        = computed(() => pct(emiDoneYTD.value,        emiPlannedYTD.value))
const totalPercent      = computed(() => pct(totalDoneYTD.value,      totalPlannedYTD.value))

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}
</script>
