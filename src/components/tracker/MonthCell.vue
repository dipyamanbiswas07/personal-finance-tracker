<template>
  <div class="relative">
    <button
      :title="buttonTitle"
      :class="[
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-card',
        state === 'done'
          ? 'bg-investment/20 border border-investment/40 text-investment focus:ring-investment/50 hover:bg-white/10 hover:border-white/20 hover:text-text-muted'
          : state === 'partial'
            ? 'bg-emi/20 border border-emi/40 text-emi focus:ring-emi/50 hover:bg-white/10 hover:border-white/20 hover:text-text-muted'
            : 'bg-white/5 border border-white/10 text-transparent hover:border-accent/40 hover:text-accent/40 focus:ring-accent/30',
      ]"
      @click="handleClick"
    >
      <svg v-if="state !== 'partial'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
      </svg>
    </button>

    <BaseModal v-model="showModal" :title="`Payment — ${category?.name ?? ''}`">
      <div class="space-y-4">
        <p class="text-text-muted text-sm">
          Full amount:
          <span class="text-text-primary font-medium">
            {{ store.settings.currencySymbol }}{{ fmt(category?.amount) }}
          </span>
        </p>
        <BaseInput
          v-model="partialInput"
          label="Amount paid"
          type="number"
          min="1"
          :placeholder="`e.g. ${Math.round((category?.amount ?? 0) / 2)}`"
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
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  categoryId: { type: String, required: true },
})

const store = useBudgetStore()

const trackingValue = computed(() => store.getTrackingValue(props.year, props.month, props.categoryId))
const state = computed(() => {
  const v = trackingValue.value
  if (v === true) return 'done'
  if (typeof v === 'number' && v > 0) return 'partial'
  return 'none'
})
const category = computed(() => store.categories.find(c => c.id === props.categoryId))

const buttonTitle = computed(() => {
  if (state.value === 'done') return 'Paid in full — click to edit'
  if (state.value === 'partial') return `Partial: ${store.settings.currencySymbol}${trackingValue.value} — click to edit`
  return 'Record payment'
})

const showModal = ref(false)
const partialInput = ref('')
const validAmount = computed(() => Number(partialInput.value) > 0)

function handleClick() {
  partialInput.value = state.value === 'partial'
    ? String(trackingValue.value)
    : String(category.value?.amount ?? '')
  showModal.value = true
}

function confirmPartial() {
  if (!validAmount.value) return
  const amt = Number(partialInput.value)
  const value = category.value && amt >= category.value.amount ? true : amt
  store.setTracking(props.year, props.month, props.categoryId, value)
  showModal.value = false
}

function resetTracking() {
  store.setTracking(props.year, props.month, props.categoryId, false)
  showModal.value = false
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n ?? 0)
}
</script>
