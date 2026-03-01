<template>
  <div
    class="group relative flex items-center gap-4 p-4 bg-bg-card rounded-xl border-l-4 hover:bg-white/5 transition-all duration-200"
    :style="{ borderLeftColor: category.color }"
  >
    <!-- Color dot + name -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2.5 mb-1">
        <span class="font-medium text-text-primary truncate">{{ category.name }}</span>
        <BaseBadge :type="category.type" />
      </div>
      <p class="text-text-muted text-sm">
        {{ store.settings.currencySymbol }}{{ formatAmount(category.amount) }}
        <span class="text-text-muted/50">/ month</span>
      </p>
    </div>

    <!-- Actions (show on hover) -->
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <BaseButton variant="ghost" size="sm" aria-label="Edit category" @click="$emit('edit', category)">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </BaseButton>
      <BaseButton variant="ghost" size="sm" class="hover:!text-expense" aria-label="Delete category" @click="confirmDelete">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </BaseButton>
    </div>

    <BaseConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Category"
      :message="`Delete &quot;${category.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      @confirm="store.deleteCategory(category.id)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../../stores/budgetStore.js'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseConfirmDialog from '../ui/BaseConfirmDialog.vue'

const props = defineProps({
  category: { type: Object, required: true },
})
defineEmits(['edit'])

const store = useBudgetStore()
const showDeleteDialog = ref(false)

function formatAmount(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

function confirmDelete() {
  showDeleteDialog.value = true
}
</script>
