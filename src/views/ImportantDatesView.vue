<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-text-primary">Important Dates</h1>
        <p class="text-sm text-text-muted mt-0.5">
          <template v-if="upcomingSoonCount > 0">
            {{ upcomingSoonCount }} coming up in the next 30 days
          </template>
          <template v-else-if="store.dates.length > 0">
            Nothing coming up in the next 30 days
          </template>
          <template v-else>
            Track birthdays, renewals, anniversaries &amp; more
          </template>
        </p>
      </div>
      <BaseButton @click="openAdd">
        <svg class="w-4 h-4 mr-1.5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Date
      </BaseButton>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 3" :key="n" class="glass-card p-4 animate-pulse">
        <div class="h-4 bg-white/10 rounded w-2/3 mb-3"></div>
        <div class="h-3 bg-white/10 rounded w-1/3 mb-4"></div>
        <div class="h-3 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.dates.length" class="glass-card p-12 flex flex-col items-center text-center">
      <div class="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
        <svg class="w-7 h-7 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
      </div>
      <p class="text-text-primary font-medium mb-1">No important dates yet</p>
      <p class="text-sm text-text-muted mb-5">Add birthdays, renewals, anniversaries and never miss them again.</p>
      <BaseButton @click="openAdd">Add your first date</BaseButton>
    </div>

    <!-- Dates grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in store.sortedDates"
        :key="item.id"
        class="glass-card p-4 relative group overflow-hidden"
      >
        <!-- Colored left accent bar -->
        <div
          class="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full"
          :style="{ background: typeColor(item.type) }"
        />

        <div class="pl-3.5">
          <!-- Top row: title + actions -->
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-text-primary leading-snug truncate">{{ item.title }}</h3>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  class="inline-flex items-center text-[11px] font-medium px-1.5 py-0.5 rounded"
                  :style="{ background: typeColor(item.type) + '22', color: typeColor(item.type) }"
                >{{ item.type }}</span>
                <span v-if="item.recurring" class="text-[11px] text-text-muted flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  yearly
                </span>
              </div>
            </div>
            <!-- Edit / Delete — visible on hover -->
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mr-1">
              <button
                class="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                title="Edit"
                @click="openEdit(item)"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
              <button
                class="p-1.5 rounded-lg hover:bg-expense/10 text-text-muted hover:text-expense transition-colors"
                title="Delete"
                @click="confirmDelete(item)"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Date + countdown -->
          <div class="flex items-center justify-between mt-3 gap-2">
            <span class="text-sm text-text-muted">{{ formatDate(item.date, item.recurring) }}</span>
            <span
              class="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
              :class="countdownClass(daysUntil(item.date, item.recurring))"
            >{{ countdownLabel(daysUntil(item.date, item.recurring)) }}</span>
          </div>

          <!-- Notes -->
          <p v-if="item.notes" class="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
            {{ item.notes }}
          </p>
        </div>
      </div>
    </div>

    <!-- Add / Edit modal -->
    <BaseModal v-model="showModal" :title="editingItem ? 'Edit Date' : 'Add Date'">
      <form class="space-y-4" @submit.prevent="submitModal">
        <BaseInput
          v-model="form.title"
          label="Title"
          placeholder="e.g. Mom's Birthday, Car Insurance"
          :error="errors.title"
        />

        <BaseSelect
          v-model="form.type"
          label="Type"
          :options="typeOptions"
        />

        <!-- Date picker -->
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1.5">Date</label>
          <input
            v-model="form.date"
            type="date"
            class="date-input w-full rounded-lg bg-bg-surface border px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
            :class="errors.date ? 'border-expense/50' : 'border-white/10'"
          />
          <p v-if="errors.date" class="text-xs text-expense mt-1">{{ errors.date }}</p>
        </div>

        <!-- Recurring toggle -->
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <div class="relative shrink-0" @click="form.recurring = !form.recurring">
            <div
              class="w-9 h-5 rounded-full transition-colors duration-200"
              :class="form.recurring ? 'bg-accent' : 'bg-white/15'"
            />
            <div
              class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
              :style="{ transform: form.recurring ? 'translateX(20px)' : 'translateX(2px)' }"
            />
          </div>
          <div>
            <span class="text-sm text-text-primary font-medium">Repeats yearly</span>
            <p class="text-[11px] text-text-muted mt-0.5">For birthdays, anniversaries &amp; annual renewals</p>
          </div>
        </label>

        <!-- Notes -->
        <div>
          <label class="block text-xs font-medium text-text-muted mb-1.5">
            Notes <span class="text-text-muted/50 font-normal">(optional)</span>
          </label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Policy number, insurer name, anything useful…"
            class="w-full rounded-lg bg-bg-surface border border-white/10 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50 resize-none placeholder:text-text-muted/40 transition-colors"
          />
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <BaseButton variant="secondary" type="button" @click="showModal = false">Cancel</BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? 'Saving…' : editingItem ? 'Save changes' : 'Add Date' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Delete confirmation -->
    <BaseConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete date"
      :message="`Remove '${deletingItem?.title}'? This cannot be undone.`"
      confirm-label="Delete"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useImportantDatesStore, daysUntil } from '../stores/importantDatesStore.js'
