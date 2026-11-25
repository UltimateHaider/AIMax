<template>
  <section class="home-features">
    <div class="section-inner">
      <h2 class="features-title">المزايا</h2>

      <ul class="features-grid">
        <li
          v-for="feature in primaryFeatures"
          :key="feature.title"
          class="feature-card"
          :style="{ '--feature-accent': feature.accent }"
        >
          <span class="feature-icon" aria-hidden="true">
            <component :is="feature.icon" :size="22" :stroke-width="1.8" />
          </span>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </li>

        <template v-if="showSecondary">
          <li
            v-for="feature in secondaryFeatures"
            :key="feature.title"
            class="feature-card"
            :style="{ '--feature-accent': feature.accent }"
          >
            <span class="feature-icon" aria-hidden="true">
              <component :is="feature.icon" :size="22" :stroke-width="1.8" />
            </span>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </li>
        </template>
      </ul>

      <div ref="sentinel" class="features-sentinel" aria-hidden="true" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Component } from 'vue'
import { Bot, Brain, Shield, Sigma, Wrench, Zap } from 'lucide-vue-next'

type Feature = {
  title: string
  description: string
  icon: Component
  accent: string
}

const features: Feature[] = [
  {
    title: 'من المبادئ الرياضية الأولى',
    description: 'الجبر الخطي، والتفاضل، والاحتمالات، والاستمثال الرياضي مشروحًا كوديًا وتطبيقيًا.',
    icon: Sigma,
    accent: 'var(--nectarine)'
  },
  {
    title: 'خوارزميات التعلم العميق',
    description: 'بناء الشبكات العصبية والانتشار الخلفي من الصفر قبل الانتقال إلى الأطر الجاهزة.',
    icon: Brain,
    accent: 'var(--peche)'
  },
  {
    title: 'المحولات و LLMs بالتفصيل',
    description: 'تشريح Attention، ومشفرات Transformer، وبناء وتدريب النماذج اللغوية عمليًا.',
    icon: Zap,
    accent: 'var(--menthe)'
  },
  {
    title: 'هندسة الوكلاء الأذكياء',
    description: 'أنماط ReAct، وذاكرة الوكلاء، وبروتوكول MCP، واستدعاء الأدوات، وبناء Swarms.',
    icon: Bot,
    accent: 'var(--lagune)'
  },
  {
    title: 'البنية التحتية وإنتاج MLOps',
    description: 'تسريع الاستدلال عبر vLLM و TensorRT-LLM، والتكميم، والمراقبة، وخفض التكاليف.',
    icon: Wrench,
    accent: 'var(--nectarine)'
  },
  {
    title: 'محتوى مفتوح المصدر',
    description: 'كل المنهج مبني على مستودع مفتوح المصدر بترخيص MIT، يمكنك نسخه وتعديله ومشاركته.',
    icon: Shield,
    accent: 'var(--peche)'
  }
]

const primaryFeatures = features.slice(0, 3)
const secondaryFeatures = features.slice(3)
const showSecondary = ref(false)
const sentinel = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    showSecondary.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        showSecondary.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: '320px 0px', threshold: 0 }
  )

  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.home-features {
  padding: 3.5rem 1.5rem 4rem;
}

.section-inner {
  max-width: 1152px;
  margin: 0 auto;
}

.features-title {
  max-width: 760px;
  margin: 0 auto 2rem;
  font-size: clamp(1.65rem, 3vw, 2.3rem);
  font-weight: 800;
  line-height: 1.35;
  color: var(--vp-c-text-1);
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.35rem;
  background: var(--bg);
  border: 2px solid var(--feature-accent);
  border-radius: 20px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.feature-card:hover {
  border-color: var(--feature-accent);
  box-shadow: 8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light);
  transform: translateY(-4px);
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 0.9rem;
  color: var(--feature-accent);
  background: color-mix(in srgb, var(--feature-accent) 14%, transparent);
  border: 2px solid color-mix(in srgb, var(--feature-accent) 55%, transparent);
  border-radius: 12px;
  box-shadow: var(--neo-inset-sm);
}

.feature-title {
  margin: 0 0 0.45rem;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.45;
  color: var(--vp-c-text-1);
}

.feature-description {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.features-sentinel {
  width: 100%;
  height: 1px;
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .home-features {
    padding-inline: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none;
  }
}
</style>
