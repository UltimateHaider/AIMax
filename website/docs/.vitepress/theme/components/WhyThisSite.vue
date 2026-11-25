<template>
  <section class="home-why" aria-labelledby="home-why-title">
    <div class="section-inner">
      <header class="why-header">
        <span class="why-eyebrow">لماذا هذا الموقع؟</span>
        <h2 id="home-why-title" class="why-title">تعلم عملي، عربي، ومفتوح للجميع</h2>
      </header>

      <ul class="why-grid">
        <li v-for="point in points" :key="point.title" class="why-card">
          <span class="why-icon" aria-hidden="true">
            <component :is="point.icon" :size="20" :stroke-width="1.8" />
          </span>
          <div>
            <h3 class="why-card-title">{{ point.title }}</h3>
            <p class="why-description">{{ point.description }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { CheckCircle, Code, Github, Languages } from 'lucide-vue-next'

type Point = {
  title: string
  description: string
  icon: Component
}

const points: Point[] = [
  {
    title: 'محتوى أصلي 100% بالعربية',
    description: 'شرح عربي مبني من الصفر، وليس ترجمة آلية.',
    icon: Languages
  },
  {
    title: 'كل درس به كود عملي قابل للتشغيل',
    description: 'أمثلة Python وTypeScript وRust جاهزة للنسخ والتشغيل.',
    icon: Code
  },
  {
    title: 'اختبارات تفاعلية في 240 درسًا',
    description: 'اختبر فهمك بعد كل درس وثبّت المفاهيم.',
    icon: CheckCircle
  },
  {
    title: 'مبني على منهج مفتوح المصدر (MIT)',
    description: 'شفاف، قابل للنسخ والتعديل والمشاركة.',
    icon: Github
  }
]
</script>

<style scoped>
.home-why {
  padding: 3.5rem 1.5rem 3.5rem;
  background: var(--vp-c-bg-alt);
  border-block-start: 1px solid var(--vp-c-divider);
}

.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.why-header {
  max-width: 720px;
  margin: 0 auto 1.8rem;
  text-align: center;
}

.why-eyebrow {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--home-accent);
  letter-spacing: 0.04em;
}

.why-title {
  margin: 0;
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 800;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.why-card {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 1.05rem;
  background: var(--bg);
  border: 2px solid var(--why-accent, var(--vp-c-divider));
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.why-card:nth-child(1) {
  --why-accent: var(--nectarine);
}

.why-card:nth-child(2) {
  --why-accent: var(--peche);
}

.why-card:nth-child(3) {
  --why-accent: var(--menthe);
}

.why-card:nth-child(4) {
  --why-accent: var(--lagune);
}

.why-card:hover {
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-3px);
}

.why-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--why-accent, var(--lagune-text));
  background: color-mix(in srgb, var(--why-accent, var(--lagune)) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--why-accent, var(--lagune)) 55%, transparent);
  border-radius: 11px;
  box-shadow: var(--neo-inset-sm);
}

.why-card-title {
  margin: 0 0 0.25rem;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.why-description {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

@media (max-width: 1024px) {
  .why-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-why {
    padding-inline: 1rem;
  }

  .why-grid {
    grid-template-columns: 1fr;
  }
}
</style>
