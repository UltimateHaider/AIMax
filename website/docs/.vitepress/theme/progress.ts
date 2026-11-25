import { onMounted, onUnmounted, ref } from 'vue'
import summaryData from './curriculum-summary.json'

export type PhaseProgress = {
  id: string
  completed: number
  total: number
  percent: number
}

export type ProgressSnapshot = {
  completed: number
  total: number
  percent: number
  phases: Record<string, PhaseProgress>
}

type PhaseMeta = {
  id: string
  total: number
}

const phaseMeta: PhaseMeta[] = summaryData.phases.map((phase) => ({
  id: phase.id,
  total: phase.lessonCount
}))

export const TOTAL_LESSONS = phaseMeta.reduce((sum, phase) => sum + phase.total, 0)

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function entryKey(entry: unknown): string | null {
  if (entry && typeof entry === 'object') {
    const record = entry as Record<string, unknown>
    const value = record.lessonId ?? record.id ?? record.slug ?? record.link
    return value != null ? String(value) : null
  }
  return entry != null ? String(entry) : null
}

function isDone(value: unknown): boolean {
  if (value === true || value === 1 || value === 'done' || value === 'completed' || value === 'true') {
    return true
  }
  return (
    !!value &&
    typeof value === 'object' &&
    ((value as Record<string, unknown>).completed === true ||
      (value as Record<string, unknown>).done === true)
  )
}

function completedKeys(value: unknown): Set<string> {
  const keys = new Set<string>()

  if (Array.isArray(value)) {
    for (const entry of value) {
      const key = entryKey(entry)
      if (key) keys.add(key)
    }
    return keys
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (Array.isArray(record.completed)) return completedKeys(record.completed)
    if (Array.isArray(record.lessons)) return completedKeys(record.lessons)
    for (const key of Object.keys(record)) {
      if (isDone(record[key])) keys.add(key)
    }
  }

  return keys
}

function readCompletedCount(phaseId: string, total: number): number {
  if (typeof window === 'undefined') return 0

  try {
    const raw = window.localStorage.getItem(`progress_${phaseId}`)
    if (!raw) return 0

    let data: unknown
    try {
      data = JSON.parse(raw)
    } catch {
      const numeric = Number(raw)
      if (Number.isFinite(numeric)) {
        return clamp(Math.round((clamp(numeric, 0, 100) / 100) * total), 0, total)
      }
      return 0
    }

    if (typeof data === 'number') {
      return clamp(Math.round((clamp(data, 0, 100) / 100) * total), 0, total)
    }

    return clamp(completedKeys(data).size, 0, total)
  } catch {
    return 0
  }
}

export function readProgress(): ProgressSnapshot {
  const phases: Record<string, PhaseProgress> = {}
  let completed = 0
  let total = 0

  for (const meta of phaseMeta) {
    const phaseCompleted = readCompletedCount(meta.id, meta.total)
    phases[meta.id] = {
      id: meta.id,
      completed: phaseCompleted,
      total: meta.total,
      percent:
        meta.total <= 0
          ? 0
          : phaseCompleted >= meta.total
            ? 100
            : Math.max(phaseCompleted ? 1 : 0, Math.floor((phaseCompleted / meta.total) * 100))
    }
    completed += phaseCompleted
    total += meta.total
  }

  return {
    completed,
    total,
    percent:
      total <= 0
        ? 0
        : completed >= total
          ? 100
          : Math.max(completed ? 1 : 0, Math.floor((completed / total) * 100)),
    phases
  }
}

function emptyProgress(): ProgressSnapshot {
  const phases: Record<string, PhaseProgress> = {}
  let total = 0

  for (const meta of phaseMeta) {
    phases[meta.id] = {
      id: meta.id,
      completed: 0,
      total: meta.total,
      percent: 0
    }
    total += meta.total
  }

  return { completed: 0, total, percent: 0, phases }
}

export function readCompletedIds(phaseId: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(`progress_${phaseId}`)
    if (!raw) return []
    return [...completedKeys(JSON.parse(raw))]
  } catch {
    return []
  }
}

export function isLessonCompleted(phaseId: string, lessonId: string): boolean {
  return readCompletedIds(phaseId).includes(String(lessonId))
}

export function setLessonCompleted(phaseId: string, lessonId: string, completed: boolean): void {
  if (typeof window === 'undefined' || !phaseId || !lessonId) return

  const ids = new Set(readCompletedIds(phaseId))
  if (completed) ids.add(String(lessonId))
  else ids.delete(String(lessonId))

  try {
    window.localStorage.setItem(`progress_${phaseId}`, JSON.stringify([...ids]))
  } catch {
    // Storage can be unavailable in private mode; the current page still updates.
  }

  window.dispatchEvent(
    new CustomEvent('ai-progress-updated', { detail: { phaseId } })
  )
}

export function useProgress() {
  const progress = ref<ProgressSnapshot>(emptyProgress())
  let frame = 0

  function refresh(): void {
    progress.value = readProgress()
  }

  function scheduleRefresh(): void {
    if (typeof window === 'undefined') return
    if (frame) window.cancelAnimationFrame(frame)
    frame = window.requestAnimationFrame(() => {
      frame = 0
      refresh()
    })
  }

  function onStorage(event: StorageEvent): void {
    if (!event.key || event.key.startsWith('progress_')) scheduleRefresh()
  }

  function onProgressEvent(): void {
    scheduleRefresh()
  }

  onMounted(() => {
    refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener('ai-progress-updated', onProgressEvent)
  })

  onUnmounted(() => {
    if (frame) window.cancelAnimationFrame(frame)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('ai-progress-updated', onProgressEvent)
  })

  return { progress, refresh }
}
