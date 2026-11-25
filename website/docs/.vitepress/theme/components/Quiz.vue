<template>
  <section v-if="enabled" class="lesson-quiz" aria-labelledby="lesson-quiz-title">
    <header class="quiz-header">
      <div>
        <span class="quiz-eyebrow">تقييم سريع</span>
        <h2 id="lesson-quiz-title" class="quiz-title">اختبر فهمك</h2>
      </div>
      <span v-if="!loading && !error && total" class="quiz-counter" dir="ltr">
        {{ finished ? total : current + 1 }} / {{ total }}
      </span>
    </header>

    <template v-if="!finished">
      <p v-if="!loading && !error && total" class="quiz-hint">
        اختر إجابة لكل سؤال لترى التصحيح والشرح فورًا.
      </p>
      <p
        v-if="!loading && !error && total && bestScore !== null"
        class="quiz-hint quiz-hint--best"
      >
        أفضل نتيجة سابقة:
        <span dir="ltr">{{ Math.min(bestScore, total) }} / {{ total }}</span>
        <template v-if="attemptCount"> · {{ attemptCount }} محاولة</template>
      </p>

      <div
        v-if="!loading && !error && total"
        class="quiz-progress"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="تقدم الاختبار"
      >
        <span class="quiz-progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <p v-if="loading" class="quiz-status" aria-live="polite">جارٍ تحميل الاختبار…</p>
      <p v-else-if="error" class="quiz-status quiz-status--error" aria-live="polite">
        {{ error }}
      </p>
      <p v-else-if="!total" class="quiz-status" aria-live="polite">
        لا توجد أسئلة متاحة لهذا الدرس.
      </p>

      <div v-else-if="question" class="quiz-question">
        <p ref="questionText" class="quiz-question-text" dir="auto" tabindex="-1">
          {{ question.question }}
        </p>

        <fieldset class="quiz-options">
          <legend class="visually-hidden">اختر إجابة</legend>
          <label
            v-for="(option, index) in question.options"
            :key="index"
            class="quiz-option"
            :class="optionClass(index)"
          >
            <input
              type="radio"
              :name="quizName"
              :value="index"
              :checked="selected === index"
              :disabled="answered"
              @change="selectOption(index)"
            />
            <span class="quiz-option-letter" aria-hidden="true">{{ letters[index] }}</span>
            <span class="quiz-option-text" dir="auto">{{ option }}</span>
            <CheckCircle
              v-if="answered && index === question.correct"
              class="quiz-option-icon quiz-option-icon--correct"
              :size="17"
              aria-hidden="true"
            />
            <XCircle
              v-else-if="answered && index === selected"
              class="quiz-option-icon quiz-option-icon--wrong"
              :size="17"
              aria-hidden="true"
            />
          </label>
        </fieldset>

        <div
          v-if="answered"
          class="quiz-feedback"
          :class="isCorrect ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'"
          aria-live="polite"
        >
          <p class="quiz-feedback-title">
            {{ isCorrect ? 'إجابة صحيحة!' : 'إجابة غير صحيحة' }}
          </p>
          <p v-if="question.explanation" class="quiz-explanation" dir="auto">
            {{ question.explanation }}
          </p>
          <p v-else class="quiz-explanation" dir="auto">
            الإجابة الصحيحة: {{ question.options[question.correct] }}
          </p>
          <button type="button" class="quiz-next" @click="nextQuestion">
            {{ current === total - 1 ? 'عرض النتيجة' : 'السؤال التالي' }}
            <ArrowLeft :size="15" aria-hidden="true" />
          </button>
        </div>
      </div>
    </template>

    <div v-else class="quiz-result" aria-live="polite">
      <div class="quiz-score" dir="ltr">{{ score }} <span>/ {{ total }}</span></div>
      <h3 class="quiz-result-title">{{ resultTitle }}</h3>
      <p class="quiz-result-message">{{ resultMessage }}</p>

      <div class="quiz-result-stats">
        <p v-if="bestScore !== null" class="quiz-best">
          أفضل نتيجة:
          <span dir="ltr">{{ Math.min(bestScore, total) }} / {{ total }}</span>
        </p>
        <p v-if="attemptCount" class="quiz-best">
          عدد المحاولات:
          <span dir="ltr">{{ attemptCount }}</span>
        </p>
      </div>

      <div class="quiz-result-actions">
        <button type="button" class="quiz-retry" @click="retry">
          إعادة المحاولة
        </button>
        <button
          type="button"
          class="quiz-review-toggle"
          :aria-expanded="reviewing"
          @click="reviewing = !reviewing"
        >
          {{ reviewing ? 'إخفاء المراجعة' : 'مراجعة الإجابات' }}
        </button>
      </div>

      <p v-if="lessonCompleted" class="quiz-lesson-complete">
        <CheckCircle :size="15" aria-hidden="true" />
        تم إتمام هذا الدرس
      </p>
      <button
        v-else-if="passed"
        type="button"
        class="quiz-complete"
        @click="markLessonComplete"
      >
        <CheckCircle :size="15" aria-hidden="true" />
        علّم الدرس كمكتمل
      </button>

      <div v-if="reviewing" class="quiz-review">
        <h4 class="quiz-review-title">مراجعة الإجابات</h4>
        <ol class="quiz-review-list">
          <li
            v-for="(answer, index) in answers"
            :key="answer.questionIndex"
            class="quiz-review-item"
            :class="answer.correct ? 'is-correct' : 'is-wrong'"
          >
            <div class="quiz-review-head">
              <span class="quiz-review-number">{{ index + 1 }}</span>
              <span class="quiz-review-question" dir="auto">
                {{ questionAt(answer.questionIndex)?.question }}
              </span>
              <CheckCircle
                v-if="answer.correct"
                class="quiz-review-icon"
                :size="16"
                aria-hidden="true"
              />
              <XCircle v-else class="quiz-review-icon" :size="16" aria-hidden="true" />
            </div>

            <p class="quiz-review-answer">
              إجابتك:
              <strong dir="auto">{{ optionAt(answer.questionIndex, answer.selected) }}</strong>
            </p>
            <p v-if="!answer.correct" class="quiz-review-answer">
              الإجابة الصحيحة:
              <strong dir="auto">{{ correctOptionAt(answer.questionIndex) }}</strong>
            </p>
            <p v-if="explanationAt(answer.questionIndex)" class="quiz-review-explanation" dir="auto">
              {{ explanationAt(answer.questionIndex) }}
            </p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { withBase } from 'vitepress'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-vue-next'
