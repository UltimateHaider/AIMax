<template>
  <a
    v-if="isSignedIn"
    href="/dashboard"
    class="nav-auth nav-auth--account"
    :aria-label="`حسابي — ${displayName}`"
    :title="`حسابي — ${displayName}`"
  >
    <img
      v-if="avatarUrl && !avatarFailed"
      :src="avatarUrl"
      :alt="`صورة ${displayName}`"
      class="nav-auth__avatar"
      referrerpolicy="no-referrer"
      @error="avatarFailed = true"
    />
    <span v-else class="nav-auth__avatar nav-auth__avatar--fallback" aria-hidden="true">
      {{ initials }}
    </span>
    <span class="nav-auth__label">حسابي</span>
  </a>

  <a
    v-else
    href="/login"
    class="nav-auth"
    aria-label="تسجيل الدخول"
    title="تسجيل الدخول"
  >
    <UserRound :size="16" aria-hidden="true" />
    <span class="nav-auth__label">تسجيل الدخول</span>
  </a>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UserRound } from 'lucide-vue-next'
import { useAuth } from '../auth'

const { user, hasStoredSession } = useAuth()
const avatarFailed = ref(false)

const isSignedIn = computed(() => Boolean(user.value || hasStoredSession.value))

const displayName = computed(() => {
  const metadata = user.value?.user_metadata ?? {}
  const fullName = metadata.full_name || metadata.name || metadata.user_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return user.value?.email?.split('@')[0] || 'حسابي'
})

const avatarUrl = computed(() => {
  const metadata = user.value?.user_metadata ?? {}
  const url = metadata.avatar_url || metadata.picture
  return typeof url === 'string' ? url : ''
})

const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return '؟'
  const parts = name.split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
})

watch(avatarUrl, () => {
  avatarFailed.value = false
})
</script>

<style scoped>
.nav-auth {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 0.8rem;
  font-family: var(--vp-font-family-base);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  text-decoration: none;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 999px;
  box-shadow: var(--neo-shadow-sm);
  transition: var(--theme-transition);
}

.nav-auth:hover {
  color: var(--nectarine-text);
  border-color: var(--peche);
}

.nav-auth__label {
  white-space: nowrap;
}

.nav-auth__avatar {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  overflow: hidden;
  font-size: 0.66rem;
  font-weight: 700;
  color: #1a1c20;
  object-fit: cover;
  background: var(--peche);
  border: 1px solid color-mix(in srgb, var(--peche) 65%, var(--nectarine));
  border-radius: 50%;
}

.nav-auth--account {
  padding-inline-start: 0.35rem;
}

@media (max-width: 1080px) {
  .nav-auth {
    width: 36px;
    min-height: 36px;
    padding: 0;
  }

  .nav-auth__label {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-auth {
    transition: none;
  }
}
</style>
