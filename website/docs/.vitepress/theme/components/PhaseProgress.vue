<template>
  <span
    class="phase-progress"
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuetext="`${percent}% مكتمل`"
    :aria-label="`تقدم المرحلة ${phaseId}`"
    :title="`${completedCount} من ${total} درسًا مكتمل (${percent}%)`"
  >
    <span class="phase-progress-fill" :style="{ width: `${percent}%` }" />
    <span class="visually-hidden">{{ percent }}% مكتمل</span>
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

type LessonMeta = {
  phaseId?: string
  lessonId?: string
  hasQuiz?: boolean
}

type Lesson = {
  text: string
  link: string
  meta?: LessonMeta
}

const props = defineProps<{
  phaseId: string
  lessons: Lesson[]
}>()

/**
 * Supported shapes for localStorage `progress_<phaseId>`:
 *   ["01", "02"]                    → lesson IDs, slugs or links
 *   { completed: ["01", "02"] }     → wrapped array
 *   { "01": true, "02": true }      → map of lesson keys
 *   { "01": { completed: true } }   → richer map
 *   42                              → percentage
 * This keeps Phase 4 free to choose its storage shape.
 */
const completedCount = ref(0)
const total = computed(() => props.lessons.length)
const percent = computed(() => {
  if (total.value === 0) return 0
  if (completedCount.value >= total.value) return 100
  return Math.max(
    completedCount.value > 0 ? 1 : 0,
    Math.floor((completedCount.value / total.value) * 100)
  )
})
const storageKey = computed(() => `progress_${props.phaseId}`)

function normalize(value: unknown): string {
  let key = String(value ?? '')
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\//, '')
    .replace(/\.html$/i, '')
    .replace(/\/$/, '')
    .toLowerCase()

  if (/^\d+$/.test(key)) key = key.padStart(2, '0')
  return key
}

function lessonKeys(lesson: Lesson): string[] {
  const keys = new Set<string>()
  if (lesson.meta?.lessonId) keys.add(normalize(lesson.meta.lessonId))
  keys.add(normalize(lesson.link))
  const slug = lesson.link.split('/').filter(Boolean).pop()
  if (slug) keys.add(normalize(slug))
  return [...keys]
}

function countCompleted(raw: string): number {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    const numeric = Number(raw)
    if (Number.isFinite(numeric)) {
      return Math.round((Math.min(100, Math.max(0, numeric)) / 100) * total.value)
    }
    return 0
  }

  if (typeof data === 'number') {
    const safe = Math.min(100, Math.max(0, data))
    return Math.round((safe / 100) * total.value)
  }

  let entries: unknown[] = []
  if (Array.isArray(data)) {
    entries = data
  } else if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.completed)) {
      entries = record.completed
    } else if (Array.isArray(record.lessons)) {
      entries = record.lessons
    } else {
      entries = Object.keys(record).filter((key) => {
        const value = record[key]
        if (value === true || value === 1 || value === 'done' || value === 'completed' || value === 'true') {
          return true
        }
        return (
          !!value &&
          typeof value === 'object' &&
          ((value as Record<string, unknown>).completed === true ||
            (value as Record<string, unknown>).done === true)
        )
      })
    }
  }

  const completed = new Set<string>()
  for (const entry of entries) {
    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>
      const value = record.lessonId ?? record.id ?? record.slug ?? record.link
      if (value != null) completed.add(normalize(value))
    } else if (entry != null) {
      completed.add(normalize(entry))
    }
  }

  let count = 0
  for (const lesson of props.lessons) {
    if (lessonKeys(lesson).some((key) => completed.has(key))) count += 1
  }
  return Math.min(count, total.value)
}

function load(): void {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(storageKey.value)
  completedCount.value = raw ? countCompleted(raw) : 0
}

function onStorage(event: StorageEvent): void {
  if (!event.key || event.key === storageKey.value) load()
}

function onProgressEvent(event: Event): void {
  const detail = (event as CustomEvent<{ phaseId?: string } | undefined>).detail
  if (!detail?.phaseId || detail.phaseId === props.phaseId) load()
}

onMounted(() => {
  load()
  window.addEventListener('storage', onStorage)
  window.addEventListener('ai-progress-updated', onProgressEvent)
})

onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('ai-progress-updated', onProgressEvent)
})

watch(() => props.phaseId, load)
</script>

<style scoped>
.phase-progress {
  position: relative;
  display: block;
  width: 100%;
  height: 6px;
  padding: 2px;
  margin-top: 2px;
  overflow: hidden;
  border-radius: 999px;
  background-color: var(--vp-c-bg-alt);
  box-shadow: var(--neo-inset-sm);
}

.phase-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--peche), var(--nectarine));
  transition: width 0.35s ease;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
