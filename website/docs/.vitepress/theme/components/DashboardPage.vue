<template>
  <main class="auth-page auth-page--dashboard">
    <div class="dashboard-shell">
      <section
        v-if="isLoading || (user && !initialDataLoaded)"
        class="auth-card auth-loading-card"
        aria-live="polite"
      >
        <span class="auth-spinner" aria-hidden="true" />
        <p>جارٍ تحميل حسابك وتقدمك…</p>
      </section>

      <section v-else-if="!isConfigured" class="auth-card">
        <span class="auth-eyebrow">AIMax · إعداد مطلوب</span>
        <h1 class="auth-title">تعذر الاتصال بـSupabase</h1>
        <p class="auth-subtitle">
          أضف <code>VITE_SUPABASE_URL</code> و<code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
          إلى ملف <code>website/.env</code> ثم أعد تشغيل الموقع.
        </p>
        <p class="auth-alert auth-alert--error" role="alert">
          <AlertCircle :size="18" aria-hidden="true" />
          <span>الموقع يعمل، لكن المصادقة وتخزين التقدم غير مفعّلين بعد.</span>
        </p>
        <p class="auth-switch"><a class="auth-link" href="/">العودة إلى الرئيسية</a></p>
      </section>

      <template v-else-if="user">
        <header class="dashboard-hero">
          <div>
            <span class="auth-eyebrow">لوحة التحكم · AIMax</span>
            <h1 class="auth-title">مرحباً، {{ displayName }}</h1>
            <p class="auth-subtitle">
              هذه لمحة عن تقدمك في المسار. أكمل درسًا واحدًا كل يوم وسيتراكم الأثر.
            </p>
          </div>
          <a class="dashboard-home-link" href="/roadmap">العودة إلى خريطة المسار ←</a>
        </header>

        <p v-if="dataError" class="auth-alert auth-alert--error" role="alert">
          <AlertCircle :size="18" aria-hidden="true" />
          <span>{{ dataError }}</span>
        </p>

        <div class="dashboard-grid">
          <article class="auth-card user-card" aria-labelledby="account-title">
            <div class="user-main">
              <img
                v-if="avatarUrl && !avatarFailed"
                :src="avatarUrl"
                :alt="`صورة ${displayName}`"
                class="user-avatar"
                referrerpolicy="no-referrer"
                @error="avatarFailed = true"
              />
              <span v-else class="user-avatar" aria-hidden="true">{{ initials }}</span>
              <div>
                <h2 id="account-title" class="user-name">{{ displayName }}</h2>
                <p class="user-email">{{ user.email }}</p>
              </div>
            </div>
            <button class="signout-button" type="button" :disabled="signingOut" @click="handleSignOut">
              <LoaderCircle v-if="signingOut" :size="15" class="auth-spin-icon" aria-hidden="true" />
              <LogOut v-else :size="15" aria-hidden="true" />
              <span>{{ signingOut ? 'جارٍ الخروج…' : 'تسجيل الخروج' }}</span>
            </button>
          </article>

          <article class="auth-card progress-card" aria-labelledby="progress-title">
            <h2 id="progress-title" class="section-heading-row">تقدمك الكلي</h2>
            <div
              class="progress-ring"
              role="progressbar"
              :aria-valuenow="overallPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`التقدم الكلي: ${overallPercent}%`"
            >
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <circle class="progress-ring__track" cx="60" cy="60" r="52" />
                <circle
                  class="progress-ring__value"
                  cx="60"
                  cy="60"
                  r="52"
                  :stroke-dasharray="ringCircumference"
                  :stroke-dashoffset="ringOffset"
                />
              </svg>
              <span class="progress-ring__text">{{ overallPercent }}%</span>
            </div>
            <dl class="progress-stats">
              <div>
                <dt>دروس مكتملة</dt>
                <dd dir="ltr">{{ completedLessons }} / {{ totalLessons }}</dd>
              </div>
              <div>
                <dt>مراحل مكتملة</dt>
                <dd dir="ltr">{{ completedPhases }} / {{ phases.length }}</dd>
              </div>
            </dl>
          </article>
        </div>

        <section class="auth-card" aria-labelledby="phases-progress-title">
          <div class="section-heading-row">
            <h2 id="phases-progress-title">تقدم المراحل</h2>
            <span>{{ completedLessons }} درسًا مكتملًا من {{ totalLessons }}</span>
          </div>

          <ul v-if="!dataLoading" class="phase-progress-list">
            <li v-for="phase in phases" :key="phase.id" class="phase-progress-item">
              <a class="phase-progress-head" :href="`/phases/${phase.id}/`">
                <span>{{ phase.id }} — {{ phase.nameAr }}</span>
                <small dir="ltr">{{ completedForPhase(phase.id) }} / {{ phase.lessonCount }}</small>
              </a>
              <div
                class="phase-progress-track"
                role="progressbar"
                :aria-valuenow="phasePercent(phase)"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`تقدم ${phase.nameAr}: ${phasePercent(phase)}%`"
              >
                <span class="phase-progress-fill" :style="{ width: `${phasePercent(phase)}%` }" />
              </div>
            </li>
          </ul>
          <div v-else class="dashboard-skeleton">
            <div v-for="index in 4" :key="index" class="skeleton-block skeleton-block--small" />
          </div>
        </section>

        <section class="auth-card" aria-labelledby="settings-title">
          <div class="section-heading-row">
            <h2 id="settings-title">الإعدادات</h2>
            <span>تُحفظ في حسابك</span>
          </div>

          <form class="settings-grid" @submit.prevent="saveSettings">
            <div class="settings-row">
              <span class="settings-label">
                الثيم
                <small>اختر مظهر الموقع المفضل.</small>
              </span>
              <div class="theme-options" role="radiogroup" aria-label="الثيم">
                <label v-for="option in themeOptions" :key="option.value" class="theme-option">
                  <input v-model="settings.theme" type="radio" name="theme" :value="option.value" />
                  <span>
                    <component :is="option.icon" :size="14" aria-hidden="true" />
                    {{ option.label }}
                  </span>
                </label>
              </div>
            </div>

            <div class="settings-row">
              <label class="settings-label" for="language">
                اللغة
                <small>اختر لغة الواجهة المفضلة.</small>
              </label>
              <select id="language" v-model="settings.language" class="language-select">
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="settings-row">
              <span class="settings-label">
                الإشعارات
                <small>استلام تذكيرات بدروسك واختباراتك.</small>
              </span>
              <label class="switch">
                <input v-model="settings.notifications" type="checkbox" aria-label="تفعيل الإشعارات" />
                <span class="switch__track" aria-hidden="true" />
              </label>
            </div>

            <div class="settings-actions">
              <p v-if="settingsMessage" class="settings-status" role="status">
                {{ settingsMessage }}
              </p>
              <p v-else-if="settingsError" class="auth-alert auth-alert--error" role="alert">
                <AlertCircle :size="18" aria-hidden="true" />
                <span>{{ settingsError }}</span>
              </p>
              <span v-else />
              <button class="save-button" type="submit" :disabled="saving">
                <LoaderCircle v-if="saving" :size="15" class="auth-spin-icon" aria-hidden="true" />
                <CheckCircle2 v-else :size="15" aria-hidden="true" />
                <span>{{ saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات' }}</span>
              </button>
            </div>
          </form>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useData } from 'vitepress'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Sun
} from 'lucide-vue-next'
import summaryData from '../curriculum-summary.json'
import { useAuth } from '../auth'

