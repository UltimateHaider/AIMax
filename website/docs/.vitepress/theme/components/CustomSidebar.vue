<template>
  <div ref="rootEl" class="custom-sidebar" dir="rtl">
    <div class="sidebar-toolbar">
      <div class="sidebar-heading">
        <span class="sidebar-eyebrow">المسار التعليمي</span>
        <span class="sidebar-subtitle">{{ phases.length }} مرحلة · {{ totalLessons }} درسًا</span>
      </div>

      <div class="sidebar-actions">
        <button
          type="button"
          class="collapse-all"
          :aria-expanded="allExpanded"
          :aria-label="allExpanded ? 'طي جميع المراحل' : 'فتح جميع المراحل'"
          @click="toggleAll"
        >
          <component :is="allExpanded ? ChevronsUp : ChevronsDown" :size="14" aria-hidden="true" />
          <span>{{ allExpanded ? 'طي الكل' : 'فتح الكل' }}</span>
        </button>

        <button type="button" class="sidebar-close" aria-label="إغلاق القائمة" @click="closeMobileSidebar">
          <X :size="16" aria-hidden="true" />
        </button>
      </div>
    </div>

    <nav class="phase-nav" aria-label="مراحل المسار التعليمي">
      <ul class="phase-list">
        <li v-for="phase in visiblePhases" :key="phase.id" class="phase-item">
          <button
            type="button"
            class="phase-header"
            :class="{ 'is-current': phase.id === activePhaseId }"
            :aria-expanded="isExpanded(phase.id)"
            :aria-controls="`phase-${phase.id}-lessons`"
            @click="togglePhase(phase.id)"
          >
            <span class="phase-icon" aria-hidden="true">
              <component :is="iconFor(phase.id)" :size="15" :stroke-width="1.8" />
            </span>

            <span class="phase-body">
              <span class="phase-top">
                <span class="phase-id">{{ phase.id }}</span>
                <span class="phase-name">{{ phase.name }}</span>
                <span class="phase-count" :aria-label="`${phase.count} درسًا`">{{ phase.count }}</span>
                <span
                  v-if="phasePercent(phase.id) > 0"
                  class="phase-percent"
                  :title="`${phasePercent(phase.id)}% مكتمل`"
                >
                  {{ phasePercent(phase.id) }}%
                </span>
                <span v-if="phase.id === activePhaseId" class="phase-here" aria-hidden="true" />
              </span>
              <PhaseProgress :phase-id="phase.id" :lessons="phase.lessons" />
            </span>

            <ChevronDown
              class="phase-chevron"
              :class="{ 'is-rotated': isExpanded(phase.id) }"
              :size="14"
              aria-hidden="true"
            />
          </button>

          <Transition name="phase">
            <ul v-if="isExpanded(phase.id)" :id="`phase-${phase.id}-lessons`" class="lesson-list">
              <li v-for="lesson in phase.lessons" :key="lesson.link">
                <a
                  :href="lesson.link"
                  class="lesson-link"
                  :class="{ 'is-active': isActive(lesson.link) }"
                  :aria-current="isActive(lesson.link) ? 'page' : undefined"
                >
                  <span class="here-dot" :class="{ 'is-visible': isActive(lesson.link) }" aria-hidden="true" />
                  <span class="lesson-number" aria-hidden="true">{{ lesson.meta?.lessonId ?? '' }}</span>
                  <span class="lesson-text">{{ lessonTitle(lesson) }}</span>
                </a>
              </li>
            </ul>
          </Transition>
        </li>
      </ul>
    </nav>

    <p class="sidebar-footnote">
      <Sparkles :size="13" aria-hidden="true" />
      <span>تُحفظ حالة الطي والتقدم محليًا في متصفحك.</span>
    </p>

    <Teleport to="body">
      <button
        v-show="!isMobileSidebarOpen"
        ref="mobileToggleRef"
        type="button"
        class="mobile-sidebar-toggle"
        aria-label="فتح قائمة الدروس"
        aria-controls="VPSidebarNav"
        :aria-expanded="isMobileSidebarOpen"
        @click="openMobileSidebar"
      >
        <Menu :size="20" aria-hidden="true" />
      </button>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useRoute } from 'vitepress'
import {
  BarChart3,
  Bot,
  Brain,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  Eye,
  Image as ImageIcon,
  Layers,
  Menu,
  MessageSquare,
  Mic,
  Plug,
  Rocket,
  Server,
  Settings,
  Shield,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  Users,
  Wrench,
  X,
  Zap
} from 'lucide-vue-next'
import PhaseProgress from './PhaseProgress.vue'
import sidebarData from '../../sidebar'
import { useProgress } from '../progress'

