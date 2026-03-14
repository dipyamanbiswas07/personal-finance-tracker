import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'
import { useFamilyStore } from './familyStore.js'

export const useFamilyTaskStore = defineStore('familyTasks', () => {
  const tasks = ref([])
  const loading = ref(false)

  function getFamilyId() {
    return useFamilyStore().family?.id ?? null
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  const pendingTasks = computed(() => tasks.value.filter(t => !t.is_done))
  const completedTasks = computed(() => tasks.value.filter(t => t.is_done))

  // ── Actions ──────────────────────────────────────────────────────────────

  async function loadTasks() {
    const familyId = getFamilyId()
    if (!familyId) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('family_tasks')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      tasks.value = data ?? []
    } finally {
      loading.value = false
    }
  }

  async function addTask(title, assigneeId = null, dueDate = null) {
    const familyId = getFamilyId()
    if (!familyId) throw new Error('No family')

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const { data, error } = await supabase
      .from('family_tasks')
      .insert({
        family_id: familyId,
        title: title.trim(),
        assignee_id: assigneeId,
        due_date: dueDate,
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error
    tasks.value.unshift(data)
  }

  async function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return

    const newVal = !task.is_done
    task.is_done = newVal // optimistic

    const { error } = await supabase
      .from('family_tasks')
      .update({ is_done: newVal })
      .eq('id', id)

    if (error) {
      task.is_done = !newVal // revert
      throw error
    }
  }

  async function deleteTask(id) {
    const { error } = await supabase
      .from('family_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  async function updateTask(id, changes) {
    const { error } = await supabase
      .from('family_tasks')
      .update(changes)
      .eq('id', id)

    if (error) throw error

    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...changes }
    }
  }

  function clearData() {
    tasks.value = []
  }

  return {
    // state
    tasks,
    loading,
    // getters
    pendingTasks,
    completedTasks,
    // actions
    loadTasks,
    addTask,
    toggleTask,
    deleteTask,
    updateTask,
    clearData,
  }
})