import { useToast } from '../composables/useToast.js'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseConfirmDialog from '../components/ui/BaseConfirmDialog.vue'

const store = useImportantDatesStore()
const { toast } = useToast()

// ── Type config ──────────────────────────────────────────────────────────────

const DATE_TYPES = [
  { value: 'Birthday',    color: '#ec4899' },
  { value: 'Anniversary', color: '#ef4444' },
  { value: 'Insurance',   color: '#f59e0b' },
  { value: 'Medical',     color: '#10b981' },
  { value: 'Other',       color: '#6366f1' },
]
const typeOptions = DATE_TYPES.map(t => ({ value: t.value, label: t.value }))
const typeColorMap = Object.fromEntries(DATE_TYPES.map(t => [t.value, t.color]))
function typeColor(type) { return typeColorMap[type] ?? '#6366f1' }

// ── Countdown helpers ────────────────────────────────────────────────────────

function formatDate(dateStr, recurring) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', recurring
    ? { month: 'long', day: 'numeric' }
    : { month: 'long', day: 'numeric', year: 'numeric' })
}

function countdownLabel(days) {
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  if (days > 1) return `In ${days} days`
  if (days === -1) return 'Yesterday'
  return `${Math.abs(days)} days ago`
}

function countdownClass(days) {
  if (days === 0) return 'bg-green-500/20 text-green-400'
  if (days > 0 && days <= 7) return 'bg-amber-500/20 text-amber-400'
  if (days > 0 && days <= 30) return 'bg-accent/20 text-accent'
  if (days > 0) return 'bg-white/8 text-text-muted'
  return 'bg-white/5 text-text-muted/50'
}

const upcomingSoonCount = computed(() =>
  store.sortedDates.filter(d => {
    const days = daysUntil(d.date, d.recurring)
    return days >= 0 && days <= 30
  }).length
)

// ── Modal ────────────────────────────────────────────────────────────────────

const showModal = ref(false)
const editingItem = ref(null)
const submitting = ref(false)
const form = ref({ title: '', type: 'Birthday', date: '', recurring: true, notes: '' })
const errors = ref({})

function openAdd() {
  editingItem.value = null
  form.value = { title: '', type: 'Birthday', date: '', recurring: true, notes: '' }
  errors.value = {}
  showModal.value = true
}

function openEdit(item) {
  editingItem.value = item
  form.value = { title: item.title, type: item.type, date: item.date, recurring: item.recurring, notes: item.notes }
  errors.value = {}
  showModal.value = true
}

function validate() {
  const e = {}
  if (!form.value.title.trim()) e.title = 'Title is required'
  if (!form.value.date) e.date = 'Date is required'
  return e
}

async function submitModal() {
  errors.value = validate()
  if (Object.keys(errors.value).length) return
  submitting.value = true
  try {
    if (editingItem.value) {
      await store.updateDate(editingItem.value.id, form.value)
      toast.success('Date updated')
    } else {
      await store.addDate(form.value)
      toast.success('Date added')
    }
    showModal.value = false
  } catch (err) {
    toast.error(err.message ?? 'Something went wrong')
  } finally {
    submitting.value = false
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────

const showDeleteConfirm = ref(false)
const deletingItem = ref(null)

function confirmDelete(item) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deletingItem.value) return
  try {
    await store.deleteDate(deletingItem.value.id)
    toast.success('Date removed')
  } catch (err) {
    toast.error(err.message ?? 'Something went wrong')
  } finally {
    deletingItem.value = null
  }
}
</script>

<style scoped>
.date-input {
  color-scheme: dark;
}
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0.4;
  cursor: pointer;
}
.date-input::-webkit-calendar-picker-indicator:hover {
  opacity: 0.7;
}
</style>
