<template>
  <main class="roadmap-page">
    <header class="roadmap-hero">
      <span class="hero-eyebrow">
        <Compass :size="14" :stroke-width="2" aria-hidden="true" />
        خريطة المسار التعليمي
      </span>
      <h1 class="hero-title">من أول سطر بايثون إلى نظام ذكاء اصطناعي في الإنتاج</h1>
      <p class="hero-description">
        عشرون مرحلة متسلسلة و435 درسًا تطبيقيًا. ابدأ من الأساسيات، وابنِ النماذج
        بيدك، ثم انطلق إلى النماذج اللغوية والوكلاء الأذكياء والبنية التحتية.
      </p>

      <div class="hero-actions">
        <a class="button button-primary" href="/phases/00/01-dev-environment">
          ابدأ من المرحلة 00
          <ArrowLeft :size="16" aria-hidden="true" />
        </a>
        <a class="button button-secondary" href="#phases">
          استعرض المراحل
        </a>
      </div>

      <dl class="hero-stats">
        <div class="hero-stat">
          <dt>مرحلة</dt>
          <dd>{{ stats.totalPhases }}</dd>
        </div>
        <div class="hero-stat">
          <dt>درسًا</dt>
          <dd>{{ stats.totalLessons }}</dd>
        </div>
        <div class="hero-stat">
          <dt>ساعة تعلّم</dt>
          <dd>314</dd>
        </div>
        <div class="hero-stat">
          <dt>مسارات مقترحة</dt>
          <dd>{{ tracks.length }}</dd>
        </div>
      </dl>

      <div class="hero-progress" :class="{ 'is-complete': progress.percent === 100 }">
        <div class="hero-progress-head">
          <span class="hero-progress-label">تقدمك الكلي</span>
          <strong class="hero-progress-value">{{ progress.percent }}%</strong>
          <span class="hero-progress-count">{{ progress.completed }} / {{ progress.total }} درسًا</span>
        </div>
        <div
          class="hero-progress-track"
          role="progressbar"
          :aria-valuenow="progress.percent"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`تقدمك الكلي: ${progress.percent}%`"
        >
          <span class="hero-progress-fill" :style="{ width: `${progress.percent}%` }" />
        </div>
      </div>
    </header>

    <section id="tracks" class="roadmap-section" aria-labelledby="tracks-title">
      <div class="section-heading">
        <div>
          <span class="section-kicker">01 — اختر وجهتك</span>
          <h2 id="tracks-title" class="section-title">ثلاثة مسارات، وجهة واحدة</h2>
        </div>
        <p class="section-lead">
          المسار الكامل هو الافتراضي. إن كان لديك هدف محدد، اختر مسارًا مركّزًا
          وسنُبرز المراحل التي تحتاجها بالترتيب.
        </p>
      </div>

      <div class="track-grid">
        <button
          v-for="track in tracks"
          :key="track.id"
          type="button"
          class="track-card"
          :class="{ 'is-active': activeTrackId === track.id }"
          :style="{ '--track-accent': track.accent }"
          :aria-pressed="activeTrackId === track.id"
          @click="selectTrack(track.id)"
        >
          <span class="track-icon" aria-hidden="true">
            <component :is="track.icon" :size="22" :stroke-width="1.8" />
          </span>
          <span class="track-heading">
            <span class="track-title">{{ track.title }}</span>
            <span class="track-en">{{ track.en }}</span>
          </span>
          <span class="track-description">{{ track.description }}</span>
          <span class="track-meta">
            {{ phaseCountLabel(track.phases.length) }} ·
            {{ lessonCountLabel(lessonCountFor(track.phases)) }} ·
            {{ trackProgressMap[track.id].percent }}%
          </span>
          <span class="track-progress" aria-hidden="true">
            <span
              class="track-progress-fill"
              :style="{ width: `${trackProgressMap[track.id].percent}%` }"
            />
          </span>
          <span v-if="activeTrackId === track.id" class="track-selected">
            <Check :size="13" aria-hidden="true" />
            المسار المختار
          </span>
        </button>
      </div>
    </section>

    <section id="phases" class="roadmap-section" aria-labelledby="phases-title">
      <div class="section-heading phases-heading">
        <div>
          <span class="section-kicker">02 — تتبّع الخطة</span>
          <h2 id="phases-title" class="section-title">{{ activeTrack.title }}</h2>
          <p class="section-lead">{{ activeTrack.description }}</p>
        </div>
        <span class="result-count" aria-live="polite">
          {{ phaseCountLabel(visiblePhases.length) }} · {{ lessonCountLabel(visibleLessonCount) }}
        </span>
      </div>

      <div class="stage-filter" role="group" aria-label="تصفية المراحل حسب المجموعة">
        <button
          type="button"
          class="stage-chip"
          :class="{ 'is-active': activeStageId === 'all' }"
          :aria-pressed="activeStageId === 'all'"
          @click="selectStage('all')"
        >
          كل المراحل
          <span class="stage-chip-count">{{ activeTrack.phases.length }}</span>
        </button>
        <button
          v-for="stage in stages"
          :key="stage.id"
          type="button"
          class="stage-chip"
          :class="{ 'is-active': activeStageId === stage.id }"
          :disabled="stageCount(stage) === 0"
          :aria-pressed="activeStageId === stage.id"
          @click="selectStage(stage.id)"
        >
          {{ stage.title }}
          <span class="stage-chip-count">{{ stageCount(stage) }}</span>
        </button>
      </div>

      <div
        v-for="group in visibleGroups"
        :key="group.id"
        class="phase-group"
        :style="{ '--stage-accent': group.accent, '--stage-text': group.text }"
      >
        <div class="group-heading">
          <h3 class="group-title">{{ group.title }}</h3>
          <span class="group-meta">
            {{ phaseCountLabel(group.phases.length) }} ·
            {{ lessonCountLabel(lessonCountFor(group.phases.map((phase) => phase.id))) }}
          </span>
        </div>

        <ol class="phase-grid">
          <li v-for="phase in group.phases" :key="phase.id" class="phase-item">
            <a class="phase-card" :href="phaseLink(phase)">
              <span class="phase-top">
                <span class="phase-number">{{ phase.id }}</span>
                <span
                  class="phase-count"
                  :title="`${phaseProgress(phase.id).completed} من ${phase.lessonCount} درسًا مكتمل`"
                >
                  {{ phaseProgress(phase.id).completed }} / {{ phase.lessonCount }}
                </span>
                <span class="phase-icon" aria-hidden="true">
                  <component :is="iconFor(phase.id)" :size="18" :stroke-width="1.8" />
                </span>
              </span>

              <span class="phase-title">{{ phase.nameAr }}</span>
              <span class="phase-en">{{ phase.name }}</span>
              <span class="phase-description">{{ phase.descriptionAr }}</span>

              <span
                class="phase-progress"
                role="progressbar"
                :aria-valuenow="phaseProgress(phase.id).percent"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="`تقدم المرحلة ${phase.id}: ${phaseProgress(phase.id).percent}%`"
              >
                <span
                  class="phase-progress-fill"
                  :style="{ width: `${phaseProgress(phase.id).percent}%` }"
                />
              </span>

              <span class="phase-start">
                <span class="phase-start-copy">
                  <span class="phase-start-label">ابدأ بـ</span>
                  <span class="phase-start-title">{{ phase.firstLessonTitleAr }}</span>
                </span>
                <ArrowLeft class="phase-start-arrow" :size="15" aria-hidden="true" />
              </span>
            </a>
          </li>
        </ol>
      </div>

      <p v-if="visibleGroups.length === 0" class="empty-state">
        لا توجد مراحل مطابقة لهذا المسار وهذه المجموعة. جرّب اختيار «كل المراحل».
      </p>
    </section>

    <section class="roadmap-cta" aria-labelledby="cta-title">
      <div>
        <span class="section-kicker">03 — ابدأ الآن</span>
        <h2 id="cta-title" class="cta-title">الخطوة الأولى لا تحتاج إلى استعداد كامل</h2>
        <p class="cta-description">
          ابدأ بتهيئة بيئتك، ثم تابع المراحل بالترتيب. كل مرحلة تبني على ما قبلها،
          وكل درس ينتهي بتطبيق يمكنك إضافته إلى مشروعك.
        </p>
      </div>
      <div class="cta-actions">
        <a class="button button-primary" href="/phases/00/01-dev-environment">
          ابدأ المرحلة 00
          <ArrowLeft :size="16" aria-hidden="true" />
        </a>
        <a class="button button-secondary" href="/phases/19/01-terminal-native-coding-agent">
          شاهد المشروع الختامي
        </a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Component } from 'vue'
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Brain,
  Check,
  Compass,
  Eye,
  Image as ImageIcon,
  Layers,
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
  Zap
} from 'lucide-vue-next'
import summaryData from '../curriculum-summary.json'
import { useProgress, type PhaseProgress } from '../progress'