import { isLessonCompleted, setLessonCompleted } from '../progress'

type QuizQuestion = {
  question: string
  options: string[]
  correct: number
  explanation: string
}

type QuizAnswer = {
  questionIndex: number
  selected: number
  correct: boolean
}

type QuizStats = {
  best: number | null
  attempts: number
}

type RawQuestion = {
  question?: unknown
  options?: unknown
  correct?: unknown
  answer?: unknown
  explanation?: unknown
  reason?: unknown
}

const { frontmatter } = useData()

const phaseId = computed(() => String(frontmatter.value.phase || ''))
const lessonId = computed(() => String(frontmatter.value.lessonId || ''))
const enabled = computed(
  () => Boolean(frontmatter.value.hasQuiz) && Boolean(phaseId.value) && Boolean(lessonId.value)
)
const quizName = computed(() => `quiz-${phaseId.value}-${lessonId.value}`)
const storageKey = computed(() => `quiz_${phaseId.value}_${lessonId.value}`)
const letters = ['A', 'B', 'C', 'D']

const questions = ref<QuizQuestion[]>([])
const loading = ref(true)
const error = ref('')
const current = ref(0)
const selected = ref<number | null>(null)
const answered = ref(false)
const score = ref(0)
const finished = ref(false)
const bestScore = ref<number | null>(null)
const attemptCount = ref(0)
const answers = ref<QuizAnswer[]>([])
const reviewing = ref(false)
const lessonCompleted = ref(false)
const questionText = ref<HTMLElement | null>(null)

let controller: AbortController | null = null

const total = computed(() => questions.value.length)
const question = computed(() => questions.value[current.value])
const isCorrect = computed(
  () => selected.value !== null && selected.value === question.value?.correct
)
const passed = computed(
  () => total.value > 0 && score.value >= Math.ceil(total.value * 0.6)
)
const progress = computed(() =>
  total.value ? Math.round(((finished.value ? total.value : current.value + 1) / total.value) * 100) : 0
)
const resultTitle = computed(() => {
  if (score.value === total.value) return 'أحسنت! 🎉'
  if (score.value >= Math.ceil(total.value * 0.6)) return 'نتيجة جيدة'
  return 'لا بأس، حاول مرة أخرى'
})
const resultMessage = computed(() => {
  if (score.value === total.value) return 'ممتاز! أتقنت هذا الدرس بالكامل.'
  if (score.value >= Math.ceil(total.value * 0.6)) return 'خطوة جيدة، راجع الشرح وحاول تحسين نتيجتك.'
  return 'راجع محتوى الدرس ثم أعد المحاولة، ستتحسن نتيجتك.'
})

