<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import {
  AUTH_KEY,
  authErrorMessage,
  type AuthContext,
  type AuthResult
} from '../auth'

const AUTH_ROUTES = ['/login', '/signup', '/dashboard']

const route = useRoute()
const user = ref<User | null>(null)
const isLoading = ref(true)
const hasStoredSession = ref(false)
const isConfigured = ref(false)

let clientPromise: Promise<SupabaseClient | null> | null = null
let subscription: { unsubscribe: () => void } | null = null
let idleTimer: number | null = null
let initialized = false
let initialization: Promise<void> | null = null
let mounted = true

function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.some((routePath) => path === routePath || path.startsWith(`${routePath}/`))
}

function hasStoredAuthToken(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return Object.keys(window.localStorage).some(
      (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
    )
  } catch {
    return false
  }
}

function getClient(): Promise<SupabaseClient | null> {
  if (!clientPromise) {
    clientPromise = import('../../../../src/lib/supabase')
      .then((module) => {
        isConfigured.value = Boolean(module.supabase)
        return module.supabase
      })
      .catch((error) => {
        console.error('[auth] Failed to load the Supabase client:', error)
        isConfigured.value = false
        return null
      })
  }

  return clientPromise
}

async function initialize(): Promise<void> {
  if (initialized) return
  if (initialization) return initialization

  isLoading.value = true

  initialization = (async () => {
    const client = await getClient()
    if (!client) {
      isLoading.value = false
      initialized = true
      return
    }

    try {
      const { data } = await client.auth.getSession()
      if (!mounted) return

      user.value = data.session?.user ?? null
      hasStoredSession.value = Boolean(data.session)
    } catch (error) {
      console.error('[auth] Failed to restore the session:', error)
    }

    if (!subscription && mounted) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user ?? null
        hasStoredSession.value = Boolean(session)
        isLoading.value = false
      })
      subscription = data.subscription
    }

    initialized = true
    isLoading.value = false
  })()

  try {
    await initialization
  } finally {
    initialization = null
  }
}

async function signIn(email: string, password: string): Promise<AuthResult> {
  const client = await getClient()
  if (!client) {
    return { error: 'Supabase غير مُعد. تحقق من متغيرات البيئة.' }
  }

  try {
    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error ? authErrorMessage(error) : null }
  } catch (error) {
    console.error('[auth] Sign-in failed:', error)
    return { error: authErrorMessage(error) }
  }
}

async function signUp(email: string, password: string): Promise<AuthResult> {
  const client = await getClient()
  if (!client) {
    return { error: 'Supabase غير مُعد. تحقق من متغيرات البيئة.' }
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) return { error: authErrorMessage(error) }
    return { error: null, needsConfirmation: !data.session }
  } catch (error) {
    console.error('[auth] Sign-up failed:', error)
    return { error: authErrorMessage(error) }
  }
}

async function signOut(): Promise<AuthResult> {
  const client = await getClient()
  if (!client) {
    return { error: 'Supabase غير مُعد. تحقق من متغيرات البيئة.' }
  }

  try {
    const { error } = await client.auth.signOut()
    if (!error) {
      user.value = null
      hasStoredSession.value = false
    }
    return { error: error ? authErrorMessage(error) : null }
  } catch (error) {
    console.error('[auth] Sign-out failed:', error)
    return { error: authErrorMessage(error) }
  }
}

async function signInWithGoogle(): Promise<AuthResult> {
  const client = await getClient()
  if (!client) {
    return { error: 'Supabase غير مُعد. تحقق من متغيرات البيئة.' }
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    return { error: error ? authErrorMessage(error) : null }
  } catch (error) {
    console.error('[auth] Google sign-in failed:', error)
    return { error: authErrorMessage(error) }
  }
}

const context: AuthContext = {
  user,
  isLoading,
  hasStoredSession,
  isConfigured,
  signIn,
  signUp,
  signOut,
  signInWithGoogle,
  getClient
}

provide(AUTH_KEY, context)

onMounted(() => {
  hasStoredSession.value = hasStoredAuthToken()

  if (isAuthRoute(route.path)) {
    void initialize()
    return
  }

  if (hasStoredSession.value) {
    // Avoid loading the Supabase chunk on public pages unless a session
    // already exists; even then, wait until the page is interactive.
    idleTimer = window.setTimeout(() => void initialize(), 800)
    return
  }

  isLoading.value = false
})

watch(
  () => route.path,
  (path) => {
    if (isAuthRoute(path)) void initialize()
  }
)

onUnmounted(() => {
  mounted = false

  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }

  subscription?.unsubscribe()
  subscription = null
})
</script>
