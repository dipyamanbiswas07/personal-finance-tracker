<template>
  <div
    :class="[
      'flex items-center gap-3 px-4 py-4 border-b border-white/5 last:border-b-0 group transition-colors',
      task.is_done ? 'opacity-60' : '',
    ]"
  >
    <!-- Checkbox -->
    <button
      :class="[
        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
        task.is_done
          ? 'bg-investment/20 border-investment/40 text-investment'
          : 'border-white/20 hover:border-accent/40 text-transparent hover:text-accent/40',
      ]"
      @click="$emit('toggle', task.id)"
    >
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <!-- Title + meta -->
    <div class="flex-1 min-w-0">
      <p :class="['text-base', task.is_done ? 'line-through text-text-muted' : 'text-text-primary']">
        {{ task.title }}
      </p>
      <div class="flex items-center flex-wrap gap-2 mt-1">
        <!-- Added by -->
        <span class="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-muted">
          Added by {{ creatorLabel }}
        </span>
        <!-- Assigned to -->
        <span v-if="task.assignee_id" class="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
          Assigned to {{ assigneeLabel }}
        </span>
        <!-- Due date -->
        <span
          v-if="task.due_date"
          :class="[
            'text-xs px-2 py-0.5 rounded-full font-medium',
            isOverdue ? 'bg-expense/10 text-expense' : 'bg-white/5 text-text-muted',
          ]"
        >
          {{ formatDueDate(task.due_date) }}
        </span>
        <!-- Overdue label -->
        <span v-if="isOverdue" class="text-xs px-2 py-0.5 rounded-full bg-expense/20 text-expense font-semibold">
          Overdue
        </span>
      </div>
    </div>

    <!-- Delete (only own tasks) -->
    <button
      v-if="task.created_by === authStore.user?.id"
      class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors opacity-0 group-hover:opacity-100"
      title="Delete task"
      @click="$emit('delete', task.id)"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'

const props = defineProps({
  task: { type: Object, required: true },
  members: { type: Array, default: () => [] },
})

defineEmits(['toggle', 'delete'])

const authStore = useAuthStore()

function memberName(userId) {
  if (!userId) return 'Unknown'
  if (userId === authStore.user?.id) return 'You'
  const member = props.members.find(m => m.user_id === userId)
  return member?.display_name || `${userId.slice(0, 6)}…`
}

const creatorLabel = computed(() => memberName(props.task.created_by))

const assigneeLabel = computed(() => memberName(props.task.assignee_id))

// Parse "YYYY-MM-DD" as local date (not UTC)
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const isOverdue = computed(() => {
  if (!props.task.due_date || props.task.is_done) return false
  return parseLocalDate(props.task.due_date) < new Date(new Date().toDateString())
})

function formatDueDate(dateStr) {
  const d = parseLocalDate(dateStr)
  const today = new Date(new Date().toDateString())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.getTime() === today.getTime()) return 'Today'
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}
</script>