function normalizeCorrect(value: unknown, options: string[]): number {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value >= 0 && value < options.length ? value : 0
  }

  if (typeof value === 'string') {
    const cleaned = value.trim()
    if (/^[A-Da-d]$/.test(cleaned)) {
      return cleaned.toUpperCase().charCodeAt(0) - 65
    }
    const numeric = Number(cleaned)
    if (Number.isInteger(numeric) && numeric >= 0 && numeric < options.length) {
      return numeric
    }
    const byText = options.findIndex((option) => option === value)
    if (byText >= 0) return byText
  }

  return 0
}

function normalizeQuestions(raw: unknown): QuizQuestion[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { questions?: unknown }).questions)
      ? (raw as { questions: RawQuestion[] }).questions
      : []

  return list
    .map((item) => {
      const record = item as RawQuestion
      const options = Array.isArray(record.options) ? record.options.map(String) : []
      return {
        question: String(record.question || ''),
        options,
        correct: normalizeCorrect(record.correct ?? record.answer, options),
        explanation: String(record.explanation || record.reason || '')
      }
    })
    .filter((item) => item.question.length > 0 && item.options.length >= 2)
}

function readStats(): QuizStats {
  if (typeof window === 'undefined') return { best: null, attempts: 0 }

  let raw = ''
  try {
    raw = window.localStorage.getItem(storageKey.value) ?? ''
    if (!raw) return { best: null, attempts: 0 }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      const numeric = Number(raw)
      return Number.isFinite(numeric)
        ? { best: numeric, attempts: 0 }
        : { best: null, attempts: 0 }
    }

    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      return { best: parsed, attempts: 0 }
    }

    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>
      const best = Number(record.best)
      const attempts = Number(record.attempts)
      return {
        best: Number.isFinite(best) ? best : null,
        attempts: Number.isFinite(attempts) ? Math.max(0, Math.round(attempts)) : 0
      }
    }
  } catch {
    // Storage may be unavailable; the quiz still works without stats.
  }

  return { best: null, attempts: 0 }
}

function saveStats(value: number): void {
  if (typeof window === 'undefined') return

  const previous = readStats()
  const best = Math.max(previous.best ?? 0, value)
  const attempts = previous.attempts + 1

  bestScore.value = best
  attemptCount.value = attempts

  try {
    window.localStorage.setItem(
      storageKey.value,
      JSON.stringify({ best, attempts, last: value })
    )
  } catch {
    // Storage may be unavailable; the result still renders.
  }
}

function syncLessonCompleted(): void {
  if (typeof window === 'undefined' || !phaseId.value) return
  lessonCompleted.value = isLessonCompleted(phaseId.value, lessonId.value)
}

function markLessonComplete(): void {
  if (typeof window === 'undefined' || !phaseId.value) return
  setLessonCompleted(phaseId.value, lessonId.value, true)
  lessonCompleted.value = true
}

function resetState(): void {
  current.value = 0
  selected.value = null
  answered.value = false
  score.value = 0
  finished.value = false
  answers.value = []
  reviewing.value = false
}

async function loadQuiz(): Promise<void> {
  if (!enabled.value || typeof window === 'undefined') return

  controller?.abort()
  controller = new AbortController()
  loading.value = true
  error.value = ''
  questions.value = []
  resetState()

  const stats = readStats()
  bestScore.value = stats.best
  attemptCount.value = stats.attempts
  syncLessonCompleted()

  try {
    const response = await fetch(
      withBase(`/quizzes/${phaseId.value}-${lessonId.value}.json`),
      { signal: controller.signal, headers: { Accept: 'application/json' } }
    )
    if (!response.ok) throw new Error(String(response.status))
    const data = await response.json()
    questions.value = normalizeQuestions(data)
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      error.value = 'تعذر تحميل الاختبار. حاول تحديث الصفحة.'
    }
  } finally {
    loading.value = false
  }
}

function selectOption(index: number): void {
  if (answered.value || finished.value || !question.value) return
  selected.value = index
  answered.value = true
  const correct = index === question.value.correct
  answers.value.push({
    questionIndex: current.value,
    selected: index,
    correct
  })
  if (correct) score.value += 1
}

