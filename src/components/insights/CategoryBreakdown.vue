<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-semibold text-text-primary">Category Breakdown</h2>
        <p class="text-text-muted text-xs mt-0.5">All categories and their monthly amounts</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-1 bg-bg-base rounded-lg p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="[
            'px-3 py-1 rounded-md text-xs font-medium transition-colors',
            activeTab === tab.value
              ? 'bg-accent text-white'
              : 'text-text-muted hover:text-text-primary',
          ]"
          @click="activeTab = tab.value"
        >{{ tab.label }}</button>
      </div>
    </div>

    <div v-if="filteredCategories.length === 0" class="text-center py-8">
      <p class="text-text-muted text-sm">No categories found</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="cat in filteredCategories"
        :key="cat.id"
        class="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
      >
        <!-- Color + name -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
          <span class="text-sm text-text-primary truncate">{{ cat.name }}</span>
          <BaseBadge :type="cat.type" />
        </div>

        <!-- Monthly amount -->
        <span class="text-sm font-semibold text-text-primary shrink-0">
          {{ store.settings.currencySymbol }}{{ formatAmount(cat.amount) }}
        </span>

        <!-- % of total budget -->
        <div class="w-20 shrink-0">
          <div class="flex items-center justify-between mb-0.5">
            <span class="text-xs text-text-muted">{{ budgetPercent(cat.amount) }}%</span>
          </div>
          <div class="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              :style="{ width: budgetPercent(cat.amount) + '%', backgroundColor: cat.color }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Totals row -->
    <div v-if="filteredCategories.length > 0" class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
      <span class="text-xs text-text-muted font-medium">{{ filteredCategories.length }} categories</span>
      <span class="text-sm font-bold text-text-primary">
        {{ store.settings.currencySymbol }}{{ formatAmount(filteredTotal) }}
        <span class="text-xs text-text-muted font-normal">/ month</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'
import BaseBadge from '../ui/BaseBadge.vue'

const store = useBudgetStore()

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'Expense', label: 'Expenses' },
  { value: 'Investment', label: 'Investments' },
  { value: 'EMI / Loan', label: 'EMI' },
  { value: 'Short term saving', label: 'Saving' },
]
const activeTab = ref('all')

const filteredCategories = computed(() => {
  if (activeTab.value === 'all') return store.categories
  return store.categories.filter(c => c.type === activeTab.value)
})

const filteredTotal = computed(() => filteredCategories.value.reduce((s, c) => s + c.amount, 0))

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function budgetPercent(amount) {
  if (!store.totalBudget) return 0
  return Math.round((amount / store.totalBudget) * 100)
}
</script>