const emit = defineEmits<{
  open: []
  close: []
}>()

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

type SidebarSection = {
  text: string
  collapsed?: boolean
  meta?: {
    phaseId?: string
    lessonCount?: number
  }
  items?: Lesson[]
}

type Phase = {
  id: string
  name: string
  count: number
  lessons: Lesson[]
}

const EXPANDED_KEY = 'sidebar_expanded_phases'
const ALL_STATE_KEY = 'sidebar_all_state'

const phaseIcons: Record<string, Component> = {
  '00': Settings,
  '01': Sigma,
  '02': BarChart3,
  '03': Layers,
  '04': ImageIcon,
  '05': MessageSquare,
  '06': Mic,
  '07': Zap,
  '08': Sparkles,
  '09': Target,
  '10': Brain,
  '11': Wrench,
  '12': Eye,
  '13': Plug,
  '14': Bot,
  '15': Rocket,
  '16': Users,
  '17': Server,
  '18': Shield,
  '19': Trophy
}

const sidebarConfig = sidebarData as Record<string, SidebarSection[]>

const phases: Phase[] = Object.entries(sidebarConfig)
  .map(([key, sections]) => {
    const section = sections[0]
    if (!section) return null

    const id = key.match(/\/phases\/(\d{2})\//)?.[1] ?? key.replace(/\D/g, '')
    const lessons = section.items ?? []

    return {
      id,
      name: section.text.replace(/^\d+\s*—\s*/, ''),
      count: section.meta?.lessonCount ?? lessons.length,
      lessons
    }
  })
  .filter((phase): phase is Phase => phase !== null)
  .sort((a, b) => a.id.localeCompare(b.id))

const totalLessons = phases.reduce((sum, phase) => sum + phase.count, 0)
const { progress: overallProgress } = useProgress()

function phasePercent(phaseId: string): number {
  return overallProgress.value.phases[phaseId]?.percent ?? 0
}

const route = useRoute()
const rootEl = ref<HTMLElement | null>(null)
const mobileToggleRef = ref<HTMLButtonElement | null>(null)
const isMobileSidebarOpen = ref(false)
const clientReady = ref(false)
const renderedPhaseIds = ref<string[]>([])

function normalizePath(path: string): string {
  let value = String(path || '').split('#')[0].split('?')[0]
  if (value.endsWith('/index.html')) value = value.slice(0, -'index.html'.length)
  else if (value.endsWith('.html')) value = value.slice(0, -5)
  if (value.length > 1) value = value.replace(/\/$/, '')
  return value
}

const currentPath = computed(() => normalizePath(route.path))

const activePhaseId = computed(() => {
  const match = currentPath.value.match(/^\/phases\/(\d{2})(?:\/|$)/)
  return match?.[1] ?? ''
})

const initialState = activePhaseId.value || phases[0]?.id || ''
const expanded = ref<string[]>(initialState ? [initialState] : [])

// SSR renders only the current phase (keeps every page small). After
// hydration the remaining phases are appended in small animation-frame
// batches so a single 435-link render does not block the main thread.
const visiblePhases = computed(() => {
  if (!clientReady.value) {
    const active = phases.find((phase) => phase.id === activePhaseId.value)
    return active ? [active] : phases.slice(0, 1)
  }

  if (renderedPhaseIds.value.length === 0) {
    const active = phases.find((phase) => phase.id === activePhaseId.value)
    return active ? [active] : phases.slice(0, 1)
  }

  return phases.filter(
    (phase) =>
      phase.id === activePhaseId.value || renderedPhaseIds.value.includes(phase.id)
  )
})

const allExpanded = computed(() => phases.every((phase) => expanded.value.includes(phase.id)))
const allCollapsed = computed(() => phases.every((phase) => !expanded.value.includes(phase.id)))

let sidebarObserver: MutationObserver | null = null

function iconFor(phaseId: string): Component {
  return phaseIcons[phaseId] ?? Layers
}

function lessonTitle(lesson: Lesson): string {
  return lesson.text.replace(/^\d+\.\s*/, '')
}

function isActive(link: string): boolean {
  return normalizePath(link) === currentPath.value
}

function isExpanded(phaseId: string): boolean {
  return expanded.value.includes(phaseId)
}

function scrollToActive(behavior: ScrollBehavior = 'smooth'): void {
  if (typeof window === 'undefined') return
  const root = rootEl.value
  const active = root?.querySelector<HTMLElement>('.lesson-link.is-active')
  if (!active) return

  const sidebar = root.closest('.VPSidebar') as HTMLElement | null
  if (!sidebar) return

  const sidebarRect = sidebar.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const top =
    activeRect.top -
    sidebarRect.top +
    sidebar.scrollTop -
    sidebar.clientHeight / 2 +
    activeRect.height / 2

  if (typeof sidebar.scrollTo === 'function') {
    sidebar.scrollTo({ top: Math.max(0, top), behavior })
  } else {
    sidebar.scrollTop = Math.max(0, top)
  }
}

function persistExpanded(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded.value))
    window.localStorage.setItem(
      ALL_STATE_KEY,
      allExpanded.value ? 'expanded' : allCollapsed.value ? 'collapsed' : 'mixed'
    )
  } catch {
    // localStorage can be unavailable (private mode); the UI still works.
  }
}

