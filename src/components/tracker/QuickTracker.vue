<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="font-semibold text-text-primary">{{ currentMonthName }} Quick View</h2>
        <p class="text-text-muted text-xs mt-0.5">
          {{ completion.done }} of {{ completion.total }} completed
        </p>
      </div>
      <div class="text-right">
        <span
          :class="[
            'text-2xl font-bold',
            completion.percent === 100 ? 'text-investment' : 'text-accent',
          ]"
        >{{ completion.percent }}%</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
      <div
        :class="['h-full rounded-full transition-all duration-500', completion.percent === 100 ? 'bg-investment' : 'bg-accent']"
        :style="{ width: completion.percent + '%' }"
      />
    </div>

    <!-- Empty state -->
    <div v-if="store.categories.length === 0" class="text-center py-6">
      <p class="text-text-muted text-sm">No categories yet.</p>
      <RouterLink to="/categories" class="text-accent hover:underline text-sm mt-1 inline-block">
        Add categories to start tracking →
      </RouterLink>
    </div>

    <!-- Category toggles -->
    <div v-else class="space-y-2">
      <div
        v-for="cat in store.categories"
        :key="cat.id"
        class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
        @click="handleRowClick(cat)"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" />
          <span
            :class="[
              'text-sm truncate transition-colors',
              trackingState(cat.id) !== 'none' ? 'text-text-muted line-through' : 'text-text-primary',
            ]"
          >{{ cat.name }}</span>
          <BaseBadge :type="cat.type" />
          <span v-if="trackingState(cat.id) === 'partial'" class="text-xs text-emi shrink-0">
            ~{{ store.settings.currencySymbol }}{{ fmt(store.getTrackingValue(currentYear, currentMonth, cat.id)) }}
          </span>
        </div>
        <div
          :class="[
            'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 border',
            trackingState(cat.id) === 'done'
              ? 'bg-investment/20 border-investment/40 text-investment'
              : trackingState(cat.id) === 'partial'
                ? 'bg-emi/20 border-emi/40 text-emi'
                : 'border-white/15 text-transparent group-hover:border-accent/40',
          ]"
        >
          <svg v-if="trackingState(cat.id) !== 'partial'" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
          </svg>
        </div>
      </div>
    </div>

    <RouterLink
      v-if="store.categories.length > 0"
      to="/tracker"
      class="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors pt-3 border-t border-white/5"
    >
      View full tracker
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </RouterLink>

    <!-- Shared partial amount modal -->
    <BaseModal v-model="showModal" :title="`Payment — ${selectedCat?.name ?? ''}`">
      <div class="space-y-4">
        <p class="text-text-muted text-sm">
          Full amount:
          <span class="text-text-primary font-medium">
            {{ store.settings.currencySymbol }}{{ fmt(selectedCat?.amount) }}
          </span>
        </p>
        <BaseInput
          v-model="partialInput"
          label="Amount paid"
          type="number"
          min="1"
          :placeholder="`e.g. ${Math.round((selectedCat?.amount ?? 0) / 2)}`"
          @keydown.enter="confirmPartial"
        />
        <div class="flex items-center justify-between gap-2">
          <BaseButton variant="danger" size="sm" @click="resetTracking">Not done</BaseButton>
          <div class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="showModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" size="sm" :disabled="!validAmount" @click="confirmPartial">Save</BaseButton>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const store = useBudgetStore()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' })

const completion = computed(() => store.completionForMonth(currentYear, currentMonth))

function trackingState(categoryId) {
  const v = store.getTrackingValue(currentYear, currentMonth, categoryId)
  if (v === true) return 'done'
  if (typeof v === 'number' && v > 0) return 'partial'
  return 'none'
}

const showModal = ref(false)
const selectedCat = ref(null)
const partialInput = ref('')
const validAmount = computed(() => Number(partialInput.value) > 0)

function handleRowClick(cat) {
  selectedCat.value = cat
  const state = trackingState(cat.id)
  partialInput.value = state === 'partial'
    ? String(store.getTrackingValue(currentYear, currentMonth, cat.id))
    : String(cat.amount ?? '')
  showModal.value = true
}

function confirmPartial() {
  if (!validAmount.value || !selectedCat.value) return
  const amt = Number(partialInput.value)
  const value = amt >= (selectedCat.value.amount ?? Infinity) ? true : amt
  store.setTracking(currentYear, currentMonth, selectedCat.value.id, value)
  showModal.value = false
}

function resetTracking() {
  if (!selectedCat.value) return
  store.setTracking(currentYear, currentMonth, selectedCat.value.id, false)
  showModal.value = false
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n ?? 0)
}
</script>
