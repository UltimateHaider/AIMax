<template>
  <Transition name="back-to-top">
    <button
      v-if="mounted && visible"
      type="button"
      class="back-to-top"
      aria-label="العودة إلى أعلى الصفحة"
      title="العودة إلى الأعلى"
      @click="scrollToTop"
    >
      <ArrowUp :size="18" aria-hidden="true" />
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const mounted = ref(false)
const visible = ref(false)

let ticking = false

function update(): void {
  visible.value = window.scrollY > 400
}

function onScroll(): void {
  if (ticking) return
  ticking = true
  window.requestAnimationFrame(() => {
    update()
    ticking = false
  })
}

function scrollToTop(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

onMounted(() => {
  mounted.value = true
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 24px;
  left: 20px;
  z-index: 65;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: var(--lagune-text);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 13px;
  box-shadow: var(--neo-shadow);
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.3s ease;
}

.back-to-top:hover {
  color: var(--nectarine-text);
  border-color: var(--nectarine);
  transform: translateY(-2px);
}

.back-to-top:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

@media (max-width: 959px) {
  .back-to-top {
    bottom: 76px;
  }
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .back-to-top-enter-active,
  .back-to-top-leave-active {
    transition: none;
  }
}
</style>
