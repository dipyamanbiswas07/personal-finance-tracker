<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="familyStore.loading" class="flex items-center justify-center py-20">
      <div class="w-6 h-6 border-2 rounded-full border-accent/30 border-t-accent animate-spin" />
    </div>

    <!-- No family → Setup -->
    <FamilySetup v-else-if="!familyStore.family" />

    <!-- In a family → Dashboard -->
    <template v-else>
      <!-- Header -->
      <FamilyHeader
        class="anim-fade-up"
        style="animation-delay:0s"
        @toggle-members="showMembers = !showMembers"
        @leave="showLeaveConfirm = true"
      />

      <!-- Members panel (toggleable) -->
      <FamilyMembers
        v-if="showMembers"
        class="anim-fade-up"
        @remove="confirmRemoveMember"
      />

      <!-- Tab switcher -->
      <div class="flex items-center gap-1 bg-bg-card rounded-xl border border-white/10 p-1 w-fit anim-fade-up" style="animation-delay:0.07s">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-accent/15 text-accent'
              : 'text-text-muted hover:text-text-primary hover:bg-white/5',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="anim-fade-up" style="animation-delay:0.14s">
        <FamilyBudgetTracker v-if="activeTab === 'budget'" />
        <FamilyTaskList v-else-if="activeTab === 'tasks'" />
      </div>
    </template>

    <!-- Leave family confirm -->
    <BaseConfirmDialog
      v-model="showLeaveConfirm"
      title="Leave Family"
      message="Are you sure you want to leave this family? You will lose access to all shared data."
      confirm-label="Leave"
      @confirm="handleLeave"
    />

    <!-- Remove member confirm -->
    <BaseConfirmDialog
      v-model="showRemoveConfirm"
      title="Remove Member"
      message="Remove this member from the family?"
      confirm-label="Remove"
      @confirm="handleRemoveMember"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFamilyStore } from '../stores/familyStore.js'
import { useFamilyBudgetStore } from '../stores/familyBudgetStore.js'
import { useFamilyTaskStore } from '../stores/familyTaskStore.js'
import { useToast } from '../composables/useToast.js'
import FamilySetup from '../components/family/FamilySetup.vue'
import FamilyHeader from '../components/family/FamilyHeader.vue'
import FamilyMembers from '../components/family/FamilyMembers.vue'
import FamilyBudgetTracker from '../components/family/FamilyBudgetTracker.vue'
import FamilyTaskList from '../components/family/FamilyTaskList.vue'
import BaseConfirmDialog from '../components/ui/BaseConfirmDialog.vue'

const familyStore = useFamilyStore()
const familyBudgetStore = useFamilyBudgetStore()
const familyTaskStore = useFamilyTaskStore()
const { toast } = useToast()

const tabs = [
  { id: 'budget', label: 'Budget' },
  { id: 'tasks', label: 'Tasks' },
]
const activeTab = ref('budget')
const showMembers = ref(false)
const showLeaveConfirm = ref(false)
const showRemoveConfirm = ref(false)
const removingUserId = ref(null)

// Load family budget & tasks when family becomes available
watch(
  () => familyStore.family,
  async (fam) => {
    if (fam) {
      await Promise.all([
        familyBudgetStore.loadData(),
        familyTaskStore.loadTasks(),
      ])
    } else {
      familyBudgetStore.clearData()
      familyTaskStore.clearData()
    }
  },
  { immediate: true },
)

async function handleLeave() {
  try {
    await familyStore.leaveFamily()
    familyBudgetStore.clearData()
    familyTaskStore.clearData()
    toast.success('Left family')
  } catch {
    toast.error('Failed to leave family')
  }
}

function confirmRemoveMember(userId) {
  removingUserId.value = userId
  showRemoveConfirm.value = true
}

async function handleRemoveMember() {
  if (!removingUserId.value) return
  try {
    await familyStore.removeMember(removingUserId.value)
    toast.success('Member removed')
  } catch {
    toast.error('Failed to remove member')
  } finally {
    removingUserId.value = null
  }
}
</script>