type Phase = {
  id: string
  name: string
  nameAr: string
  descriptionAr: string
  lessonCount: number
  firstLessonSlug: string
  firstLessonTitleAr: string
}

type Stage = {
  id: string
  title: string
  accent: string
  text: string
  phases: string[]
}

type Track = {
  id: string
  title: string
  en: string
  description: string
  accent: string
  icon: Component
  phases: string[]
}

const stats = summaryData.stats
const phases = summaryData.phases as Phase[]
const phaseById = new Map(phases.map((phase) => [phase.id, phase]))

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

const stages: Stage[] = [
  {
    id: 'foundations',
    title: 'التأسيس',
    accent: 'var(--nectarine)',
    text: 'var(--nectarine-text)',
    phases: ['00', '01', '02', '03']
  },
  {
    id: 'models',
    title: 'النماذج والوسائط',
    accent: 'var(--peche)',
    text: 'var(--peche-text)',
    phases: ['04', '05', '06', '07', '08', '09', '10']
  },
  {
    id: 'engineering',
    title: 'الهندسة والوكلاء',
    accent: 'var(--menthe)',
    text: 'var(--menthe-text)',
    phases: ['11', '12', '13', '14', '15', '16']
  },
  {
    id: 'production',
    title: 'الإنتاج والمسؤولية',
    accent: 'var(--lagune)',
    text: 'var(--lagune-text)',
    phases: ['17', '18', '19']
  }
]

