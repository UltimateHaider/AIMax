<template>
  <section class="home-start" aria-labelledby="home-start-title">
    <div class="section-inner">
      <header class="start-header">
        <span class="start-eyebrow">ابدأ من مستواك</span>
        <h2 id="home-start-title" class="start-title">أين أنت الآن؟</h2>
        <p class="start-subtitle">
          اختر نقطة البداية المناسبة لخبرتك، وسنأخذك خطوة بخطوة إلى المستوى التالي.
        </p>
      </header>

      <ul class="start-grid">
        <li
          v-for="track in tracks"
          :key="track.title"
          class="start-card"
          :style="{ '--track-accent': track.accent }"
        >
          <span class="start-icon" aria-hidden="true">
            <component :is="track.icon" :size="22" :stroke-width="1.8" />
          </span>
          <h3 class="start-card-title">{{ track.title }}</h3>
          <p class="start-description">{{ track.description }}</p>
          <a class="start-link" :href="track.link">
            ابدأ من هنا
            <ArrowLeft :size="14" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowLeft, BarChart3, Bot, Brain, Sigma, Sparkles } from 'lucide-vue-next'

type Track = {
  title: string
  description: string
  link: string
  icon: Component
  accent: string
}

const tracks: Track[] = [
  {
    title: 'مبتدئ تمامًا',
    description: 'ابدأ من إعداد البيئة والأدوات، ثم الأساسيات خطوة بخطوة.',
    link: '/phases/00/01-dev-environment',
    icon: Sparkles,
    accent: 'var(--nectarine)'
  },
  {
    title: 'أعرف بايثون',
    description: 'انتقل مباشرة إلى الرياضيات الأساسية للتعلم الآلي.',
    link: '/phases/01/01-linear-algebra-intuition',
    icon: Sigma,
    accent: 'var(--peche)'
  },
  {
    title: 'أعرف ML',
    description: 'ادخل إلى الشبكات العصبية والانتشار الخلفي من الصفر.',
    link: '/phases/03/01-the-perceptron',
    icon: BarChart3,
    accent: 'var(--menthe)'
  },
  {
    title: 'أعرف DL',
    description: 'ابنِ نماذج LLMs وافهم المحولات والتكميم والاستدلال.',
    link: '/phases/10/01-tokenizers',
    icon: Brain,
    accent: 'var(--lagune)'
  },
  {
    title: 'خبير يريد الوكلاء',
    description: 'تخصص في هندسة الوكلاء، MCP، والأنظمة متعددة الوكلاء.',
    link: '/phases/14/01-the-agent-loop',
    icon: Bot,
    accent: 'var(--nectarine)'
  }
]
</script>

<style scoped>
.home-start {
  padding: 3.5rem 1.5rem 4rem;
}

.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.start-header {
  max-width: 720px;
  margin: 0 auto 2rem;
  text-align: center;
}

.start-eyebrow {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--home-accent);
  letter-spacing: 0.04em;
}

.start-title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.65rem, 3vw, 2.3rem);
  font-weight: 800;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

.start-subtitle {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.start-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.start-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.2rem;
  background: var(--bg);
  border: 2px solid var(--track-accent);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.start-card:hover {
  border-color: var(--track-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-4px);
}

.start-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 0.8rem;
  color: var(--track-accent);
  background: color-mix(in srgb, var(--track-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--track-accent) 55%, transparent);
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
}

.start-card-title {
  margin: 0 0 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.start-description {
  flex: 1;
  margin: 0 0 1rem;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.start-link {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  align-self: flex-start;
  padding: 0.42rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  text-decoration: none;
  background: color-mix(in srgb, var(--track-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--track-accent) 58%, transparent);
  border-radius: 9px;
  transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.start-link:hover {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--track-accent) 20%, transparent);
  border-color: var(--track-accent);
  transform: translateX(-2px);
}

@media (max-width: 1024px) {
  .start-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-start {
    padding-inline: 1rem;
  }

  .start-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .start-card,
  .start-link {
    transition: none;
  }
}
</style>
