<template>
  <nav
    v-if="isLesson && (prevNav || nextNav)"
    class="lesson-nav"
    aria-label="التنقل بين الدروس"
  >
    <a
      v-if="prevNav"
      class="lesson-nav-card lesson-nav-card--prev"
      :href="prevNav.link"
    >
      <span class="lesson-nav-label">
        <ArrowRight :size="14" aria-hidden="true" />
        {{ prevNav.label }}
      </span>
      <span class="lesson-nav-title">{{ prevNav.text }}</span>
    </a>
    <span v-else class="lesson-nav-spacer" aria-hidden="true" />

    <a
      v-if="nextNav"
      class="lesson-nav-card lesson-nav-card--next"
      :href="nextNav.link"
    >
      <span class="lesson-nav-label">
        {{ nextNav.label }}
        <ArrowLeft :size="14" aria-hidden="true" />
      </span>
      <span class="lesson-nav-title">{{ nextNav.text }}</span>
    </a>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import sidebarData from '../../sidebar'

type LessonLink = {
  text: string
  link: string
}

type Phase = {
  id: string
  name: string
  lessons: LessonLink[]
}

type NavItem = {
  label: string
  text: string
  link: string
}

const { frontmatter } = useData()
const route = useRoute()

const phases: Phase[] = Object.entries(sidebarData as Record<string, Array<{
  text: string
  items?: LessonLink[]
}>>)
  .map(([key, sections]) => {
    const section = sections[0]
    if (!section) return null
    return {
      id: key.match(/\/phases\/(\d{2})\//)?.[1] ?? '',
      name: section.text,
      lessons: section.items ?? []
    }
  })
  .filter((phase): phase is Phase => phase !== null)
  .sort((a, b) => a.id.localeCompare(b.id))

const isLesson = computed(() => Boolean(frontmatter.value.phase))

function normalizePath(path: string): string {
  let value = String(path || '').split('#')[0].split('?')[0]
  if (value.endsWith('/index.html')) value = value.slice(0, -'index.html'.length)
  else if (value.endsWith('.html')) value = value.slice(0, -5)
  if (value.length > 1) value = value.replace(/\/$/, '')
  return value
}

function asLink(value: unknown): LessonLink | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>
  if (typeof item.link !== 'string') return null
  return {
    text: typeof item.text === 'string' ? item.text : item.link,
    link: item.link
  }
}

function cleanTitle(value: string): string {
  return value.replace(/^\d+\.\s*/, '')
}

const prev = computed(() => asLink(frontmatter.value.prev))
const next = computed(() => asLink(frontmatter.value.next))

const currentPhaseIndex = computed(() =>
  phases.findIndex((phase) => phase.id === String(frontmatter.value.phase || ''))
)
const currentPhase = computed(() => phases[currentPhaseIndex.value])
const currentPosition = computed(() => {
  const phase = currentPhase.value
  if (!phase) return -1
  return phase.lessons.findIndex(
    (lesson) => normalizePath(lesson.link) === normalizePath(route.path)
  )
})
const firstInPhase = computed(() => currentPosition.value === 0)
const lastInPhase = computed(() => {
  const phase = currentPhase.value
  return !!phase && currentPosition.value === phase.lessons.length - 1
})

const prevNav = computed<NavItem | null>(() => {
  if (firstInPhase.value) {
    const previousPhase = phases[currentPhaseIndex.value - 1]
    if (!previousPhase?.lessons[0]) return null
    return {
      label: 'المرحلة السابقة',
      text: previousPhase.name,
      link: previousPhase.lessons[0].link
    }
  }

  if (!prev.value) return null
  return {
    label: 'الدرس السابق',
    text: cleanTitle(prev.value.text),
    link: prev.value.link
  }
})

const nextNav = computed<NavItem | null>(() => {
  if (lastInPhase.value) {
    const nextPhase = phases[currentPhaseIndex.value + 1]
    if (!nextPhase?.lessons[0]) return null
    return {
      label: 'المرحلة التالية',
      text: nextPhase.name,
      link: nextPhase.lessons[0].link
    }
  }

  if (!next.value) return null
  return {
    label: 'الدرس التالي',
    text: cleanTitle(next.value.text),
    link: next.value.link
  }
})
</script>

<style scoped>
.lesson-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 2.75rem;
  border-top: 1px solid var(--vp-c-divider);
}

.lesson-nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem;
  text-decoration: none;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 20px;
  box-shadow: var(--neo-shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.lesson-nav-card:hover {
  border-color: var(--nectarine);
  box-shadow: var(--neo-shadow);
  transform: translateY(-2px);
}

.lesson-nav-card:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.lesson-nav-card--prev {
  align-items: flex-start;
  text-align: start;
}

.lesson-nav-card--next {
  align-items: flex-end;
  text-align: end;
}

.lesson-nav-label {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--lagune-text);
}

.lesson-nav-title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lesson-nav-spacer {
  display: block;
}

@media (max-width: 640px) {
  .lesson-nav {
    grid-template-columns: 1fr;
  }

  .lesson-nav-card--next {
    align-items: flex-start;
    text-align: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-nav-card {
    transition: none;
  }
}
</style>