const tracks: Track[] = [
  {
    id: 'full',
    title: 'المسار الكامل',
    en: 'Full Track',
    description: 'المنهج كاملًا بالترتيب، من إعداد البيئة إلى المشاريع الختامية.',
    accent: 'var(--nectarine)',
    icon: Compass,
    phases: phases.map((phase) => phase.id)
  },
  {
    id: 'llm',
    title: 'هندسة النماذج والوكلاء',
    en: 'LLM & Agents',
    description: 'الطريق الأسرع لفهم المحولات وبناء النماذج اللغوية والوكلاء الأذكياء.',
    accent: 'var(--menthe)',
    icon: Bot,
    phases: ['00', '01', '07', '10', '11', '13', '14', '16']
  },
  {
    id: 'vision',
    title: 'الرؤية والوسائط المتعددة',
    en: 'Vision & Multimodal',
    description: 'من أساسيات التعلم العميق إلى الرؤية الحاسوبية والنماذج متعددة الوسائط.',
    accent: 'var(--lagune)',
    icon: Eye,
    phases: ['00', '01', '03', '04', '08', '12']
  }
]

const activeTrackId = ref('full')
const activeStageId = ref('all')
const { progress } = useProgress()

const activeTrack = computed(
  () => tracks.find((track) => track.id === activeTrackId.value) ?? tracks[0]
)

const activeTrackPhases = computed(() => new Set(activeTrack.value.phases))

const filteredPhases = computed(() =>
  phases.filter((phase) => activeTrackPhases.value.has(phase.id))
)

const visiblePhases = computed(() => {
  if (activeStageId.value === 'all') return filteredPhases.value
  const stage = stages.find((item) => item.id === activeStageId.value)
  if (!stage) return filteredPhases.value
  return filteredPhases.value.filter((phase) => stage.phases.includes(phase.id))
})