function optionClass(index: number): string {
  if (!answered.value || !question.value) return ''
  if (index === question.value.correct) return 'is-correct'
  if (index === selected.value) return 'is-wrong'
  return 'is-muted'
}

function questionAt(index: number): QuizQuestion | undefined {
  return questions.value[index]
}

function optionAt(questionIndex: number, optionIndex: number): string {
  return questionAt(questionIndex)?.options[optionIndex] ?? '—'
}

function correctOptionAt(questionIndex: number): string {
  const item = questionAt(questionIndex)
  return item ? item.options[item.correct] ?? '—' : '—'
}

function explanationAt(questionIndex: number): string {
  return questionAt(questionIndex)?.explanation ?? ''
}

function focusQuestion(): void {
  nextTick(() => questionText.value?.focus())
}

async function fireConfetti(): Promise<void> {
  try {
    const { default: confetti } = await import('canvas-confetti')
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.7 },
      colors: ['#D7897F', '#F9B95C', '#96C7B3', '#6398A9']
    })
  } catch {
    // Confetti is a progressive enhancement only.
  }
}

function finishQuiz(): void {
  finished.value = true
  reviewing.value = false
  saveStats(score.value)
  if (score.value === total.value && total.value > 0) void fireConfetti()
}

function nextQuestion(): void {
  if (!answered.value) return
  if (current.value >= total.value - 1) {
    finishQuiz()
    return
  }
  current.value += 1
  selected.value = null
  answered.value = false
  focusQuestion()
}

function retry(): void {
  resetState()
  focusQuestion()
}

function onStorage(event: StorageEvent): void {
  if (!event.key) return
  if (event.key === storageKey.value) {
    const stats = readStats()
    bestScore.value = stats.best
    attemptCount.value = stats.attempts
  }
  if (event.key === `progress_${phaseId.value}`) syncLessonCompleted()
}

onMounted(() => {
  syncLessonCompleted()
  if (enabled.value) void loadQuiz()
  window.addEventListener('storage', onStorage)
  window.addEventListener('ai-progress-updated', syncLessonCompleted)
})

watch([phaseId, lessonId], () => {
  syncLessonCompleted()
  if (enabled.value) void loadQuiz()
})

onUnmounted(() => {
  controller?.abort()
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('ai-progress-updated', syncLessonCompleted)
})
</script>

<style scoped>
.lesson-quiz {
  padding: 1.5rem;
  margin-top: 2.5rem;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
}

.quiz-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.quiz-eyebrow {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--nectarine-text);
}

.quiz-title {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 1.7rem);
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.quiz-counter {
  flex-shrink: 0;
  padding: 0.25rem 0.65rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border: 2px solid var(--lagune);
  border-radius: 999px;
}

.quiz-hint {
  margin: 0 0 0.75rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.quiz-progress {
  height: 8px;
  padding: 2px;
  margin-bottom: 1.2rem;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  border-radius: 999px;
  box-shadow: var(--neo-inset-sm);
}

.quiz-progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--peche), var(--nectarine));
  border-radius: inherit;
  transition: width 0.25s ease;
}

.quiz-status {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.quiz-status--error {
  color: var(--nectarine-text);
}

.quiz-question-text {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.quiz-question-text:focus {
  outline: none;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
  border: 0;
}

.quiz-option {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.7rem 0.8rem;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--lagune);
  border-radius: 12px;
  box-shadow: var(--neo-shadow-sm);
  transition: background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.2s ease;
}

.quiz-option:hover {
  background: color-mix(in srgb, var(--lagune) 7%, transparent);
}

.quiz-option:focus-within {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.quiz-option input {
  flex-shrink: 0;
  margin-top: 0.22rem;
  accent-color: var(--lagune-strong);
}

.quiz-option-letter {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-top: 0.05rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--lagune) 55%, transparent);
  border-radius: 6px;
}

.quiz-option-text {
  flex: 1;
  min-width: 0;
}

.quiz-option-icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.quiz-option-icon--correct,
.quiz-feedback--correct .quiz-feedback-title {
  color: var(--menthe-text);
}

.quiz-option-icon--wrong,
.quiz-feedback--wrong .quiz-feedback-title {
  color: var(--nectarine-text);
}

.quiz-option.is-correct {
  color: var(--menthe-text);
  background: color-mix(in srgb, var(--menthe) 16%, transparent);
  border-color: var(--menthe);
  box-shadow: var(--neo-inset-sm);
}

.quiz-option.is-wrong {
  color: var(--nectarine-text);
  background: color-mix(in srgb, var(--nectarine) 16%, transparent);
  border-color: var(--nectarine);
  box-shadow: var(--neo-inset-sm);
}