function ensureActiveExpanded(): void {
  const id = activePhaseId.value
  if (id && !expanded.value.includes(id)) {
    expanded.value = [...expanded.value, id]
  }
}

function loadExpandedState(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(EXPANDED_KEY)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const valid = parsed
          .map((value) => String(value))
          .filter((id) => phases.some((phase) => phase.id === id))
        expanded.value = [...new Set(valid)]
        ensureActiveExpanded()
        return
      }
    }

    const allState = window.localStorage.getItem(ALL_STATE_KEY)
    if (allState === 'expanded') {
      expanded.value = phases.map((phase) => phase.id)
    } else if (allState === 'collapsed') {
      expanded.value = []
    } else if (activePhaseId.value) {
      expanded.value = [activePhaseId.value]
    }
    ensureActiveExpanded()
  } catch {
    // Keep the SSR state if storage is unavailable or corrupted.
  }
}

function toggleAll(): void {
  expanded.value = allExpanded.value ? [] : phases.map((phase) => phase.id)
  persistExpanded()
  nextTick(() => scrollToActive())
}

function togglePhase(phaseId: string): void {
  const next = new Set(expanded.value)
  if (next.has(phaseId)) next.delete(phaseId)
  else next.add(phaseId)
  expanded.value = [...next]
  persistExpanded()
  if (isExpanded(phaseId)) nextTick(() => scrollToActive())
}

function syncMobileState(): void {
  if (typeof window === 'undefined') return
  const sidebar = document.querySelector<HTMLElement>('.VPSidebar')
  isMobileSidebarOpen.value = !!sidebar?.classList.contains('open')
}

function openMobileSidebar(): void {
  if (typeof window === 'undefined') return
  emit('open')
  window.requestAnimationFrame(syncMobileState)
}

function closeMobileSidebar(): void {
  if (typeof window === 'undefined') return
  emit('close')
  window.requestAnimationFrame(() => {
    syncMobileState()
    mobileToggleRef.value?.focus()
  })
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isMobileSidebarOpen.value) {
    event.preventDefault()
    closeMobileSidebar()
  }
}

onMounted(() => {
  clientReady.value = true
  loadExpandedState()
  nextTick(() => scrollToActive('auto'))
  document.addEventListener('keydown', onKeydown)

  // Add two phases per frame instead of all 20 in one task.
  let index = 0
  const step = (): void => {
    if (index >= phases.length) {
      nextTick(() => scrollToActive())
      return
    }
    const batch = phases.slice(index, index + 2).map((phase) => phase.id)
    renderedPhaseIds.value = [...renderedPhaseIds.value, ...batch]
    index += 2
    window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)

  const sidebar = document.querySelector<HTMLElement>('.VPSidebar')
  if (sidebar) {
    syncMobileState()
    sidebarObserver = new MutationObserver(syncMobileState)
    sidebarObserver.observe(sidebar, { attributes: true, attributeFilter: ['class'] })
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  sidebarObserver?.disconnect()
  sidebarObserver = null
})

watch(
  () => route.path,
  () => {
    const id = activePhaseId.value
    if (id && !expanded.value.includes(id)) {
      expanded.value = [...expanded.value, id]
      persistExpanded()
    }
    nextTick(() => scrollToActive())
  }
)
</script>

<style scoped>
.custom-sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  color: var(--vp-c-text-1);
}

.sidebar-toolbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0 10px;
  margin-bottom: 2px;
  background-color: var(--bg);
  border-bottom: 1px solid var(--vp-c-divider);
}

