<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between anim-fade-up" style="animation-delay:0s">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">Credit Cards</h1>
        <p class="text-text-muted text-sm mt-0.5">Track monthly payments for each card</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Year selector -->
        <div class="flex items-center gap-1 bg-bg-card rounded-xl border border-white/10 p-1">
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Previous year"
            @click="store.setYear(store.currentYear - 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="w-14 text-center text-sm font-bold text-accent">{{ store.currentYear }}</span>
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Next year"
            @click="store.setYear(store.currentYear + 1)"
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
          Add Card
        </BaseButton>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.cards.length === 0" class="glass-card text-center py-16">
      <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h3 class="text-text-primary font-medium mb-1">No cards yet</h3>
      <p class="text-text-muted text-sm mb-4">Add your credit cards to start tracking payments</p>
      <BaseButton variant="primary" @click="openAdd">Add Card</BaseButton>
    </div>

    <template v-else>
      <!-- ─── Mobile card-list view (< lg) ──────────────────────────────── -->
      <div class="lg:hidden space-y-4 anim-fade-up" style="animation-delay:0.08s">
        <!-- Month selector -->
        <div class="flex items-center justify-between glass-card px-4 py-3">
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Previous month"
            @click="selectedMonth = Math.max(1, selectedMonth - 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="text-center">
            <p class="text-sm font-semibold text-text-primary">{{ MONTHS[selectedMonth - 1] }} {{ store.currentYear }}</p>
            <p class="text-xs text-text-muted">
              {{ store.paidForMonth(store.currentYear, selectedMonth).paid }}/{{ store.cards.length }} Paid
            </p>
          </div>
          <button
            class="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
            aria-label="Next month"
            @click="selectedMonth = Math.min(12, selectedMonth + 1)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Card rows -->
        <div class="glass-card overflow-hidden">
          <div
            v-for="card in store.cards"
            :key="card.id"
            class="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-b-0 group"
          >
            <!-- Card name -->
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div class="w-1.5 h-5 rounded-full shrink-0" :style="{ backgroundColor: card.color }" />
              <span class="text-sm text-text-primary truncate">{{ card.name }}</span>
            </div>
            <!-- Toggle + actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-card',
                  store.isPaid(store.currentYear, selectedMonth, card.id)
                    ? 'bg-investment/20 border border-investment/40 text-investment focus:ring-investment/50 hover:bg-expense/20 hover:border-expense/40 hover:text-expense'
                    : 'bg-white/5 border border-white/10 text-transparent hover:border-accent/40 hover:text-accent/40 focus:ring-accent/30',
                ]"
                :title="store.isPaid(store.currentYear, selectedMonth, card.id) ? 'Mark as unpaid' : 'Mark as paid'"
                @click="handleToggle(card.id, selectedMonth)"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                aria-label="Edit card"
                @click="openEdit(card)"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
                aria-label="Delete card"
                @click="confirmDelete(card)"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Desktop 12-column table (lg+) ─────────────────────────────── -->
      <div class="hidden lg:block glass-card overflow-hidden anim-fade-up" style="animation-delay:0.08s">
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full min-w-[700px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-44 sticky left-0 bg-bg-card z-10">
                  Card
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
                <th class="w-10 sticky right-0 bg-bg-card z-10" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="card in store.cards"
                :key="card.id"
                class="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <!-- Card name (sticky) -->
                <td class="px-4 py-2.5 sticky left-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-1.5 h-5 rounded-full shrink-0" :style="{ backgroundColor: card.color }" />
                    <span class="text-sm text-text-primary truncate">{{ card.name }}</span>
                  </div>
                </td>

                <!-- Month cells -->
                <td
                  v-for="monthIdx in 12"
                  :key="monthIdx"
                  :class="[
                    'px-1.5 py-2.5 text-center',
                    monthIdx === currentMonth && isCurrentYear ? 'bg-accent/10' : '',
                  ]"
                >
                  <div class="flex justify-center">
                    <button
                      :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-card',
                        store.isPaid(store.currentYear, monthIdx, card.id)
                          ? 'bg-investment/20 border border-investment/40 text-investment focus:ring-investment/50 hover:bg-expense/20 hover:border-expense/40 hover:text-expense'
                          : 'bg-white/5 border border-white/10 text-transparent hover:border-accent/40 hover:text-accent/40 focus:ring-accent/30',
                      ]"
                      :title="store.isPaid(store.currentYear, monthIdx, card.id) ? 'Mark as unpaid' : 'Mark as paid'"
                      :aria-label="store.isPaid(store.currentYear, monthIdx, card.id) ? 'Mark as unpaid' : 'Mark as paid'"
                      @click="handleToggle(card.id, monthIdx)"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- Edit / delete actions -->
                <td class="pr-2 sticky right-0 bg-bg-card group-hover:bg-[#222536] z-10 transition-colors">
                  <div class="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
                      title="Edit"
                      aria-label="Edit card"
                      @click="openEdit(card)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
                      title="Delete"
                      aria-label="Delete card"
                      @click="confirmDelete(card)"
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
                  <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Paid</span>
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
                      store.paidForMonth(store.currentYear, monthIdx).paid === store.cards.length && store.cards.length > 0
                        ? 'text-investment'
                        : 'text-text-muted',
                    ]"
                  >
                    {{ store.paidForMonth(store.currentYear, monthIdx).paid }}/{{ store.cards.length }}
                  </span>
                </td>
                <td class="sticky right-0 bg-bg-surface/80 z-10" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>

    <!-- Add / Edit modal -->
    <BaseModal v-model="showModal" :title="editingCard ? 'Edit Card' : 'Add Card'">
      <form class="space-y-4" @submit.prevent="submitModal">
        <BaseInput
          v-model="modalName"
          label="Card name"
          placeholder="e.g. HDFC Regalia, SBI Cashback"
          :error="modalError"
        />
        <div class="flex justify-end gap-3 pt-1">
          <BaseButton variant="secondary" @click="showModal = false">Cancel</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? 'Saving…' : editingCard ? 'Save' : 'Add Card' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Confirm delete dialog -->
    <BaseConfirmDialog
      v-model="showDeleteDialog"
      title="Delete Card"
      :message="`Delete &quot;${deletingCard?.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCreditCardStore } from '../stores/creditCardStore.js'
