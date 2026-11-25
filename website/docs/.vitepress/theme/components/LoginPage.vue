<template>
  <main class="auth-page">
    <div class="auth-shell">
      <section v-if="isLoading" class="auth-card auth-loading-card" aria-live="polite">
        <span class="auth-spinner" aria-hidden="true" />
        <p>جارٍ التحقق من الجلسة…</p>
      </section>

      <section v-else class="auth-card" aria-labelledby="login-title">
        <span class="auth-eyebrow">AIMax · حسابك التعليمي</span>
        <h1 id="login-title" class="auth-title">تسجيل الدخول</h1>
        <p class="auth-subtitle">
          تابع تقدمك في المسار، واحفظ نتائج الاختبارات وإعداداتك عبر أجهزتك.
        </p>

        <p v-if="!isConfigured" class="auth-alert auth-alert--error auth-config-note" role="alert">
          <AlertCircle :size="18" aria-hidden="true" />
          <span>Supabase غير مُعد حاليًا. أضف متغيرات البيئة أولًا.</span>
        </p>

        <button
          type="button"
          class="auth-google"
          :disabled="isBusy || !isConfigured"
          @click="handleGoogle"
        >
          <LoaderCircle v-if="googleLoading" :size="20" class="auth-spin-icon" aria-hidden="true" />
          <svg v-else class="google-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.38l-3.24-2.53c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.41 13.93A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.93v-2.6H3.07A10 10 0 0 0 2 12c0 1.61.38 3.14 1.07 4.53l3.34-2.6Z" />
            <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.93 5.47l3.34 2.6C7.2 7.71 9.4 5.95 12 5.95Z" />
          </svg>
          <span>{{ googleLoading ? 'جارٍ التحويل إلى Google…' : 'تسجيل الدخول بـ Google' }}</span>
        </button>

        <div class="auth-divider" aria-hidden="true"><span>أو</span></div>

        <form class="auth-form" novalidate @submit.prevent="submit">
          <label class="auth-field" for="login-email">
            <span>البريد الإلكتروني</span>
            <span class="auth-input-wrap">
              <Mail :size="17" class="auth-input-icon" aria-hidden="true" />
              <input
                id="login-email"
                v-model="email"
                class="auth-input"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="name@example.com"
                :aria-invalid="Boolean(error)"
              />
            </span>
          </label>

          <label class="auth-field" for="login-password">
            <span>كلمة المرور</span>
            <span class="auth-input-wrap">
              <LockKeyhole :size="17" class="auth-input-icon" aria-hidden="true" />
              <input
                id="login-password"
                v-model="password"
                class="auth-input"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="auth-eye"
                :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="17" aria-hidden="true" />
                <Eye v-else :size="17" aria-hidden="true" />
              </button>
            </span>
          </label>

          <button class="auth-submit" type="submit" :disabled="isBusy || !isConfigured">
            <LoaderCircle v-if="submitting" :size="18" class="auth-spin-icon" aria-hidden="true" />
            <span>{{ submitting ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول' }}</span>
          </button>

          <p v-if="error" id="login-error" class="auth-alert auth-alert--error" role="alert">
            <AlertCircle :size="18" aria-hidden="true" />
            <span>{{ error }}</span>
          </p>
        </form>

        <p class="auth-switch">
          ليس لديك حساب؟
          <a class="auth-link" href="/signup">أنشئ حساباً</a>
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail
} from 'lucide-vue-next'
import { useAuth } from '../auth'

const { user, isLoading, isConfigured, signIn, signInWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const googleLoading = ref(false)
const error = ref('')

const isBusy = computed(() => submitting.value || googleLoading.value)

watch([email, password], () => {
  if (error.value) error.value = ''
})

watch(
  user,
  (value) => {
    if (value) window.location.replace('/dashboard')
  },
  { immediate: true }
)

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function submit(): Promise<void> {
  error.value = ''

  if (!isConfigured.value) {
    error.value = 'Supabase غير مُعد. تحقق من متغيرات البيئة.'
    return
  }

  const cleanEmail = email.value.trim()
  if (!isValidEmail(cleanEmail)) {
    error.value = 'أدخل بريدًا إلكترونيًا صالحًا.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
    return
  }

  submitting.value = true
  const result = await signIn(cleanEmail, password.value)
  submitting.value = false

  if (result.error) {
    error.value = result.error
    return
  }

  window.location.assign('/dashboard')
}

async function handleGoogle(): Promise<void> {
  if (!isConfigured.value) {
    error.value = 'Supabase غير مُعد. تحقق من متغيرات البيئة.'
    return
  }

  error.value = ''
  googleLoading.value = true
  const result = await signInWithGoogle()
  googleLoading.value = false

  if (result.error) error.value = result.error
}
</script>
