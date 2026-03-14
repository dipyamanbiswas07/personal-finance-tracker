import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export const useFamilyStore = defineStore('family', () => {
  const family = ref(null)
  const members = ref([])
  const loading = ref(false)

  // ── Getters ──────────────────────────────────────────────────────────────

  const isOwner = computed(() => {
    if (!family.value) return false
    const me = members.value.find(m => m.user_id === currentUserId())
    return me?.role === 'owner'
  })

  const inviteCode = computed(() => family.value?.invite_code ?? '')

  const memberList = computed(() => members.value)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function currentUserId() {
    return supabase.auth.getUser?.()?.data?.user?.id ?? null
  }

  async function getCurrentUserId() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id ?? null
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async function loadFamily() {
    loading.value = true
    try {
      // Check if user is in a family
      const userId = await getCurrentUserId()
      if (!userId) return

      const { data: membership } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', userId)
        .maybeSingle()

      if (!membership) {
        family.value = null
        members.value = []
        return
      }

      // Load family details
      const { data: fam } = await supabase
        .from('families')
        .select('*')
        .eq('id', membership.family_id)
        .single()

      family.value = fam

      // Load members with user metadata
      const { data: mems } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', membership.family_id)
        .order('joined_at')

      members.value = mems ?? []
    } finally {
      loading.value = false
    }
  }

  function getDisplayName() {
    const { data } = supabase.auth.getUser?.() ?? {}
    const user = data?.user
    return user?.user_metadata?.full_name || user?.email || null
  }

  async function getDisplayNameAsync() {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    return user?.user_metadata?.full_name || user?.email || null
  }

  async function createFamily(name) {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')

    const displayName = await getDisplayNameAsync()
    const code = generateInviteCode()

    const { data: fam, error: famErr } = await supabase
      .from('families')
      .insert({
        name: name.trim(),
        invite_code: code,
        created_by: userId,
      })
      .select()
      .single()

    if (famErr) throw famErr

    // Add creator as owner
    const { error: memErr } = await supabase
      .from('family_members')
      .insert({
        family_id: fam.id,
        user_id: userId,
        role: 'owner',
        display_name: displayName,
      })

    if (memErr) throw memErr

    // Create default settings
    await supabase
      .from('family_settings')
      .insert({ family_id: fam.id })

    family.value = fam
    members.value = [{
      family_id: fam.id,
      user_id: userId,
      role: 'owner',
      display_name: displayName,
      joined_at: new Date().toISOString(),
    }]
  }

  async function joinFamily(code) {
    const displayName = await getDisplayNameAsync()
    const { data: familyId, error } = await supabase
      .rpc('join_family_by_code', {
        code: code.trim().toUpperCase(),
        display_name: displayName,
      })

    if (error) throw error

    // Reload family data
    await loadFamily()
    return familyId
  }

  async function leaveFamily() {
    const userId = await getCurrentUserId()
    if (!userId || !family.value) return

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('user_id', userId)
      .eq('family_id', family.value.id)

    if (error) throw error

    family.value = null
    members.value = []
  }

  async function removeMember(userId) {
    if (!family.value) return

    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('user_id', userId)
      .eq('family_id', family.value.id)

    if (error) throw error

    members.value = members.value.filter(m => m.user_id !== userId)
  }

  function clearData() {
    family.value = null
    members.value = []
  }

  return {
    // state
    family,
    members,
    loading,
    // getters
    isOwner,
    inviteCode,
    memberList,
    // actions
    loadFamily,
    createFamily,
    joinFamily,
    leaveFamily,
    removeMember,
    clearData,
  }
})
