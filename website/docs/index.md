---
layout: false
description: 'المسار التعليمي العربي الشامل لتعلم هندسة الذكاء الاصطناعي من الصفر إلى الاحتراف: 20 مرحلة و435 درسًا في الرياضيات والبرمجة والنماذج التوليدية وLLMs والوكلاء.'
---

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import HomeHero from './.vitepress/theme/components/HomeHero.vue'
import HomeStats from './.vitepress/theme/components/HomeStats.vue'
import HomeFeatures from './.vitepress/theme/components/HomeFeatures.vue'
import LazyMount from './.vitepress/theme/components/LazyMount.vue'

const RoadmapPreview = defineAsyncComponent(
  () => import('./.vitepress/theme/components/RoadmapPreview.vue')
)
const StartFromYourLevel = defineAsyncComponent(
  () => import('./.vitepress/theme/components/StartFromYourLevel.vue')
)
const WhyThisSite = defineAsyncComponent(
  () => import('./.vitepress/theme/components/WhyThisSite.vue')
)
const SiteFooter = defineAsyncComponent(
  () => import('./.vitepress/theme/components/SiteFooter.vue')
)
</script>

<main class="home-main">
<HomeHero />

<HomeStats />

<HomeFeatures />

<LazyMount min-height="520px">
  <RoadmapPreview />
</LazyMount>

<LazyMount min-height="420px">
  <StartFromYourLevel />
</LazyMount>

<LazyMount min-height="300px">
  <WhyThisSite />
</LazyMount>

<LazyMount min-height="160px">
  <SiteFooter />
</LazyMount>
</main>