.sidebar-heading {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.sidebar-eyebrow {
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.sidebar-subtitle {
  overflow: hidden;
  font-size: 10.5px;
  color: var(--vp-c-text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}

.collapse-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 9px;
  box-shadow: var(--neo-shadow-sm);
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.collapse-all:hover {
  color: var(--lagune-text);
  background-color: color-mix(in srgb, var(--lagune) 12%, transparent);
  border-color: var(--lagune);
}

.collapse-all:focus-visible,
.sidebar-close:focus-visible,
.phase-header:focus-visible,
.lesson-link:focus-visible,
.mobile-sidebar-toggle:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.sidebar-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 9px;
  box-shadow: var(--neo-shadow-sm);
}

.sidebar-close:hover {
  color: var(--nectarine-text);
  border-color: var(--nectarine);
}

@media (max-width: 959px) {
  .sidebar-close {
    display: inline-flex;
  }
}

.phase-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.phase-item {
  border-bottom: 1px solid var(--vp-c-divider);
}

.phase-item:last-child {
  border-bottom: 0;
}

.phase-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 9px 7px;
  color: var(--vp-c-text-1);
  text-align: start;
  cursor: pointer;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.phase-header:hover {
  background-color: var(--vp-c-bg-soft);
  border-color: color-mix(in srgb, var(--lagune) 28%, transparent);
}

.phase-header.is-current {
  background-color: color-mix(in srgb, var(--lagune) 20%, transparent);
  border-color: var(--lagune);
  box-shadow: var(--neo-inset-sm);
}

.phase-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-top: 1px;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--lagune) 35%, transparent);
  border-radius: 8px;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.phase-header.is-current .phase-icon {
  color: #ffffff;
  background: var(--lagune-strong);
  border-color: var(--lagune);
}

.phase-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.phase-top {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.phase-id {
  flex-shrink: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.phase-name {
  display: -webkit-box;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.phase-count {
  flex-shrink: 0;
  min-width: 20px;
  padding: 1px 6px;
  font-size: 9.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  background: var(--lagune-strong);
  border: 1px solid var(--lagune);
  border-radius: 999px;
}

.phase-percent {
  flex-shrink: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 700;
  color: var(--menthe-text);
}

.phase-header.is-current .phase-count {
  color: #ffffff;
  background: var(--lagune-strong);
}

.phase-here {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  background: var(--peche);
  border-radius: 50%;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--peche) 22%, transparent);
}

.phase-chevron {
  flex-shrink: 0;
  margin-top: 4px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease, color 0.2s;
}

.phase-chevron.is-rotated {
  transform: rotate(180deg);
}

.phase-header.is-current .phase-chevron {
  color: var(--lagune-text);
}

.lesson-list {
  padding-inline-start: 10px;
  margin: 0 0 8px;
  margin-inline-start: 18px;
  list-style: none;
  border-inline-start: 1px solid var(--vp-c-divider);
}

.lesson-link {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  padding: 5px 6px;
  font-size: 12px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 8px;
  transition: color 0.18s, background-color 0.18s, border-color 0.18s;
}

.lesson-link:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.lesson-link.is-active {
  font-weight: 700;
  color: var(--lagune-text);
  background-color: color-mix(in srgb, var(--lagune) 14%, transparent);
  border-color: var(--lagune);
}

.here-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  margin-top: 5px;
  background: var(--peche);
  border-radius: 50%;
  opacity: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--peche) 20%, transparent);
}

.here-dot.is-visible {
  opacity: 1;
}

.lesson-number {
  flex-shrink: 0;
  min-width: 15px;
  margin-top: 1px;
  font-family: var(--vp-font-family-mono);
  font-size: 9.5px;
  color: var(--vp-c-text-3);
  text-align: center;
}

.lesson-link.is-active .lesson-number {
  color: var(--lagune-text);
}

.lesson-text {
  flex: 1;
  min-width: 0;
}

.sidebar-footnote {
  display: flex;
  gap: 5px;
  align-items: flex-start;
  padding: 8px 2px 0;
  margin: 8px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
}

.sidebar-footnote svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--nectarine-text);
}

.phase-enter-active,
.phase-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.phase-enter-from,
.phase-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.mobile-sidebar-toggle {
  display: none;
}

@media (max-width: 959px) {
  .mobile-sidebar-toggle {
    position: fixed;
    inset-block-end: max(16px, env(safe-area-inset-bottom));
    inset-inline-end: 16px;
    z-index: 70;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: #ffffff;
    cursor: pointer;
    background: var(--nectarine-strong);
    border: 2px solid var(--peche);
    border-radius: 14px;
    box-shadow: var(--neo-shadow);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .mobile-sidebar-toggle:hover {
    background: var(--accent-primary-strong);
    transform: translateY(-2px);
  }

  .mobile-sidebar-toggle:focus-visible {
    outline-color: var(--lagune-text);
    outline-offset: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .phase-chevron,
  .lesson-link,
  .phase-enter-active,
  .phase-leave-active,
  .mobile-sidebar-toggle {
    transition: none;
  }
}
</style>