import { useToast } from '../composables/useToast.js'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseConfirmDialog from '../components/ui/BaseConfirmDialog.vue'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const store = useCreditCardStore()
const { toast } = useToast()
const now = new Date()
const currentMonth = now.getMonth() + 1
const isCurrentYear = computed(() => store.currentYear === now.getFullYear())

// Mobile month selector
const selectedMonth = ref(currentMonth)

// Modal state
const showModal = ref(false)
const editingCard = ref(null)
const modalName = ref('')
const modalError = ref('')
const submitting = ref(false)

// Delete dialog state
const showDeleteDialog = ref(false)
const deletingCard = ref(null)

function openAdd() {
  editingCard.value = null
  modalName.value = ''
  modalError.value = ''
  showModal.value = true
}

function openEdit(card) {
  editingCard.value = card
  modalName.value = card.name
  modalError.value = ''
  showModal.value = true
}

async function submitModal() {
  const name = modalName.value.trim()
  if (!name) {
    modalError.value = 'Card name is required'
    return
  }
  submitting.value = true
  try {
    if (editingCard.value) {
      await store.updateCard(editingCard.value.id, name)
    } else {
      await store.addCard(name)
    }
    showModal.value = false
  } catch {
    modalError.value = 'Failed to save. Try again.'
  } finally {
    submitting.value = false
  }
}

async function handleToggle(cardId, monthIdx) {
  try {
    await store.togglePayment(store.currentYear, monthIdx, cardId)
  } catch {
    toast.error('Failed to save. Try again.')
  }
}

function confirmDelete(card) {
  deletingCard.value = card
  showDeleteDialog.value = true
}

async function executeDelete() {
  if (!deletingCard.value) return
  try {
    await store.deleteCard(deletingCard.value.id)
    toast.success('Card removed')
  } catch {
    toast.error('Failed to delete. Try again.')
  } finally {
    deletingCard.value = null
  }
}
</script>
