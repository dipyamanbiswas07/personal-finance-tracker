import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  let _initPromise = null

  function init() {
    if (_initPromise) return _initPromise
    loading.value = true

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })

    _initPromise = supabase.auth.getSession()
      .then(({ data: { session } }) => {
        user.value = session?.user ?? null
      })
      .finally(() => {
        loading.value = false
      })

    return _initPromise
  }

  // Called by the router guard when access_token is found in the URL hash (implicit OAuth flow).
  async function handleImplicitCallback(accessToken, refreshToken) {
    try {
      const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (error) throw error
      user.value = data.session?.user ?? null
    } catch (e) {
      console.error('OAuth session error:', e)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  async function signInWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  return { user, loading, init, handleImplicitCallback, signIn, signUp, signOut, signInWithProvider }
})
