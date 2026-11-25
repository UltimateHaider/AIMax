<template>
  <div class="custom-code-enhancer" hidden aria-hidden="true" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const COLLAPSE_AFTER = 30

// Line numbers are CSS-only; set this to false to disable them globally.
const LINE_NUMBERS = true

const route = useRoute()

let observer: IntersectionObserver | null = null
let counter = 0

function countLines(block: HTMLElement): number {
  const code = block.querySelector('code')
  if (!code) return 0
  const lineCount = code.querySelectorAll('.line').length
  if (lineCount > 0) return lineCount
  const text = code.textContent || ''
  return text ? text.split('\n').length : 0
}

function enhanceBlock(block: HTMLElement): void {
  if (block.dataset.customCodeEnhanced === 'true') return
  block.dataset.customCodeEnhanced = 'true'

  if (LINE_NUMBERS) block.classList.add('code-line-numbers')

  const lineCount = countLines(block)
  if (lineCount <= COLLAPSE_AFTER) return

  block.classList.add('code-collapsible', 'is-collapsed')

  const pre = block.querySelector('pre')
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'custom-code-toggle'
  toggle.textContent = 'عرض الكود كاملًا'
  toggle.setAttribute('aria-expanded', 'false')
  toggle.setAttribute('aria-label', 'عرض الكود كاملًا')

  if (pre) {
    const id = `custom-code-${counter++}`
    pre.id = id
    toggle.setAttribute('aria-controls', id)
  }

  toggle.addEventListener('click', () => {
    const collapsed = block.classList.toggle('is-collapsed')
    toggle.textContent = collapsed ? 'عرض الكود كاملًا' : 'طي الكود'
    toggle.setAttribute('aria-expanded', String(!collapsed))
    toggle.setAttribute('aria-label', collapsed ? 'عرض الكود كاملًا' : 'طي الكود')
  })

  const copyButton = block.querySelector('button.copy')
  if (copyButton) block.insertBefore(toggle, copyButton)
  else block.prepend(toggle)
}

function createObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null

  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const block = entry.target as HTMLElement
        if (block.isConnected) enhanceBlock(block)
        observer?.unobserve(block)
      }
    },
    { rootMargin: '400px 0px', threshold: 0 }
  )
}

function scan(): void {
  if (typeof document === 'undefined') return

  const blocks = document.querySelectorAll<HTMLElement>(
    '.vp-doc div[class*="language-"]'
  )

  for (const block of blocks) {
    if (block.dataset.customCodeEnhanced === 'true') continue
    // Enhance only blocks near the viewport. Adding line numbers to every
    // code block up front forces a large style/layout pass on lesson pages.
    if (observer) {
      observer.observe(block)
    } else {
      enhanceBlock(block)
    }
  }
}

function rescan(): void {
  observer?.disconnect()
  observer = createObserver()
  nextTick(scan)
}

onMounted(() => {
  observer = createObserver()
  nextTick(scan)
  // Long code blocks (> 50 lines) are enriched only when near the viewport.
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})

watch(() => route.path, rescan)
</script>

<style scoped>
.custom-code-enhancer {
  display: none;
}
</style>
