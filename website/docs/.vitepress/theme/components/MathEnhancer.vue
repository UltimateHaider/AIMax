<template>
  <span class="math-enhancer" aria-hidden="true" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { enhanceCodeBlock, enhanceElement } from '../math/enhanceMath'
import type { MathRenderer } from '../math/enhanceMath'

const route = useRoute()

const MATH_HINT = /[=≈≤≥*/^]|sqrt\(|sum\(|proj_|->|·|×|∂|∫|∑|[α-ωΑ-Ω]/
const MAX_WAIT_FRAMES = 60

let observer: IntersectionObserver | null = null
let contentObserver: MutationObserver | null = null
let katexPromise: Promise<typeof import('katex')> | null = null
let scanTimer: number | null = null

async function getRenderer(): Promise<MathRenderer> {
  if (!katexPromise) katexPromise = import('katex')
  const module = await katexPromise
  const katex = (module as unknown as { default?: typeof import('katex') }).default ?? module

  return (latex: string, display: boolean): string | null => {
    try {
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: true,
        strict: 'ignore',
        trust: false
      })
    } catch {
      return null
    }
  }
}

async function processElement(element: HTMLElement, renderer: MathRenderer): Promise<void> {
  if (!element.isConnected || element.dataset.mathScanned === 'true') return
  element.dataset.mathScanned = 'true'

  if (element.matches("div[class*='language-']")) {
    enhanceCodeBlock(element, renderer)
    return
  }

  enhanceElement(element, renderer)
}

function isCandidate(element: HTMLElement): boolean {
  if (element.dataset.mathScanned === 'true') return false
  if (element.closest('.katex, .math-inline, .math-display, .math-display-block')) return false
  if (element.matches('li') && element.querySelector('ul, ol')) return false
  if (element.matches("div[class*='language-']") && !element.querySelector('pre code')) return false
  return MATH_HINT.test(element.textContent ?? '')
}

async function scan(): Promise<void> {
  cleanupObserver()
  if (!/^\/phases\/\d{2}\//.test(route.path)) return

  await nextTick()
  for (let i = 0; i < MAX_WAIT_FRAMES; i++) {
    if (document.querySelector('.vp-doc p')) break
    await new Promise((resolve) => window.setTimeout(resolve, 50))
  }

  const root = document.querySelector<HTMLElement>('.vp-doc')
  if (!root) return

  const candidates = [...root.querySelectorAll<HTMLElement>('p, li, td, th, div[class*="language-"]')]
    .filter(isCandidate)

  if (candidates.length === 0) return

  if (!('IntersectionObserver' in window)) {
    const renderer = await getRenderer()
    for (const element of candidates) await processElement(element, renderer)
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer?.unobserve(entry.target)
        void getRenderer().then((renderer) => processElement(entry.target as HTMLElement, renderer))
      }
    },
    { rootMargin: '350px 0px', threshold: 0 }
  )

  for (const element of candidates) observer.observe(element)
}

function cleanupObserver(): void {
  observer?.disconnect()
  observer = null
}

function startContentObserver(): void {
  contentObserver?.disconnect()
  const root = document.querySelector('.VPContent') ?? document.body
  contentObserver = new MutationObserver(() => {
    if (document.querySelector('.vp-doc')) scheduleScan(220)
  })
  contentObserver.observe(root, { childList: true, subtree: true })
}

function scheduleScan(delay = 120): void {
  if (scanTimer !== null) window.clearTimeout(scanTimer)
  scanTimer = window.setTimeout(() => {
    scanTimer = null
    void scan()
  }, delay)
}

onMounted(() => {
  scheduleScan(80)
  startContentObserver()
  watch(
    () => route.path,
    () => {
      cleanupObserver()
      scheduleScan(220)
      window.setTimeout(() => scheduleScan(900), 900)
    }
  )
})

onUnmounted(() => {
  if (scanTimer !== null) window.clearTimeout(scanTimer)
  cleanupObserver()
  contentObserver?.disconnect()
  contentObserver = null
})
</script>

<style scoped>
.math-enhancer {
  display: none;
}
</style>
