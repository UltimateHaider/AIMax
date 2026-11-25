<template>
  <div class="app-root">
    <CustomNav />
    <ReadingProgress />

    <div v-if="frontmatter.layout !== false" class="Layout" :class="frontmatter.pageClass">
      <a href="#VPContent" class="VPSkipLink visually-hidden">انتقل إلى المحتوى</a>
      <VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />

      <VPSidebar :open="isSidebarOpen">
        <template #sidebar-nav-before>
          <CustomSidebar @open="openSidebar" @close="closeSidebar" />
        </template>
      </VPSidebar>

      <VPContent id="VPContent">
        <template #doc-before><LessonHeader /></template>
        <template #doc-after>
          <CustomCodeBlock />
          <LazyMount min-height="360px">
            <Quiz />
          </LazyMount>
          <LessonNav />
        </template>
      </VPContent>

      <LazyMount min-height="220px">
        <SiteFooter />
      </LazyMount>
    </div>

    <Content v-else />

    <BackToTop />
    <GlobalSearch />
    <MathEnhancer />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue'
import VPContent from 'vitepress/dist/client/theme-default/components/VPContent.vue'
import VPSidebar from 'vitepress/dist/client/theme-default/components/VPSidebar.vue'
import {
  useCloseSidebarOnEscape,
  useSidebar
} from 'vitepress/dist/client/theme-default/composables/sidebar.js'
import CustomNav from './components/CustomNav.vue'
import CustomSidebar from './components/CustomSidebar.vue'
import GlobalSearch from './components/GlobalSearch.vue'
import MathEnhancer from './components/MathEnhancer.vue'
import LessonHeader from './components/LessonHeader.vue'
import CustomCodeBlock from './components/CustomCodeBlock.vue'
import LessonNav from './components/LessonNav.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import BackToTop from './components/BackToTop.vue'
import LazyMount from './components/LazyMount.vue'

const Quiz = defineAsyncComponent(() => import('./components/Quiz.vue'))
const SiteFooter = defineAsyncComponent(() => import('./components/SiteFooter.vue'))

const { frontmatter } = useData()
const route = useRoute()
const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar()

watch(() => route.path, closeSidebar)
useCloseSidebarOnEscape(isSidebarOpen, closeSidebar)
</script>

<style scoped>
.Layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
