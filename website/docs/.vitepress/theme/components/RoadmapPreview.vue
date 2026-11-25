<template>
  <section class="home-roadmap" aria-labelledby="home-roadmap-title">
    <div class="section-inner">
      <header class="roadmap-header">
        <span class="roadmap-eyebrow">خريطة المسار</span>
        <h2 id="home-roadmap-title" class="roadmap-title">20 مرحلة متدرجة، خطوة بخطوة</h2>
        <p class="roadmap-subtitle">
          ابدأ من الأساسيات وتقدم حتى بناء الأنظمة الإنتاجية والوكلاء الأذكياء.
        </p>
      </header>

      <ol class="roadmap-track">
        <li v-for="phase in previewPhases" :key="phase.id" class="roadmap-item">
          <span class="roadmap-step" aria-hidden="true">{{ phase.id }}</span>
          <a
            class="roadmap-card"
            :style="{ '--phase-accent': phase.accent }"
            :href="`/phases/${phase.id}/${phase.firstLessonSlug}`"
          >
            <span class="roadmap-icon" aria-hidden="true">
              <component :is="phase.icon" :size="20" :stroke-width="1.8" />
            </span>
            <span class="roadmap-name">{{ phase.nameAr }}</span>
            <span class="roadmap-count">{{ phase.lessonCount }} درسًا</span>
          </a>
        </li>
      </ol>

      <div class="roadmap-footer">
        <a class="roadmap-link" href="/roadmap">
          عرض الخريطة الكاملة
          <span aria-hidden="true">←</span>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { BarChart3, Image as ImageIcon, Layers, Settings, Sigma } from 'lucide-vue-next'
import summaryData from '../curriculum-summary.json'

type PhaseIcon = Component

const phaseIcons: PhaseIcon[] = [Settings, Sigma, BarChart3, Layers, ImageIcon]
const phaseAccents = ['var(--nectarine)', 'var(--peche)', 'var(--menthe)', 'var(--lagune)', 'var(--nectarine)']

const previewPhases = (summaryData.phases || []).slice(0, 5).map((phase, index) => ({
  ...phase,
  icon: phaseIcons[index] ?? Layers,
  accent: phaseAccents[index] ?? 'var(--nectarine)'
}))
</script>

<style scoped>
.home-roadmap {
  padding: 3.5rem 1.5rem 4rem;
  background: var(--bg);
  border-block: 1px solid var(--vp-c-divider);
}

.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.roadmap-header {
  max-width: 720px;
  margin: 0 auto 2.2rem;
  text-align: center;
}

.roadmap-eyebrow {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--home-accent);
  letter-spacing: 0.04em;
}

.roadmap-title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.65rem, 3vw, 2.3rem);
  font-weight: 800;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.roadmap-subtitle {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.roadmap-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.roadmap-track::before {
  position: absolute;
  inset-block-start: 1.15rem;
  inset-inline: 7%;
  height: 3px;
  content: '';
  background: linear-gradient(
    90deg,
    var(--nectarine),
    var(--peche),
    var(--menthe),
    var(--lagune)
  );
  border-radius: 999px;
  opacity: 0.65;
}

.roadmap-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.roadmap-step {
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.68rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border: 2px solid var(--lagune);
  border-radius: 999px;
  box-shadow: var(--neo-shadow-sm);
}

.roadmap-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  padding: 1rem 0.7rem;
  text-align: center;
  text-decoration: none;
  background: var(--bg);
  border: 2px solid var(--phase-accent);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.roadmap-card:hover {
  border-color: var(--phase-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-4px);
}

.roadmap-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  color: var(--phase-accent);
  background: color-mix(in srgb, var(--phase-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--phase-accent) 55%, transparent);
  border-radius: 11px;
  box-shadow: var(--neo-inset-sm);
}

.roadmap-name {
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.roadmap-count {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
}

.roadmap-footer {
  margin-top: 2rem;
  text-align: center;
}

.roadmap-link {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  padding: 0.6rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lagune-text);
  text-decoration: none;
  background: color-mix(in srgb, var(--lagune) 12%, transparent);
  border: 2px solid var(--lagune);
  border-radius: 12px;
  box-shadow: var(--neo-shadow-sm);
  transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.roadmap-link:hover {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--lagune) 20%, transparent);
  border-color: var(--lagune-text);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .roadmap-track {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .roadmap-track::before {
    display: none;
  }
}

@media (max-width: 640px) {
  .home-roadmap {
    padding-inline: 1rem;
  }

  .roadmap-track {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .roadmap-card,
  .roadmap-link {
    transition: none;
  }
}
</style>
