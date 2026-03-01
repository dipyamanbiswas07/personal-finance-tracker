<template>
  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', styles.bg, styles.ring]">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: v => ['Expense', 'Investment', 'EMI / Loan', 'Short term saving'].includes(v),
  },
})

const MAP = {
  'Expense':           { bg: 'bg-expense/15 text-expense',   ring: 'ring-1 ring-expense/30',    label: 'Expense' },
  'Investment':        { bg: 'bg-investment/15 text-investment', ring: 'ring-1 ring-investment/30', label: 'Investment' },
  'EMI / Loan':        { bg: 'bg-emi/15 text-emi',           ring: 'ring-1 ring-emi/30',        label: 'EMI' },
  'Short term saving': { bg: 'bg-saving/15 text-saving',     ring: 'ring-1 ring-saving/30',     label: 'Saving' },
}

const styles = computed(() => MAP[props.type] ?? MAP['Expense'])
const label  = computed(() => MAP[props.type]?.label ?? props.type)
</script>