.quiz-option.is-muted {
  opacity: 0.65;
}

.quiz-feedback {
  padding: 0.85rem 0.95rem;
  margin-top: 0.9rem;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-inline-start-width: 4px;
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
}

.quiz-feedback--correct {
  background: color-mix(in srgb, var(--menthe) 12%, var(--bg));
  border-color: var(--menthe);
}

.quiz-feedback--wrong {
  background: color-mix(in srgb, var(--nectarine) 11%, var(--bg));
  border-color: var(--nectarine);
}

.quiz-feedback-title {
  margin: 0 0 0.3rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.quiz-explanation {
  margin: 0 0 0.75rem;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.quiz-next,
.quiz-retry {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.5rem 0.95rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  background: var(--nectarine-strong);
  border: 2px solid var(--nectarine);
  border-radius: 12px;
  box-shadow: var(--neo-shadow-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.quiz-next:hover,
.quiz-retry:hover {
  background: var(--accent-primary-strong);
  transform: translateY(-1px);
}

.quiz-next:focus-visible,
.quiz-retry:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.quiz-result {
  padding: 1rem 0;
  text-align: center;
}

.quiz-score {
  font-size: 2.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--vp-c-text-1);
}

.quiz-score span {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.quiz-result-title {
  margin: 0.75rem 0 0.35rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.quiz-result-message,
.quiz-best {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.quiz-best {
  margin: 0;
  font-weight: 700;
}

.quiz-hint--best {
  margin-top: -0.35rem;
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}

.quiz-result-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  justify-content: center;
  margin-bottom: 0.9rem;
  font-size: 0.8rem;
}

.quiz-result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
}

.quiz-review-toggle,
.quiz-complete {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.5rem 0.95rem;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--lagune-text);
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--lagune);
  border-radius: 12px;
  box-shadow: var(--neo-shadow-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.quiz-review-toggle:hover,
.quiz-complete:hover {
  background: color-mix(in srgb, var(--lagune) 13%, transparent);
  border-color: var(--lagune-text);
  transform: translateY(-1px);
}

.quiz-complete {
  margin-top: 0.9rem;
  color: var(--menthe-text);
  border-color: var(--menthe);
}

.quiz-complete:hover {
  background: color-mix(in srgb, var(--menthe) 14%, transparent);
  border-color: var(--menthe-text);
}

.quiz-review-toggle:focus-visible,
.quiz-complete:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.quiz-lesson-complete {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  margin: 0.9rem 0 0;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--menthe-text);
}

.quiz-review {
  padding-top: 1rem;
  margin-top: 1.25rem;
  text-align: start;
  border-top: 2px solid var(--vp-c-divider);
}

.quiz-review-title {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.quiz-review-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.quiz-review-item {
  padding: 0.7rem 0.8rem;
  background: var(--bg);
  border: 2px solid var(--vp-c-divider);
  border-inline-start-width: 4px;
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
}

.quiz-review-item.is-correct {
  background: color-mix(in srgb, var(--menthe) 11%, var(--bg));
  border-color: var(--menthe);
}

.quiz-review-item.is-wrong {
  background: color-mix(in srgb, var(--nectarine) 10%, var(--bg));
  border-color: var(--nectarine);
}

.quiz-review-head {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.quiz-review-number {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-top: 0.05rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.64rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border-radius: 6px;
}

.quiz-review-question {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.quiz-review-icon {
  flex-shrink: 0;
  margin-top: 0.12rem;
}

.quiz-review-item.is-correct .quiz-review-icon {
  color: var(--menthe-text);
}

.quiz-review-item.is-wrong .quiz-review-icon {
  color: var(--nectarine-text);
}

.quiz-review-answer {
  margin: 0.45rem 0 0;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.quiz-review-answer strong {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.quiz-review-explanation {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
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

@media (max-width: 640px) {
  .lesson-quiz {
    padding: 1rem;
  }

  .quiz-option {
    padding: 0.55rem 0.6rem;
    font-size: 0.8rem;
  }

  .quiz-result-actions {
    flex-direction: column;
  }

  .quiz-result-actions button {
    justify-content: center;
    width: 100%;
  }

  .quiz-review-item {
    padding: 0.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .quiz-progress-fill,
  .quiz-option,
  .quiz-next,
  .quiz-retry,
  .quiz-review-toggle,
  .quiz-complete {
    transition: none;
  }
}
</style>
