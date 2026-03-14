<template>
  <BaseModal v-model="open" :title="isEdit ? 'Edit Category' : 'Add Category'">
    <form class="space-y-4" @submit.prevent="submit">
      <BaseInput
        v-model="form.name"
        label="Name"
        placeholder="e.g. Groceries, Electricity"
        :error="errors.name"
      />
      <BaseInput
        v-model="form.amount"
        label="Monthly Amount"
        type="number"
        placeholder="0"
        :prefix="store.settings.currencySymbol"
        :error="errors.amount"
      />
      <BaseSelect
        v-model="form.type"
        label="Type"
        :options="typeOptions"
        :error="errors.type"
      />
      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" @click="open = false">Cancel</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Category' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useFamilyBudgetStore } from '../../stores/familyBudgetStore.js'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseButton from '../ui/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  category: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const store = useFamilyBudgetStore()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})

const isEdit = computed(() => !!props.category)

const typeOptions = [
  { value: 'Expense', label: 'Expense' },
  { value: 'Investment', label: 'Investment' },
  { value: 'EMI / Loan', label: 'EMI / Loan' },
  { value: 'Short term saving', label: 'Short term saving' },
]

const blankForm = () => ({ name: '', amount: '', type: 'Expense' })
const form = ref(blankForm())
const errors = ref({})
const submitting = ref(false)

watch(open, (val) => {
  if (val) {
    form.value = props.category
      ? { name: props.category.name, amount: String(props.category.amount), type: props.category.type }
      : blankForm()
    errors.value = {}
    submitting.value = false
  }
})

function validate() {
  const e = {}
  if (!form.value.name.trim()) e.name = 'Name is required'
  const amt = Number(form.value.amount)
  if (!form.value.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid positive amount'
  if (!form.value.type) e.type = 'Type is required'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await store.updateCategory(props.category.id, form.value)
    } else {
      await store.addCategory(form.value)
    }
    emit('saved', isEdit.value)
    open.value = false
  } finally {
    submitting.value = false
  }
}
</script>
