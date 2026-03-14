<template>
  <div class="glass-card p-5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Family info -->
      <div>
        <h2 class="text-lg font-semibold text-text-primary">{{ familyStore.family?.name }}</h2>
        <p class="text-sm text-text-muted mt-0.5">
          {{ familyStore.members.length }} member{{ familyStore.members.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Invite code -->
        <div class="flex items-center gap-1.5 bg-bg-surface rounded-lg border border-white/10 px-3 py-1.5">
          <span class="text-xs text-text-muted">Code:</span>
          <span class="text-sm font-mono font-semibold text-accent">{{ familyStore.inviteCode }}</span>
          <button
            class="p-1 rounded hover:bg-white/10 transition-colors text-text-muted hover:text-text-primary"
            title="Copy invite code"
            @click="copyCode"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
        </div>

        <!-- Members toggle -->
        <BaseButton variant="secondary" size="sm" @click="$emit('toggle-members')">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Members
        </BaseButton>

        <!-- Leave -->
        <BaseButton variant="danger" size="sm" @click="$emit('leave')">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Leave
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFamilyStore } from '../../stores/familyStore.js'
import { useToast } from '../../composables/useToast.js'
import BaseButton from '../ui/BaseButton.vue'

defineEmits(['toggle-members', 'leave'])

const familyStore = useFamilyStore()
const { toast } = useToast()

async function copyCode() {
  try {
    await navigator.clipboard.writeText(familyStore.inviteCode)
    toast.success('Invite code copied!')
  } catch {
    toast.error('Failed to copy')
  }
}
</script>
