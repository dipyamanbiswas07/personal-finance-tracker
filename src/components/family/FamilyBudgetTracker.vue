<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-text-primary">Shared Budget</h3>
        <p class="text-text-muted text-xs mt-0.5">Track family expenses together</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Year selector -->
        <div class="flex items-center gap-1 bg-bg-card rounded-xl border border-white/10 p-1">
          <button
            class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Previous year"
            @click="changeYear(store.settings.currentYear - 1)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="w-12 text-center text-xs font-bold text-accent">{{ store.settings.currentYear }}</span>
          <button
            class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Next year"
            @click="changeYear(store.settings.currentYear + 1)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <BaseButton variant="primary" size="sm" @click="openAdd">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add
        </BaseButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.categories.length === 0" class="glass-card text-center py-12">
      <p class="text-text-muted text-sm">No shared categories yet. Add one to get started.</p>
    </div>

    <template v-else>
      <!-- ─── Mobile card-list view (< lg) ─────────────────────────────── -->
      <div class="lg:hidden space-y-4">
        <!-- Month selector -->
        <div class="flex items-center justify-between glass-card px-4 py-3">
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="selectedMonth = Math.max(1, selectedMonth - 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="text-center">
            <p class="text-sm font-semibold text-text-primary">{{ MONTHS[selectedMonth - 1] }} {{ store.settings.currentYear }}</p>
            <p class="text-xs text-text-muted">{{ mobileCompletion.done }}/{{ mobileCompletion.total }} Completed</p>
          </div>
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            @click="selectedMonth = Math.min(12, selectedMonth + 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Category rows per section -->
        <div v-for="section in sections" :key="section.label" class="glass-card overflow-hidden">
          <div class="px-4 py-2.5 border-b border-white/5 bg-bg-surface/40 flex items-center gap-2">
            <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: section.color }" />
            <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.label }}</span>
            <span class="text-xs text-text-muted/50">· {{ store.settings.currencySymbol }}{{ fmt(section.total) }}/mo</span>
          </div>
          <div>
            <div
              v-for="cat in section.categories"
              :key="cat.id"
              class="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-b-0 group"
            >
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <div class="w-1.5 h-8 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
                <div class="min-w-0">
                  <p class="text-sm text-text-primary truncate leading-tight">{{ cat.name }}</p>
                  <p class="text-xs text-text-muted/60 leading-tight">{{ store.settings.currencySymbol }}{{ fmt(cat.amount) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <MonthCell
                  :year="store.settings.currentYear"
                  :month="selectedMonth"
                  :category-id="cat.id"
                  :store="store"
                />
                <button
                  class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                  @click="openEdit(cat)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
                  @click="confirmDelete(cat)"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Desktop 12-column table (lg+) ─────────────────────────────── -->
      <div class="hidden lg:block glass-card overflow-hidden">
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
              <tr class="border-b border-white/5 bg-bg-surface/40">
                <td colspan="14" class="px-4 py-1.5">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: section.color }" />
                    <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">{{ section.label }}</span>
                    <span class="text-xs text-text-muted/50">· {{ store.settings.currencySymbol }}{{ fmt(section.total) }}/mo</span>
                  </div>
                </td>
              </tr>

              <tr
                v-for="cat in section.categories"
                :key="cat.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td class="px-4 py-2 sticky left-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-1.5 h-8 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
                    <div class="min-w-0">
                      <p class="text-sm text-text-primary truncate leading-tight">{{ cat.name }}</p>
                      <p class="text-xs text-text-muted/60 leading-tight">{{ store.settings.currencySymbol }}{{ fmt(cat.amount) }}</p>
                    </div>
                  </div>
                </td>

                <td
                  v-for="monthIdx in 12"
                  :key="monthIdx"
                  :class="[
                    'px-1.5 py-2 text-center',
                    monthIdx === currentMonth && isCurrentYear ? 'bg-accent/10' : '',
                  ]"
                >
                  <div class="flex justify-center">
                    <MonthCell
                      :year="store.settings.currentYear"
                      :month="monthIdx"
                      :category-id="cat.id"
                      :store="store"
                    />
                  </div>
                </td>

                <td class="pr-2 sticky right-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                  <div class="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
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
                  <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Completed</span>
                </td>
                <td
                  v-for="monthIdx in 12"
                  :key="monthIdx"
                  :class="[
                    'px-1.5 py-2.5 text-center',
                    monthIdx === currentMonth && isCurrentYear ? 'bg-accent/10' : '',
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
    </template>

    <FamilyCategoryForm
      v-model="showForm"
      :category="editingCategory"
      @update:model-value="onFormClose"
      @saved="onCategorySaved"
    />

    <BaseConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Category"
      :message="`Delete &quot;${deletingCat?.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFamilyBudgetStore } from '../../stores/familyBudgetStore.js'
import { useToast } from '../../composables/useToast.js'
import MonthCell from '../tracker/MonthCell.vue'
import FamilyCategoryForm from './FamilyCategoryForm.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseConfirmDialog from '../ui/BaseConfirmDialog.vue'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const store = useFamilyBudgetStore()
const { toast } = useToast()
const now = new Date()
const currentMonth = now.getMonth() + 1
const isCurrentYear = computed(() => store.settings.currentYear === now.getFullYear())
const completions = computed(() => store.completionForYear(store.settings.currentYear))

const selectedMonth = ref(currentMonth)
const mobileCompletion = computed(() => store.completionForMonth(store.settings.currentYear, selectedMonth.value))

const sections = computed(() => [
  { label: 'Expenses',          color: '#ef4444', total: store.totalExpense,    categories: store.expenses    },
  { label: 'Investments',       color: '#10b981', total: store.totalInvestment, categories: store.investments },
  { label: 'EMI / Loan',        color: '#f59e0b', total: store.totalEMI,        categories: store.emis        },
  { label: 'Short term saving', color: '#8b5cf6', total: store.totalSaving,     categories: store.savings     },
].filter(s => s.categories.length > 0))

const showForm = ref(false)
const editingCategory = ref(null)
const showDeleteDialog = ref(false)
const deletingCat = ref(null)

async function changeYear(year) {
  try {
    await store.setYear(year)
  } catch {
    toast.error('Failed to change year. Try again.')
  }
}

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

function onCategorySaved(isEdit) {
  toast.success(isEdit ? 'Category updated' : 'Category added')
}

function confirmDelete(cat) {
  deletingCat.value = cat
  showDeleteDialog.value = true
}

async function executeDelete() {
  if (!deletingCat.value) return
  try {
    await store.deleteCategory(deletingCat.value.id)
    toast.success('Category deleted')
  } catch {
    toast.error('Failed to delete. Try again.')
  } finally {
    deletingCat.value = null
  }
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}
</script>