type Phase = {
  id: string
  nameAr: string
  name: string
  lessonCount: number
}

type ProgressRow = {
  phase_id: string
  lesson_id: string
  status: string
  quiz_score: number | null
  completed_at: string | null
}

const phases = ((summaryData as { phases?: Phase[] }).phases ?? []) as Phase[]
const totalLessons = phases.reduce((sum, phase) => sum + phase.lessonCount, 0)
const ringCircumference = 2 * Math.PI * 52

const { user, isLoading, isConfigured, getClient, signOut } = useAuth()
const { isDark } = useData()

const progressRows = ref<ProgressRow[]>([])
const initialDataLoaded = ref(false)
const dataLoading = ref(false)
const dataError = ref('')
const signingOut = ref(false)
const saving = ref(false)
const settingsMessage = ref('')
const settingsError = ref('')
const avatarFailed = ref(false)

const settings = reactive({
  theme: 'auto' as 'auto' | 'light' | 'dark',
  language: 'ar' as 'ar' | 'en',
  notifications: true
})

const themeOptions = [
  { value: 'auto' as const, label: 'تلقائي', icon: Monitor },
  { value: 'light' as const, label: 'نهاري', icon: Sun },
  { value: 'dark' as const, label: 'ليلي', icon: Moon }
]

const displayName = computed(() => {
  const metadata = user.value?.user_metadata ?? {}
  const fullName = metadata.full_name || metadata.name || metadata.user_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return user.value?.email?.split('@')[0] || 'صديقنا'
})

const avatarUrl = computed(() => {
  const metadata = user.value?.user_metadata ?? {}
  const url = metadata.avatar_url || metadata.picture
  return typeof url === 'string' ? url : ''
})

const initials = computed(() => {
  const parts = displayName.value.split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
})

const completedKeys = computed(() => {
  return new Set(
    progressRows.value
      .filter((row) => row.status === 'completed')
      .map((row) => `${row.phase_id}:${row.lesson_id}`)
  )
})

