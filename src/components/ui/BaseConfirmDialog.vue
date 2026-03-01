<template>
  <BaseModal :model-value="modelValue" :title="title" @update:model-value="cancel">
    <div class="space-y-5">
      <p class="text-sm text-text-muted leading-relaxed">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="cancel">Cancel</BaseButton>
        <BaseButton :variant="danger ? 'danger' : 'primary'" @click="confirm">
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue:   { type: Boolean, default: false },
  title:        { type: String,  default: 'Are you sure?' },
  message:      { type: String,  default: '' },
  confirmLabel: { type: String,  default: 'Delete' },
  danger:       { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function cancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
