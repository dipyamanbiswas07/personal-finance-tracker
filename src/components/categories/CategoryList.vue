<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">Categories</h1>
        <p class="text-text-muted text-sm mt-0.5">Manage your budget categories</p>
      </div>
      <BaseButton variant="primary" @click="showForm = true">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Category
      </BaseButton>
    </div>

    <!-- Empty state -->
    <div v-if="store.categories.length === 0" class="text-center py-16 glass-card">
      <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-text-primary font-medium mb-1">No categories yet</h3>
      <p class="text-text-muted text-sm mb-4">Add your first budget category to get started</p>
      <BaseButton variant="primary" @click="showForm = true">Add Category</BaseButton>
    </div>

    <!-- Expenses section -->
    <section v-if="store.expenses.length > 0">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-expense" />
          <h2 class="text-sm font-semibold text-text-muted uppercase tracking-wider">Expenses</h2>
        </div>
        <div class="flex-1 h-px bg-white/5" />
        <span class="text-xs text-text-muted">
          {{ store.settings.currencySymbol }}{{ formatAmount(store.totalExpense) }} / mo
        </span>
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-2">
        <CategoryCard
          v-for="cat in store.expenses"
          :key="cat.id"
          :category="cat"
          @edit="startEdit"
        />
      </TransitionGroup>
    </section>

    <!-- Investments section -->
    <section v-if="store.investments.length > 0">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-investment" />
          <h2 class="text-sm font-semibold text-text-muted uppercase tracking-wider">Investments</h2>
        </div>
        <div class="flex-1 h-px bg-white/5" />
        <span class="text-xs text-text-muted">
          {{ store.settings.currencySymbol }}{{ formatAmount(store.totalInvestment) }} / mo
        </span>
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-2">
        <CategoryCard
          v-for="cat in store.investments"
          :key="cat.id"
          :category="cat"
          @edit="startEdit"
        />
      </TransitionGroup>
    </section>

    <!-- EMI / Loan section -->
    <section v-if="store.emis.length > 0">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emi" />
          <h2 class="text-sm font-semibold text-text-muted uppercase tracking-wider">EMI / Loan</h2>
        </div>
        <div class="flex-1 h-px bg-white/5" />
        <span class="text-xs text-text-muted">
          {{ store.settings.currencySymbol }}{{ formatAmount(store.totalEMI) }} / mo
        </span>
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-2">
        <CategoryCard
          v-for="cat in store.emis"
          :key="cat.id"
          :category="cat"
          @edit="startEdit"
        />
      </TransitionGroup>
    </section>

    <!-- Short term saving section -->
    <section v-if="store.savings.length > 0">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-saving" />
          <h2 class="text-sm font-semibold text-text-muted uppercase tracking-wider">Short term saving</h2>
        </div>
        <div class="flex-1 h-px bg-white/5" />
        <span class="text-xs text-text-muted">
          {{ store.settings.currencySymbol }}{{ formatAmount(store.totalSaving) }} / mo
        </span>
      </div>
      <TransitionGroup name="list" tag="div" class="space-y-2">
        <CategoryCard
          v-for="cat in store.savings"
          :key="cat.id"
          :category="cat"
          @edit="startEdit"
        />
      </TransitionGroup>
    </section>

    <!-- Add/Edit form modal -->
    <CategoryForm
      v-model="showForm"
      :category="editingCategory"
      @update:model-value="onFormClose"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'
import CategoryCard from './CategoryCard.vue'
import CategoryForm from './CategoryForm.vue'
import BaseButton from '../ui/BaseButton.vue'

const store = useBudgetStore()
const showForm = ref(false)
const editingCategory = ref(null)

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function startEdit(cat) {
  editingCategory.value = cat
  showForm.value = true
}

function onFormClose(val) {
  showForm.value = val
  if (!val) editingCategory.value = null
}
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
