<template>
  <AuthProvider>
    <div class="app-root">
      <CustomNav />
      <ReadingProgress />

      <div
        v-if="frontmatter.layout !== false"
        class="Layout"
        :class="[frontmatter.pageClass, { 'is-sidebar-collapsed': isSidebarCollapsed }]"
      >
        <a href="#VPContent" class="VPSkipLink visually-hidden">انتقل إلى المحتوى</a>
        <VPBackdrop class="backdrop" :show="isSidebarOpen" @click="closeSidebar" />

        <VPSidebar :open="isSidebarOpen">
          <template #sidebar-nav-before>
            <CustomSidebar @open="openSidebar" @close="closeSidebar" />
          </template>
        </VPSidebar>

        <button
          v-if="hasSidebar"
          type="button"
          class="sidebar-collapse-toggle"
          :aria-label="isSidebarCollapsed ? 'إظهار الشريط الجانبي' : 'طي الشريط الجانبي'"
          :aria-expanded="!isSidebarCollapsed"
          :title="isSidebarCollapsed ? 'إظهار الشريط الجانبي' : 'طي الشريط الجانبي'"
          @click="toggleSidebarCollapsed"
        >
          <ChevronLeft v-if="isSidebarCollapsed" :size="17" aria-hidden="true" />
          <ChevronRight v-else :size="17" aria-hidden="true" />
        </button>

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
          <SiteFooter :with-sidebar="hasSidebar && !isSidebarCollapsed" />
        </LazyMount>
      </div>

      <Content v-else />

      <BackToTop />
      <GlobalSearch />
      <MathEnhancer />
    </div>
  </AuthProvider>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import VPBackdrop from 'vitepress/dist/client/theme-default/components/VPBackdrop.vue'
import VPContent from 'vitepress/dist/client/theme-default/components/VPContent.vue'
import VPSidebar from 'vitepress/dist/client/theme-default/components/VPSidebar.vue'
import {
  useCloseSidebarOnEscape,
  useSidebar
} from 'vitepress/dist/client/theme-default/composables/sidebar.js'
import AuthProvider from './components/AuthProvider.vue'
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
const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar, hasSidebar } = useSidebar()

const SIDEBAR_COLLAPSED_KEY = 'aimax_sidebar_collapsed'
const isSidebarCollapsed = ref(false)

function toggleSidebarCollapsed(): void {
  isSidebarCollapsed.value = !isSidebarCollapsed.value

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      SIDEBAR_COLLAPSED_KEY,
      isSidebarCollapsed.value ? '1' : '0'
    )
  }
}

onMounted(() => {
  try {
    isSidebarCollapsed.value = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    isSidebarCollapsed.value = false
  }
})

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