const visibleGroups = computed(() =>
  stages
    .map((stage) => ({
      ...stage,
      phases: visiblePhases.value.filter((phase) => stage.phases.includes(phase.id))
    }))
    .filter((stage) => stage.phases.length > 0)
)

const visibleLessonCount = computed(() =>
  visiblePhases.value.reduce((total, phase) => total + phase.lessonCount, 0)
)

function lessonCountFor(ids: string[]): number {
  return ids.reduce((total, id) => total + (phaseById.get(id)?.lessonCount ?? 0), 0)
}

function phaseCountLabel(count: number): string {
  if (count === 1) return 'مرحلة واحدة'
  if (count === 2) return 'مرحلتان'
  if (count >= 3 && count <= 10) return `${count} مراحل`
  return `${count} مرحلة`
}

function lessonCountLabel(count: number): string {
  if (count === 1) return 'درس واحد'
  if (count === 2) return 'درسان'
  if (count >= 3 && count <= 10) return `${count} دروس`
  return `${count} درسًا`
}

function phaseProgress(id: string): PhaseProgress {
  return (
    progress.value.phases[id] ?? {
      id,
      completed: 0,
      total: phaseById.get(id)?.lessonCount ?? 0,
      percent: 0
    }
  )
}

function trackProgress(ids: string[]): Pick<PhaseProgress, 'completed' | 'total' | 'percent'> {
  const total = lessonCountFor(ids)
  const completed = ids.reduce(
    (sum, id) => sum + Math.min(phaseProgress(id).completed, phaseById.get(id)?.lessonCount ?? 0),
    0
  )
  return {
    completed,
    total,
    percent:
      total <= 0
        ? 0
        : completed >= total
          ? 100
          : Math.max(completed ? 1 : 0, Math.floor((completed / total) * 100))
  }
}

const trackProgressMap = computed(() =>
  Object.fromEntries(tracks.map((track) => [track.id, trackProgress(track.phases)])) as Record<
    string,
    Pick<PhaseProgress, 'completed' | 'total' | 'percent'>
  >
)

function stageCount(stage: Stage): number {
  return stage.phases.filter((id) => activeTrackPhases.value.has(id)).length
}

function iconFor(id: string): Component {
  return phaseIcons[id] ?? Layers
}

function phaseLink(phase: Phase): string {
  return `/phases/${phase.id}/${phase.firstLessonSlug}`
}

function selectTrack(id: string): void {
  activeTrackId.value = id
  if (activeStageId.value !== 'all') {
    const stage = stages.find((item) => item.id === activeStageId.value)
    if (!stage || stageCount(stage) === 0) activeStageId.value = 'all'
  }
}

function selectStage(id: string): void {
  if (id !== 'all') {
    const stage = stages.find((item) => item.id === id)
    if (!stage || stageCount(stage) === 0) return
  }
  activeStageId.value = id
}
</script>

<style scoped>
.roadmap-page {
  width: 100%;
  max-width: 1180px;
  padding: 2.5rem 1.5rem 4.5rem;
  margin: 0 auto;
  color: var(--vp-c-text-1);
}

.roadmap-hero {
  max-width: 900px;
  margin: 0 auto 3.25rem;
  text-align: center;
}

.hero-eyebrow {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.35rem 0.8rem;
  margin-bottom: 1rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 14%, transparent);
  border: 2px solid var(--lagune);
  border-radius: 999px;
}

.hero-title {
  margin: 0 0 1rem;
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.01em;
}

.hero-description {
  max-width: 760px;
  margin: 0 auto;
  font-size: clamp(0.95rem, 1.4vw, 1.05rem);
  line-height: 1.9;
  color: var(--vp-c-text-2);
}

.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.hero-actions {
  margin-top: 1.6rem;
}

.button {
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1.2rem;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.4;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease,
    box-shadow 0.3s ease;
}

.button-primary {
  color: #ffffff;
  background: var(--nectarine-strong);
  border-color: var(--nectarine);
  box-shadow: var(--neo-shadow-sm);
}

.button-primary:hover {
  background: var(--accent-primary-strong);
  border-color: var(--nectarine-strong);
  transform: translateY(-1px);
}

