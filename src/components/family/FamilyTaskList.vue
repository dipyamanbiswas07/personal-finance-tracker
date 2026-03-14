<template>
  <div class="space-y-4">
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
              {{ isCurrentUser(member.user_id) ? 'Me' : (member.display_name || member.user_id.slice(0, 8) + '…') }}
            </option>
          </select>
        </div>
        <!-- Due date -->
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-text-muted uppercase tracking-wider">Due:</span>
          <input
            v-model="newDueDate"
            type="date"
            :min="today"
            class="text-xs bg-bg-card border border-white/10 rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent/50"
          />
        </div>
      </div>
    </form>

    <!-- Tabs + filter -->
    <div class="flex items-center gap-3">
      <div class="flex gap-1 bg-bg-surface/40 rounded-xl p-1 flex-1">
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'open'
              ? 'bg-accent/20 text-accent'
              : 'text-text-muted hover:text-text-primary',
          ]"
          @click="activeTab = 'open'"
        >
          Open
          <span v-if="visiblePending.length" class="ml-1.5 text-xs opacity-70">{{ visiblePending.length }}</span>
        </button>
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'closed'
              ? 'bg-accent/20 text-accent'
              : 'text-text-muted hover:text-text-primary',
          ]"
          @click="activeTab = 'closed'"
        >
          Closed
          <span v-if="visibleCompleted.length" class="ml-1.5 text-xs opacity-70">{{ visibleCompleted.length }}</span>
        </button>
      </div>
      <button
        :class="[
          'py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
          showMyTasks
            ? 'bg-accent/20 text-accent'
            : 'bg-bg-surface/40 text-text-muted hover:text-text-primary',
        ]"
        @click="showMyTasks = !showMyTasks"
      >
        My tasks
      </button>
    </div>

    <!-- Open tasks -->
    <div v-if="activeTab === 'open'">
      <div v-if="visiblePending.length > 0" class="glass-card overflow-hidden">
        <FamilyTaskItem
          v-for="task in visiblePending"
          :key="task.id"
          :task="task"
          :members="familyStore.members"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
      <div v-else class="glass-card text-center py-12">
        <p class="text-text-muted text-sm">No open tasks. Add one above.</p>
      </div>
    </div>

    <!-- Closed tasks -->
    <div v-if="activeTab === 'closed'">
      <div v-if="visibleCompleted.length > 0" class="glass-card overflow-hidden">
        <FamilyTaskItem
          v-for="task in visibleCompleted"
          :key="task.id"
          :task="task"
          :members="familyStore.members"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
      <div v-else class="glass-card text-center py-12">
        <p class="text-text-muted text-sm">No closed tasks yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const today = new Date().toISOString().split('T')[0]
const newTitle = ref('')
const newAssignee = ref('')
const newDueDate = ref('')
const activeTab = ref('open')
const showMyTasks = ref(false)

const myPendingTasks = computed(() =>
  taskStore.pendingTasks.filter(t => t.assignee_id === authStore.user?.id)
)
const myCompletedTasks = computed(() =>
  taskStore.completedTasks.filter(t => t.assignee_id === authStore.user?.id)
)

const visiblePending = computed(() => showMyTasks.value ? myPendingTasks.value : taskStore.pendingTasks)
const visibleCompleted = computed(() => showMyTasks.value ? myCompletedTasks.value : taskStore.completedTasks)

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
