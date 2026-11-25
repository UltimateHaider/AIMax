import { inject, type InjectionKey, type Ref } from 'vue'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export interface AuthResult {
  error: string | null
  needsConfirmation?: boolean
}

export interface AuthContext {
  user: Ref<User | null>
  isLoading: Ref<boolean>
  hasStoredSession: Ref<boolean>
  isConfigured: Ref<boolean>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  getClient: () => Promise<SupabaseClient | null>
}

export const AUTH_KEY: InjectionKey<AuthContext> = Symbol('aimax-auth')

export function useAuth(): AuthContext {
  const context = inject(AUTH_KEY)

  if (!context) {
    throw new Error('useAuth() must be called inside <AuthProvider>.')
  }

  return context
}

function messageOf(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '')
  }
  return ''
}

/**
 * Keep Supabase's English API errors out of the Arabic UI. Unknown errors
 * get a safe generic message; the raw error is logged by AuthProvider.
 */
export function authErrorMessage(error: unknown): string {
  const message = messageOf(error)
  const lower = message.toLowerCase()

  if (!message) return 'تعذر إكمال العملية. حاول مرة أخرى.'
  if (lower.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }
  if (lower.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني أولاً، ثم حاول تسجيل الدخول.'
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'هذا البريد الإلكتروني مستخدم بالفعل. جرّب تسجيل الدخول.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'كلمة المرور قصيرة جدًا. استخدم 6 أحرف على الأقل.'
  }
  if (
    lower.includes('unable to validate email') ||
    lower.includes('invalid email') ||
    lower.includes('email_address_invalid') ||
    (lower.includes('email address') && lower.includes('invalid'))
  ) {
    return 'البريد الإلكتروني غير صالح أو غير مدعوم.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.'
  }
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider')) {
    return 'تسجيل الدخول بـGoogle غير مفعّل حاليًا.'
  }
  if (lower.includes('email signups are disabled')) {
    return 'إنشاء الحسابات بالبريد الإلكتروني غير مفعّل حاليًا.'
  }
  if (lower.includes('fetch') || lower.includes('network')) {
    return 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.'
  }

  return 'تعذر إكمال العملية. حاول مرة أخرى.'
}