.button-secondary {
  color: var(--peche-text);
  background: transparent;
  border-color: var(--peche);
  box-shadow: var(--neo-shadow-sm);
}

.button-secondary:hover {
  color: var(--peche-text);
  background: color-mix(in srgb, var(--peche) 13%, transparent);
  border-color: var(--peche-text);
  transform: translateY(-1px);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
  max-width: 780px;
  padding: 1rem;
  margin: 2.2rem auto 0;
  background: var(--bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
}

.hero-stat {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.15rem;
  align-items: center;
  padding: 0.45rem 0.3rem;
  background: transparent;
  border: 2px solid var(--vp-c-divider);
  border-radius: 14px;
}

.hero-stat:nth-child(1) {
  border-color: var(--nectarine);
}

.hero-stat:nth-child(2) {
  border-color: var(--peche);
}

.hero-stat:nth-child(3) {
  border-color: var(--menthe);
}

.hero-stat:nth-child(4) {
  border-color: var(--lagune);
}

.hero-stat dd {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: clamp(1.25rem, 2.2vw, 1.65rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--nectarine-text);
}

.hero-stat dt {
  margin: 0;
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
}

.hero-progress {
  max-width: 780px;
  padding: 0.85rem 1rem;
  margin: 0.75rem auto 0;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 14px;
  box-shadow: var(--neo-shadow-sm);
}

.hero-progress.is-complete {
  border-color: var(--menthe);
}

.hero-progress-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.6rem;
  align-items: baseline;
}

.hero-progress-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--lagune-text);
}

.hero-progress-value {
  font-family: var(--vp-font-family-mono);
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1;
  color: var(--nectarine-text);
}

.hero-progress.is-complete .hero-progress-value {
  color: var(--menthe-text);
}

.hero-progress-count {
  margin-inline-start: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.66rem;
  color: var(--vp-c-text-3);
}

.hero-progress-track {
  height: 8px;
  padding: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.hero-progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--peche), var(--nectarine));
  border-radius: inherit;
  transition: width 0.35s ease;
}

.roadmap-section {
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.section-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-kicker {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--lagune-text);
  letter-spacing: 0.03em;
}

.section-title {
  margin: 0;
  font-size: clamp(1.45rem, 2.6vw, 2rem);
  font-weight: 800;
  line-height: 1.4;
}

.section-lead {
  max-width: 620px;
  margin: 0.45rem 0 0;
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.phases-heading {
  align-items: center;
}

.result-count {
  flex: none;
  padding: 0.45rem 0.8rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--lagune-text);
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.track-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.track-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 1.25rem;
  font-family: inherit;
  color: var(--vp-c-text-1);
  text-align: start;
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--track-accent);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease,
    background-color 0.3s ease;
}

.track-card:hover:not(.is-active) {
  border-color: var(--track-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-3px);
}

.track-card.is-active {
  background: color-mix(in srgb, var(--track-accent) 9%, var(--bg));
  border-color: var(--track-accent);
  box-shadow: var(--neo-inset-sm);
}

.track-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--track-accent);
  background: color-mix(in srgb, var(--track-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--track-accent) 55%, transparent);
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
}

.track-heading {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.track-title {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.45;
}

.track-en {
  font-family: var(--vp-font-family-mono);
  font-size: 0.66rem;
  color: var(--vp-c-text-3);
  letter-spacing: 0.02em;
}

.track-description {
  flex: 1;
  font-size: 0.84rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.track-meta {
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.track-progress {
  display: block;
  width: 100%;
  height: 7px;
  padding: 2px;
  margin-top: 0.1rem;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.track-progress-fill {
  display: block;
  height: 100%;
  background: var(--track-accent);
  border-radius: inherit;
  transition: width 0.35s ease;
}

.track-selected {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  padding: 0.25rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--track-accent) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--track-accent) 48%, transparent);
  border-radius: 999px;
}

.stage-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.stage-chip {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.45rem 0.75rem;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-radius: 999px;
  box-shadow: var(--neo-shadow-sm);
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.stage-chip:hover:not(:disabled):not(.is-active) {
  color: var(--vp-c-text-1);
  border-color: var(--lagune);
}

.stage-chip.is-active {
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 16%, transparent);
  border-color: var(--lagune);
  box-shadow: var(--neo-inset-sm);
}

.stage-chip:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.stage-chip-count {
  display: inline-grid;
  place-items: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.3rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.66rem;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 14%, transparent);
  border-radius: 999px;
}

