<template>
  <div
    v-if="mounted && isLesson && progress < 0.999"
    class="reading-progress"
    aria-hidden="true"
  >
    <span class="reading-progress-fill" :style="{ width: `${progress * 100}%` }" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const mounted = ref(false)
const progress = ref(0)

const isLesson = computed(() => /^\/phases\/\d{2}\//.test(route.path))

let ticking = false

function update(): void {
  if (typeof window === 'undefined') return
  const element = document.documentElement
  const max = element.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
}

function onScroll(): void {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(() => {
    update()
    ticking = false
  })
}

onMounted(() => {
  mounted.value = true
  nextTick(update)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

watch(
  () => route.path,
  () => nextTick(update)
)
</script>

<style scoped>
.reading-progress {
  position: fixed;
  inset-inline: 0;
  top: var(--vp-nav-height, 64px);
  z-index: 60;
  height: 3px;
  pointer-events: none;
  background: transparent;
}

.reading-progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--nectarine), var(--peche));
  box-shadow: 0 0 8px color-mix(in srgb, var(--nectarine) 45%, transparent);
  transition: width 0.1s linear;
}

@media (prefers-reduced-motion: reduce) {
  .reading-progress-fill {
    transition: none;
  }
}
</style>
