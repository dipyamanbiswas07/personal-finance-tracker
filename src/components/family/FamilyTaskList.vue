<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-text-primary">Tasks</h3>
        <p class="text-text-muted text-xs mt-0.5">
          {{ taskStore.pendingTasks.length }} pending · {{ taskStore.completedTasks.length }} done
        </p>
      </div>
    </div>

    <!-- Add task form -->
    <form class="glass-card p-4" @submit.prevent="handleAdd">
      <div class="flex gap-2">
        <BaseInput
          v-model="newTitle"
          placeholder="Add a task…"
          class="flex-1"
        />
        <BaseButton type="submit" variant="primary" size="sm" :disabled="!newTitle.trim()">Add</BaseButton>
      </div>
      <!-- Extra options row -->
      <div class="flex items-center gap-3 mt-3">
        <!-- Assignee -->
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-text-muted uppercase tracking-wider">Assign:</span>
          <select
            v-model="newAssignee"
            class="text-xs bg-bg-card border border-white/10 rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          >
            <option value="">No one</option>
            <option
              v-for="member in familyStore.members"
              :key="member.user_id"
              :value="member.user_id"
            >
              {{ isCurrentUser(member.user_id) ? 'Me' : member.user_id.slice(0, 8) + '…' }}
            </option>
          </select>
        </div>
        <!-- Due date -->
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-text-muted uppercase tracking-wider">Due:</span>
          <input
            v-model="newDueDate"
            type="date"
            class="text-xs bg-bg-card border border-white/10 rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>
    </form>

    <!-- Pending tasks -->
    <div v-if="taskStore.pendingTasks.length > 0" class="glass-card overflow-hidden">
      <FamilyTaskItem
        v-for="task in taskStore.pendingTasks"
        :key="task.id"
        :task="task"
        :members="familyStore.members"
        @toggle="handleToggle"
        @delete="handleDelete"
      />
    </div>

    <!-- Completed tasks (collapsible) -->
    <div v-if="taskStore.completedTasks.length > 0">
      <button
        class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors mb-2"
        @click="showCompleted = !showCompleted"
      >
        <svg
          :class="['w-3 h-3 transition-transform', showCompleted ? 'rotate-90' : '']"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {{ taskStore.completedTasks.length }} completed
      </button>
      <div v-if="showCompleted" class="glass-card overflow-hidden">
        <FamilyTaskItem
          v-for="task in taskStore.completedTasks"
          :key="task.id"
          :task="task"
          :members="familyStore.members"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="taskStore.tasks.length === 0" class="glass-card text-center py-12">
      <p class="text-text-muted text-sm">No tasks yet. Add one above.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFamilyTaskStore } from '../../stores/familyTaskStore.js'
import { useFamilyStore } from '../../stores/familyStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useToast } from '../../composables/useToast.js'
import FamilyTaskItem from './FamilyTaskItem.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const taskStore = useFamilyTaskStore()
const familyStore = useFamilyStore()
const authStore = useAuthStore()
const { toast } = useToast()

const newTitle = ref('')
const newAssignee = ref('')
const newDueDate = ref('')
const showCompleted = ref(false)

function isCurrentUser(userId) {
  return authStore.user?.id === userId
}

async function handleAdd() {
  if (!newTitle.value.trim()) return
  try {
    await taskStore.addTask(
      newTitle.value,
      newAssignee.value || null,
      newDueDate.value || null,
    )
    newTitle.value = ''
    newAssignee.value = ''
    newDueDate.value = ''
  } catch {
    toast.error('Failed to add task')
  }
}

async function handleToggle(id) {
  try {
    await taskStore.toggleTask(id)
  } catch {
    toast.error('Failed to update task')
  }
}

async function handleDelete(id) {
  try {
    await taskStore.deleteTask(id)
  } catch {
    toast.error('Failed to delete task')
  }
}
</script>