const completedLessons = computed(() => completedKeys.value.size)

const overallPercent = computed(() => {
  if (!totalLessons) return 0
  if (completedLessons.value >= totalLessons) return 100
  if (completedLessons.value === 0) return 0
  return Math.max(1, Math.floor((completedLessons.value / totalLessons) * 100))
})

const ringOffset = computed(() => ringCircumference * (1 - overallPercent.value / 100))

const completedPhases = computed(() => {
  return phases.filter((phase) => completedForPhase(phase.id) >= phase.lessonCount).length
})

function completedForPhase(phaseId: string): number {
  let count = 0
  for (const key of completedKeys.value) {
    if (key.startsWith(`${phaseId}:`)) count += 1
  }
  return count
}

function phasePercent(phase: Phase): number {
  if (!phase.lessonCount) return 0
  const completed = completedForPhase(phase.id)
  if (completed >= phase.lessonCount) return 100
  if (completed === 0) return 0
  return Math.max(1, Math.floor((completed / phase.lessonCount) * 100))
}

function applyTheme(theme: 'auto' | 'light' | 'dark'): void {
  if (typeof window === 'undefined') return

  window.localStorage.setItem('vitepress-theme-appearance', theme)

  if (theme === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else {
    isDark.value = theme === 'dark'
  }
}

async function loadDashboard(userId: string): Promise<void> {
  dataLoading.value = true
  initialDataLoaded.value = false
  dataError.value = ''

  try {
    const client: SupabaseClient | null = await getClient()
    if (!client) {
      dataError.value = 'Supabase غير مُعد. تحقق من متغيرات البيئة.'
      return
    }

    const [progressResult, settingsResult] = await Promise.all([
      client
        .from('user_progress')
        .select('phase_id, lesson_id, status, quiz_score, completed_at')
        .eq('user_id', userId),
      client
        .from('user_settings')
        .select('theme, language, notifications')
        .eq('user_id', userId)
        .maybeSingle()
    ])

    if (progressResult.error) throw progressResult.error
    progressRows.value = (progressResult.data ?? []) as ProgressRow[]

    if (settingsResult.error) {
      settingsError.value = 'تعذر تحميل الإعدادات. تحقق من إنشاء جدول user_settings.'
      console.error('[dashboard] Failed to load settings:', settingsResult.error)
    } else if (settingsResult.data) {
      settings.theme = settingsResult.data.theme
      settings.language = settingsResult.data.language
      settings.notifications = settingsResult.data.notifications
      applyTheme(settings.theme)
      settingsError.value = ''
    }
  } catch (error) {
    console.error('[dashboard] Failed to load data:', error)
    dataError.value = 'تعذر تحميل تقدمك. تحقق من اتصالك وحاول تحديث الصفحة.'
  } finally {
    dataLoading.value = false
    initialDataLoaded.value = true
  }
}

async function saveSettings(): Promise<void> {
  if (!user.value) return

  saving.value = true
  settingsError.value = ''
  settingsMessage.value = ''

  try {
    const client = await getClient()
    if (!client) {
      settingsError.value = 'Supabase غير مُعد. تحقق من متغيرات البيئة.'
      return
    }

    const { error } = await client.from('user_settings').upsert(
      {
        user_id: user.value.id,
        theme: settings.theme,
        language: settings.language,
        notifications: settings.notifications
      },
      { onConflict: 'user_id' }
    )

    if (error) throw error

    applyTheme(settings.theme)
    settingsMessage.value = 'تم حفظ الإعدادات بنجاح.'
    window.setTimeout(() => {
      settingsMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('[dashboard] Failed to save settings:', error)
    settingsError.value = 'تعذر حفظ الإعدادات. حاول مرة أخرى.'
  } finally {
    saving.value = false
  }
}

async function handleSignOut(): Promise<void> {
  signingOut.value = true
  const result = await signOut()
  signingOut.value = false

  if (result.error) {
    dataError.value = result.error
    return
  }

  window.location.assign('/login')
}

watch(
  user,
  (value) => {
    if (!value) {
      initialDataLoaded.value = false
      progressRows.value = []
      return
    }

    void loadDashboard(value.id)
  },
  { immediate: true }
)

watch(
  [isLoading, user, isConfigured],
  ([loading, currentUser, configured]) => {
    if (!loading && !currentUser && configured) {
      window.location.replace('/login')
    }
  },
  { immediate: true }
)

watch(
  () => [settings.theme, settings.language, settings.notifications],
  () => {
    settingsMessage.value = ''
    settingsError.value = ''
  }
)

watch(avatarUrl, () => {
  avatarFailed.value = false
})
</script>
