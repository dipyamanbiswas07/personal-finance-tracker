<template>
  <div class="max-w-xl mx-auto space-y-6">
    <div class="text-center anim-fade-up" style="animation-delay:0s">
      <div class="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-text-primary">Family Budget</h2>
      <p class="text-sm text-text-muted mt-1">Create or join a family to share budgets and tasks</p>
    </div>

    <!-- Create Family -->
    <div class="glass-card p-5 anim-fade-up" style="animation-delay:0.07s">
      <h3 class="text-sm font-semibold text-text-primary mb-3">Create a Family</h3>
      <form class="flex gap-2" @submit.prevent="handleCreate">
        <BaseInput
          v-model="familyName"
          placeholder="Family name"
          class="flex-1"
          :error="createError"
        />
        <BaseButton type="submit" variant="primary" :disabled="creating || !familyName.trim()">
          {{ creating ? 'Creating…' : 'Create' }}
        </BaseButton>
      </form>
    </div>

    <!-- Join Family -->
    <div class="glass-card p-5 anim-fade-up" style="animation-delay:0.14s">
      <h3 class="text-sm font-semibold text-text-primary mb-3">Join a Family</h3>
      <form class="flex gap-2" @submit.prevent="handleJoin">
        <BaseInput
          v-model="inviteCode"
          placeholder="Enter invite code"
          class="flex-1"
          :error="joinError"
        />
        <BaseButton type="submit" variant="primary" :disabled="joining || !inviteCode.trim()">
          {{ joining ? 'Joining…' : 'Join' }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFamilyStore } from '../../stores/familyStore.js'
import { useToast } from '../../composables/useToast.js'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const familyStore = useFamilyStore()
const { toast } = useToast()

const familyName = ref('')
const inviteCode = ref('')
const creating = ref(false)
const joining = ref(false)
const createError = ref('')
const joinError = ref('')

async function handleCreate() {
  if (!familyName.value.trim()) return
  createError.value = ''
  creating.value = true
  try {
    await familyStore.createFamily(familyName.value)
    toast.success('Family created!')
  } catch (e) {
    createError.value = e.message ?? 'Failed to create family'
  } finally {
    creating.value = false
  }
}

async function handleJoin() {
  if (!inviteCode.value.trim()) return
  joinError.value = ''
  joining.value = true
  try {
    await familyStore.joinFamily(inviteCode.value)
    toast.success('Joined family!')
  } catch (e) {
    joinError.value = e.message ?? 'Invalid invite code'
  } finally {
    joining.value = false
  }
}
</script>
