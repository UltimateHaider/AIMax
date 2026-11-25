<template>
  <section class="home-stats">
    <div class="section-inner">
      <ul class="stats-grid">
        <li
          v-for="stat in stats"
          :key="stat.label"
          class="stat-card"
          :style="{ '--stat-accent': stat.accent }"
        >
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
          <span class="stat-icon" aria-hidden="true">
            <component :is="stat.icon" :size="22" :stroke-width="1.8" />
          </span>
        </li>
      </ul>

      <div v-if="mounted" class="stats-progress" :class="{ 'is-complete': progress.percent === 100 }">
        <div class="stats-progress-head">
          <div class="stats-progress-title">
            <span class="stats-progress-eyebrow">تقدمك في المسار</span>
            <strong class="stats-progress-value">{{ progress.percent }}%</strong>
          </div>
          <span class="stats-progress-count">
            {{ progress.completed }} / {{ progress.total }} درسًا
          </span>
        </div>

        <div
          class="stats-progress-track"
          role="progressbar"
          :aria-valuenow="progress.percent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`تقدمك الكلي: ${progress.percent}%`"
        >
          <span class="stats-progress-fill" :style="{ width: `${progress.percent}%` }" />
        </div>

        <div class="stats-progress-footer">
          <span>{{ progressMessage }}</span>
          <a class="stats-progress-link" :href="progressLink">
            {{ progressLinkLabel }}
            <ArrowLeft :size="14" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import { ArrowLeft, BookOpen, CheckCircle, Code, LayoutGrid } from 'lucide-vue-next'
import summaryData from '../curriculum-summary.json'
import { useProgress } from '../progress'

type Stat = {
  value: number
  label: string
  icon: Component
  accent: string
}

const s = summaryData.stats || {
  totalPhases: 20,
  totalLessons: 435,
  totalQuizzes: 240,
  totalCode: 433
}

const stats: Stat[] = [
  { value: s.totalPhases, label: 'مرحلة', icon: LayoutGrid, accent: 'var(--nectarine)' },
  { value: s.totalLessons, label: 'درسًا', icon: BookOpen, accent: 'var(--peche)' },
  { value: s.totalQuizzes, label: 'اختبارًا', icon: CheckCircle, accent: 'var(--menthe)' },
  { value: s.totalCode, label: 'درسًا بكود', icon: Code, accent: 'var(--lagune)' }
]

const { progress } = useProgress()
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

const completedLabel = computed(() => {
  const count = progress.value.completed
  if (count === 1) return 'درسًا واحدًا'
  if (count === 2) return 'درسين'
  if (count >= 3 && count <= 10) return `${count} دروس`
  return `${count} درسًا`
})

const progressMessage = computed(() => {
  if (progress.value.percent === 100) return 'أكملت المسار بالكامل. مذهل!'
  if (progress.value.completed === 0) return 'لم تبدأ بعد — أول درس ينتظرك.'
  return `أكملت ${completedLabel.value}. واصل التقدم.`
})

const progressLink = computed(() =>
  progress.value.completed === 0 ? '/phases/00/01-dev-environment' : '/roadmap'
)

const progressLinkLabel = computed(() =>
  progress.value.completed === 0 ? 'ابدأ أول درس' : 'تابع من الخريطة'
)
</script>

<style scoped>
.home-stats {
  position: relative;
  z-index: 2;
  padding: 0 1.5rem 3.5rem;
  margin-top: -2rem;
}

.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.stats-progress {
  padding: 1.15rem 1.25rem;
  margin-top: 1rem;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: var(--theme-transition);
}

.stats-progress.is-complete {
  border-color: var(--menthe);
}

.stats-progress-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1rem;
  align-items: flex-end;
  justify-content: space-between;
}

.stats-progress-title {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.65rem;
  align-items: baseline;
}

.stats-progress-eyebrow {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--lagune-text);
}

.stats-progress-value {
  font-family: var(--vp-font-family-mono);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1;
  color: var(--nectarine-text);
}

.stats-progress.is-complete .stats-progress-value {
  color: var(--menthe-text);
}

.stats-progress-count {
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.stats-progress-track {
  height: 10px;
  padding: 2px;
  margin-top: 0.75rem;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.stats-progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--peche), var(--nectarine));
  border-radius: inherit;
  transition: width 0.35s ease;
}

.stats-progress-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.stats-progress-link {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  font-weight: 700;
  color: var(--lagune-text);
  text-decoration: none;
}

.stats-progress-link:hover {
  color: var(--nectarine-text);
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}

.stats-progress-link:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
  border-radius: 4px;
}

.stat-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 20px;
  overflow: hidden;
  background: var(--bg);
  border: 2px solid var(--stat-accent);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  border-color: var(--stat-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-4px);
}

.stat-value {
  font-size: clamp(2rem, 3vw, 2.45rem);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--vp-c-text-1);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.stat-icon {
  position: absolute;
  inset-block-start: 1.05rem;
  inset-inline-end: 1.05rem;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: var(--stat-accent);
  background: color-mix(in srgb, var(--stat-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--stat-accent) 55%, transparent);
  border-radius: 11px;
  box-shadow: var(--neo-inset-sm);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-stats {
    padding-inline: 1rem;
    margin-top: -1.25rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-progress {
    padding: 1rem;
  }

  .stats-progress-head {
    align-items: flex-start;
  }

  .stats-progress-footer {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stats-progress-fill {
    transition: none;
  }
}
</style>
