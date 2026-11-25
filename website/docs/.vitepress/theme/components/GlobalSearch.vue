<template>
  <div v-if="mounted" class="global-search-root">
    <component :is="LocalSearchBox" v-if="open" @close="close" />
    <Teleport v-if="open && suggestionsTarget" :to="suggestionsTarget">
      <SearchSuggestions
        :recent="recentSearches"
        :popular="popularSearches"
        @select="selectSuggestion"
        @clear="clearRecent"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import SearchSuggestions from './SearchSuggestions.vue'

const LocalSearchBox = defineAsyncComponent(
  () => import('vitepress/dist/client/theme-default/components/VPLocalSearchBox.vue')
)

const RECENT_KEY = 'ai_search_recent'
const MAX_RECENT = 6
const popularSearches = [
  'Attention',
  'RAG',
  'MCP',
  'vLLM',
  'Fine-tuning',
  'Backpropagation',
  'المحولات',
  'التعلم المعزز'
]

const open = ref(false)
const mounted = ref(false)
const suggestionsTarget = ref<HTMLElement | null>(null)
const recentSearches = ref<string[]>([])

let hostEl: HTMLElement | null = null
let loadingEl: HTMLElement | null = null
let resultsObserver: MutationObserver | null = null
let attachRun = 0
let indexPrefetched = false
let searchButton: HTMLElement | null = null

function readRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((value) => String(value).trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

function writeRecent(terms: string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(terms))
  } catch {
    // Search still works if storage is unavailable.
  }
}

function addRecent(term: string): void {
  const value = term.trim()
  if (!value) return
  const next = [value, ...recentSearches.value.filter((item) => item !== value)].slice(
    0,
    MAX_RECENT
  )
  recentSearches.value = next
  writeRecent(next)
}

function clearRecent(): void {
  recentSearches.value = []
  writeRecent([])
}

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement | null
  if (!element) return false
  return (
    element.isContentEditable ||
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
  )
}

function close(): void {
  const input = document.querySelector<HTMLInputElement>('#localsearch-input')
  if (input?.value.trim()) addRecent(input.value.trim())
  cleanupSuggestions()
  open.value = false
}

function syncSuggestions(): void {
  const input = document.querySelector<HTMLInputElement>('#localsearch-input')
  const query = input?.value.trim() ?? ''

  if (hostEl) hostEl.hidden = Boolean(query)

  if (loadingEl) {
    const hasResults = Boolean(
      document.querySelector(
        '.VPLocalSearchBox .results .result, .VPLocalSearchBox .results .no-results'
      )
    )
    loadingEl.hidden = !query || hasResults
  }
}

function cleanupSuggestions(): void {
  attachRun += 1
  suggestionsTarget.value = null
  const input = document.querySelector<HTMLInputElement>('#localsearch-input')
  input?.removeEventListener('input', syncSuggestions)
  resultsObserver?.disconnect()
  resultsObserver = null
  hostEl?.remove()
  hostEl = null
  loadingEl?.remove()
  loadingEl = null
}

function waitForResults(): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    let attempts = 0
    const check = (): void => {
      const results = document.querySelector<HTMLElement>('.VPLocalSearchBox .results')
      if (results?.parentElement) {
        resolve(results)
        return
      }
      if (++attempts >= 60) {
        resolve(null)
        return
      }
      window.setTimeout(check, 50)
    }
    check()
  })
}

async function attachSuggestions(): Promise<void> {
  cleanupSuggestions()
  const run = ++attachRun

  await nextTick()
  const results = await waitForResults()
  if (!results || run !== attachRun || !open.value || !results.parentElement) return

  const host = document.createElement('div')
  host.className = 'ai-search-suggestions-host'
  results.parentElement.insertBefore(host, results)

  const loading = document.createElement('div')
  loading.className = 'ai-search-loading'
  loading.setAttribute('role', 'status')
  loading.setAttribute('aria-live', 'polite')
  loading.innerHTML =
    '<span class="ai-search-spinner" aria-hidden="true"></span><span>جارٍ البحث في الدروس…</span>'
  loading.hidden = true
  results.parentElement.insertBefore(loading, results)

  hostEl = host
  loadingEl = loading
  suggestionsTarget.value = host

  resultsObserver = new MutationObserver(syncSuggestions)
  resultsObserver.observe(results, { childList: true, subtree: true })

  const input = document.querySelector<HTMLInputElement>('#localsearch-input')
  input?.addEventListener('input', syncSuggestions)
  syncSuggestions()
  input?.focus()
}

function openSearch(): void {
  if (open.value) return
  try {
    // Start each search from a clean query so suggestions and recent searches are visible.
    window.sessionStorage.removeItem('vitepress:local-search-filter')
  } catch {
    // Session storage may be unavailable; the search still works.
  }
  open.value = true
  void attachSuggestions()
}

function selectSuggestion(term: string): void {
  const input = document.querySelector<HTMLInputElement>('#localsearch-input')
  if (!input) return

  addRecent(term)
  input.value = term
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.focus()
  syncSuggestions()
}

async function prefetchSearchIndex(): Promise<void> {
  if (indexPrefetched) return

  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection
  if (
    typeof navigator !== 'undefined' &&
    (!navigator.onLine || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? ''))
  ) {
    return
  }

  indexPrefetched = true
  try {
    // Warm the local search index when the user shows intent to search.
    const module = await import('@localSearchIndex')
    const loaders = (module.default ?? module) as Record<string, (() => Promise<unknown>) | undefined>
    await loaders.root?.()
  } catch {
    // Prefetch is an optimization only; opening search still loads the index.
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
    event.stopImmediatePropagation()
    close()
    // Let VPLocalSearchBox finish unmounting before restoring focus.
    window.setTimeout(() => searchButton?.focus(), 60)
    return
  }

  const commandK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
  const slash = event.key === '/' && !isEditingContent(event)

  if (commandK || slash) {
    event.preventDefault()
    event.stopImmediatePropagation()
    openSearch()
  }
}

function onOpenEvent(): void {
  openSearch()
}

onMounted(() => {
  mounted.value = true
  recentSearches.value = readRecent()
  window.addEventListener('keydown', onKeydown, true)
  window.addEventListener('ai-open-search', onOpenEvent)

  searchButton = document.querySelector<HTMLElement>('button[title*="Ctrl + K"]')
  searchButton?.addEventListener('pointerenter', prefetchSearchIndex, {
    once: true,
    passive: true
  })
  searchButton?.addEventListener('focus', prefetchSearchIndex, { once: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('ai-open-search', onOpenEvent)
  searchButton?.removeEventListener('pointerenter', prefetchSearchIndex)
  searchButton?.removeEventListener('focus', prefetchSearchIndex)
  searchButton = null
  cleanupSuggestions()
})
</script>

<style scoped>
.global-search-root {
  display: contents;
}

:global(.ai-search-suggestions-host) {
  display: block;
  padding: 0 2px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

:global(.ai-search-suggestions-host[hidden]) {
  display: none;
}
</style>
