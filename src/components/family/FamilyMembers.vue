<template>
  <div class="glass-card overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 bg-bg-surface/40">
      <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Members</span>
    </div>
    <div>
      <div
        v-for="member in familyStore.members"
        :key="member.user_id"
        class="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-b-0"
      >
        <div class="flex items-center gap-3 min-w-0">
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
            {{ memberInitials(member.user_id) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm text-text-primary truncate">{{ memberEmail(member.user_id) }}</p>
            <p class="text-xs text-text-muted">
              {{ member.role === 'owner' ? 'Owner' : 'Member' }}
              <span class="text-text-muted/50"> · joined {{ formatDate(member.joined_at) }}</span>
            </p>
          </div>
        </div>

        <!-- Remove button (owner only, can't remove self) -->
        <button
          v-if="familyStore.isOwner && !isCurrentUser(member.user_id)"
          class="p-1.5 rounded-lg text-text-muted hover:text-expense hover:bg-expense/10 transition-colors"
          title="Remove member"
          @click="$emit('remove', member.user_id)"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFamilyStore } from '../../stores/familyStore.js'
import { useAuthStore } from '../../stores/authStore.js'

defineEmits(['remove'])

const familyStore = useFamilyStore()
const authStore = useAuthStore()

function isCurrentUser(userId) {
  return authStore.user?.id === userId
}

function getMember(userId) {
  return familyStore.members.find(m => m.user_id === userId)
}

function memberEmail(userId) {
  if (isCurrentUser(userId)) {
    return authStore.user?.user_metadata?.full_name || authStore.user?.email || 'You'
  }
  const member = getMember(userId)
  return member?.display_name || `Member ${userId.slice(0, 8)}…`
}

function memberInitials(userId) {
  let name = ''
  if (isCurrentUser(userId)) {
    name = authStore.user?.user_metadata?.full_name ?? authStore.user?.email ?? ''
  } else {
    const member = getMember(userId)
    name = member?.display_name || ''
  }
  if (!name) return userId.slice(0, 2).toUpperCase()
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}
</script>