.phase-group {
  padding-top: 1.4rem;
}

.group-heading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.9rem;
  align-items: baseline;
  padding-inline-start: 0.75rem;
  margin-bottom: 0.9rem;
  border-inline-start: 4px solid var(--stage-accent);
}

.group-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}

.group-meta {
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

.phase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.phase-item {
  display: flex;
}

.phase-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.15rem 1.2rem 1rem;
  color: var(--vp-c-text-1);
  text-decoration: none;
  background: var(--bg);
  border: 2px solid var(--stage-accent);
  border-top-width: 4px;
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.phase-card:hover {
  border-color: var(--stage-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-3px);
}

.phase-top {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.35rem;
}

.phase-number {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  height: 22px;
  padding: 0 0.4rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border: 1px solid var(--lagune);
  border-radius: 999px;
}

.phase-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-inline-start: auto;
  color: var(--stage-accent);
  background: color-mix(in srgb, var(--stage-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--stage-accent) 55%, transparent);
  border-radius: 9px;
  box-shadow: var(--neo-inset-sm);
}

.phase-count {
  padding: 0.2rem 0.45rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--lagune) 35%, transparent);
  border-radius: 6px;
}

.phase-title {
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.5;
}

.phase-en {
  font-family: var(--vp-font-family-mono);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
}

.phase-description {
  flex: 1;
  margin-top: 0.2rem;
  font-size: 0.82rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.phase-progress {
  display: block;
  height: 6px;
  padding: 2px;
  margin-top: 0.45rem;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.phase-progress-fill {
  display: block;
  height: 100%;
  background: var(--stage-accent);
  border-radius: inherit;
  transition: width 0.35s ease;
}

.phase-start {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  padding-top: 0.75rem;
  margin-top: 0.6rem;
  border-top: 1px solid var(--vp-c-divider);
}

.phase-start-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.12rem;
  min-width: 0;
}

.phase-start-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--stage-text, var(--vp-c-text-2));
}

.phase-start-title {
  overflow: hidden;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.phase-start-arrow {
  flex: none;
  color: var(--stage-accent);
  transition: transform 0.2s ease;
}

.phase-card:hover .phase-start-arrow {
  transform: translateX(-3px);
}

.empty-state {
  padding: 1.5rem;
  margin: 1rem 0 0;
  color: var(--vp-c-text-2);
  text-align: center;
  background: var(--bg);
  border: 2px dashed var(--lagune);
  border-radius: 14px;
  box-shadow: var(--neo-inset-sm);
}

.roadmap-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 2rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.6rem;
  margin-top: 2.5rem;
  background: var(--bg);
  border: 2px solid var(--peche);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
}

.cta-title {
  margin: 0;
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  font-weight: 800;
  line-height: 1.45;
}

.cta-description {
  max-width: 640px;
  margin: 0.45rem 0 0;
  font-size: 0.86rem;
  line-height: 1.8;
  color: var(--vp-c-text-2);
}

.button:focus-visible,
.track-card:focus-visible,
.stage-chip:focus-visible,
.phase-card:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .track-grid {
    grid-template-columns: 1fr;
  }

  .phase-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .roadmap-page {
    padding: 1.75rem 1rem 3rem;
  }

  .roadmap-hero {
    margin-bottom: 2.5rem;
  }

  .hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-heading {
    align-items: flex-start;
  }

  .result-count {
    flex: none;
  }

  .roadmap-cta {
    padding: 1.25rem;
  }

  .cta-actions {
    width: 100%;
    justify-content: stretch;
  }

  .cta-actions .button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .button,
  .track-card,
  .stage-chip,
  .phase-card,
  .phase-start-arrow,
  .track-progress-fill,
  .phase-progress-fill,
  .hero-progress-fill {
    transition: none;
  }
}
</style>
