<template>
  <section v-if="isLesson" class="lesson-header" aria-labelledby="lesson-title">
    <span class="lesson-phase-badge">
      المرحلة {{ phaseId }} — {{ phaseName }}
    </span>

    <h1 id="lesson-title" class="lesson-title">{{ titleAr }}</h1>
    <p v-if="titleEn && titleEn !== titleAr" class="lesson-title-en" dir="ltr">
      {{ titleEn }}
    </p>

    <div class="lesson-meta">
      <span class="lesson-meta-item">
        <BookOpen :size="15" aria-hidden="true" />
        الدرس {{ order }} من {{ phaseLessonCount }} في هذه المرحلة
      </span>
      <span v-if="readingLabel" class="lesson-meta-item">
        <Clock :size="15" aria-hidden="true" />
        {{ readingLabel }} قراءة
      </span>
      <span v-if="hasQuiz" class="lesson-quiz-badge">
        <CheckCircle :size="14" aria-hidden="true" />
        اختبار تفاعلي
      </span>
    </div>

    <div class="lesson-actions">
      <button
        type="button"
        class="lesson-action lesson-action--primary"
        :aria-pressed="completed"
        :title="completed ? 'إزالة علامة الإكمال' : 'علّم هذا الدرس كمكتمل'"
        @click="toggleComplete"
      >
        <Check :size="16" aria-hidden="true" />
        {{ completed ? 'تم الإنجاز' : 'علّم كمكتمل' }}
      </button>

      <button
        type="button"
        class="lesson-action lesson-action--secondary"
        :title="copied ? 'تم نسخ الرابط' : 'نسخ رابط الدرس'"
        @click="copyLink"
      >
        <Check v-if="copied" :size="16" aria-hidden="true" />
        <LinkIcon v-else :size="16" aria-hidden="true" />
        {{ copied ? 'تم نسخ الرابط' : 'نسخ رابط الدرس' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { BookOpen, Check, CheckCircle, Clock, Link as LinkIcon } from 'lucide-vue-next'
import { isLessonCompleted, setLessonCompleted } from '../progress'

const { frontmatter } = useData()
const route = useRoute()

const isLesson = computed(
  () => Boolean(frontmatter.value.phase) && /^\/phases\/\d{2}\//.test(route.path)
)

const phaseId = computed(() => String(frontmatter.value.phase || ''))
const phaseName = computed(() => String(frontmatter.value.phaseAr || '').trim())
const lessonId = computed(() => String(frontmatter.value.lessonId || ''))
const titleAr = computed(() => String(frontmatter.value.titleAr || frontmatter.value.title || ''))
const titleEn = computed(() => String(frontmatter.value.title || ''))
const order = computed(() => Number(frontmatter.value.order) || 1)
const phaseLessonCount = computed(() => Number(frontmatter.value.phaseLessonCount) || 0)
const readingMinutes = computed(() => Number(frontmatter.value.readingMinutes) || 0)
const hasQuiz = computed(() => Boolean(frontmatter.value.hasQuiz))

const completed = ref(false)
const copied = ref(false)

let copyTimer: ReturnType<typeof setTimeout> | null = null

const readingLabel = computed(() => {
  const minutes = readingMinutes.value
  if (!minutes) return ''
  if (minutes === 1) return 'دقيقة واحدة'
  if (minutes === 2) return 'دقيقتان'
  if (minutes <= 10) return `${minutes} دقائق`
  return `${minutes} دقيقة`
})

function loadCompleted(): void {
  if (typeof window === 'undefined' || !phaseId.value) return
  completed.value = isLessonCompleted(phaseId.value, lessonId.value)
}

function toggleComplete(): void {
  if (typeof window === 'undefined' || !phaseId.value) return
  const next = !completed.value
  setLessonCompleted(phaseId.value, lessonId.value, next)
  completed.value = next
}

async function copyLink(): Promise<void> {
  if (typeof window === 'undefined') return
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }
  copied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
  }, 2000)
}

function onStorage(event: StorageEvent): void {
  if (!event.key || event.key === `progress_${phaseId.value}`) loadCompleted()
}

function onProgressEvent(event: Event): void {
  const detail = (event as CustomEvent<{ phaseId?: string } | undefined>).detail
  if (!detail?.phaseId || detail.phaseId === phaseId.value) loadCompleted()
}

onMounted(() => {
  loadCompleted()
  window.addEventListener('storage', onStorage)
  window.addEventListener('ai-progress-updated', onProgressEvent)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('ai-progress-updated', onProgressEvent)
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<style scoped>
.lesson-header {
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid color-mix(in srgb, var(--lagune) 40%, var(--vp-c-divider));
}

.lesson-phase-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.7rem;
  margin-bottom: 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border: 2px solid var(--lagune);
  border-radius: 999px;
  box-shadow: var(--neo-shadow-sm);
}

.lesson-title {
  margin: 0 0 0.35rem;
  font-size: clamp(1.8rem, 3.2vw, 2.35rem);
  font-weight: 800;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.lesson-title-en {
  margin: 0 0 0.9rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  text-align: right;
}

.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.lesson-meta-item {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.lesson-quiz-badge {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  padding: 0.22rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--menthe-text);
  background: color-mix(in srgb, var(--menthe) 16%, transparent);
  border: 2px solid var(--menthe);
  border-radius: 999px;
}

.lesson-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.lesson-action {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  min-height: 40px;
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
}

.lesson-action:hover {
  transform: translateY(-1px);
}

.lesson-action:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.lesson-action--primary {
  color: #ffffff;
  background: var(--nectarine-strong);
  border: 2px solid var(--nectarine);
  box-shadow: var(--neo-shadow-sm);
}

.lesson-action--primary:hover {
  background: var(--accent-primary-strong);
}

.lesson-action--primary[aria-pressed='true'] {
  color: var(--menthe-text);
  background: color-mix(in srgb, var(--menthe) 16%, transparent);
  border-color: var(--menthe);
  box-shadow: var(--neo-inset-sm);
}

.lesson-action--secondary {
  color: var(--peche-text);
  background: transparent;
  border: 2px solid var(--peche);
  box-shadow: var(--neo-shadow-sm);
}

.lesson-action--secondary:hover {
  background: color-mix(in srgb, var(--peche) 13%, transparent);
  border-color: var(--peche-text);
}

@media (max-width: 640px) {
  .lesson-title {
    font-size: 1.65rem;
  }

  .lesson-title-en {
    font-size: 0.74rem;
  }

  .lesson-actions {
    flex-direction: column;
  }

  .lesson-action {
    justify-content: center;
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-action {
    transition: none;
  }
}
</style>
