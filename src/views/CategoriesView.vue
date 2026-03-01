<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">Categories</h1>
        <p class="text-text-muted text-sm mt-0.5">Manage and track your budget categories</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Year selector -->
        <div class="flex items-center gap-1 bg-bg-card rounded-xl border border-white/10 p-1">
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="store.setYear(store.settings.currentYear - 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="w-14 text-center text-sm font-semibold text-text-primary">{{ store.settings.currentYear }}</span>
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="store.setYear(store.settings.currentYear + 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <BaseButton variant="primary" @click="openAdd">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </BaseButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.categories.length === 0" class="glass-card text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-text-primary font-medium mb-1">No categories yet</h3>
      <p class="text-text-muted text-sm mb-4">Add your first budget category to get started</p>
      <BaseButton variant="primary" @click="openAdd">Add Category</BaseButton>
    </div>

    <!-- Combined grid -->
    <div v-else class="glass-card overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="w-full min-w-[760px]">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-52 sticky left-0 bg-bg-card z-10">
                Category
              </th>
              <th
                v-for="(month, idx) in MONTHS"
                :key="idx"
                :class="[
                  'px-2 py-3 text-xs font-semibold text-center uppercase tracking-wider w-12',
                  idx + 1 === currentMonth && isCurrentYear ? 'text-accent' : 'text-text-muted',
                ]"
              >
                {{ month }}
              </th>
              <th class="w-16 sticky right-0 bg-bg-card z-10" />
            </tr>
          </thead>

          <tbody v-for="section in sections" :key="section.label">
            <!-- Section header row -->
            <tr class="border-b border-white/5 bg-bg-surface/40">
              <td colspan="14" class="px-4 py-1.5">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: section.color }" />
                  <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.label }}</span>
                  <span class="text-xs text-text-muted/50">· {{ store.settings.currencySymbol }}{{ fmt(section.total) }}/mo</span>
                </div>
              </td>
            </tr>

            <!-- Category rows -->
            <tr
              v-for="cat in section.categories"
              :key="cat.id"
              class="border-b border-white/5 hover:bg-white/5 transition-colors group"
            >
              <!-- Name + amount (sticky left) -->
              <td class="px-4 py-2 sticky left-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-1.5 h-8 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
                  <div class="min-w-0">
                    <p class="text-sm text-text-primary truncate leading-tight">{{ cat.name }}</p>
                    <p class="text-xs text-text-muted/60 leading-tight">{{ store.settings.currencySymbol }}{{ fmt(cat.amount) }}</p>
                  </div>
                </div>
              </td>

              <!-- Month cells -->
              <td
                v-for="monthIdx in 12"
                :key="monthIdx"
                :class="[
                  'px-1.5 py-2 text-center',
                  monthIdx === currentMonth && isCurrentYear ? 'bg-accent/5' : '',
                ]"
              >
                <div class="flex justify-center">
                  <MonthCell
                    :year="store.settings.currentYear"
                    :month="monthIdx"
                    :category-id="cat.id"
                  />
                </div>
              </td>

              <!-- Edit / delete (sticky right) -->
              <td class="pr-2 sticky right-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                    title="Edit"
                    @click="openEdit(cat)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
                    title="Delete"
                    @click="confirmDelete(cat)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr class="border-t border-white/10 bg-bg-surface/50">
              <td class="px-4 py-2.5 sticky left-0 bg-bg-surface/80 z-10">
                <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Done</span>
              </td>
              <td
                v-for="monthIdx in 12"
                :key="monthIdx"
                :class="[
                  'px-1.5 py-2.5 text-center',
                  monthIdx === currentMonth && isCurrentYear ? 'bg-accent/5' : '',
                ]"
              >
                <span
                  :class="[
                    'text-xs font-medium',
                    completions[monthIdx - 1].done === store.categories.length && store.categories.length > 0
                      ? 'text-investment'
                      : 'text-text-muted',
                  ]"
                >
                  {{ completions[monthIdx - 1].done }}/{{ completions[monthIdx - 1].total }}
                </span>
              </td>
              <td class="sticky right-0 bg-bg-surface/80 z-10" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <CategoryForm
      v-model="showForm"
      :category="editingCategory"
      @update:model-value="onFormClose"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budgetStore.js'
import MonthCell from '../components/tracker/MonthCell.vue'
import CategoryForm from '../components/categories/CategoryForm.vue'
import BaseButton from '../components/ui/BaseButton.vue'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const store = useBudgetStore()
const now = new Date()
const currentMonth = now.getMonth() + 1
const isCurrentYear = computed(() => store.settings.currentYear === now.getFullYear())
const completions = computed(() => store.completionForYear(store.settings.currentYear))

const sections = computed(() => [
  { label: 'Expenses',          color: '#ef4444', total: store.totalExpense,    categories: store.expenses    },
  { label: 'Investments',       color: '#10b981', total: store.totalInvestment, categories: store.investments },
  { label: 'EMI / Loan',        color: '#f59e0b', total: store.totalEMI,        categories: store.emis        },
  { label: 'Short term saving', color: '#8b5cf6', total: store.totalSaving,     categories: store.savings     },
].filter(s => s.categories.length > 0))

const showForm = ref(false)
const editingCategory = ref(null)

function openAdd() {
  editingCategory.value = null
  showForm.value = true
}

function openEdit(cat) {
  editingCategory.value = cat
  showForm.value = true
}

function onFormClose(val) {
  showForm.value = val
  if (!val) editingCategory.value = null
}

function confirmDelete(cat) {
  if (confirm(`Delete "${cat.name}"? This cannot be undone.`)) {
    store.deleteCategory(cat.id)
  }
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}
</script>
