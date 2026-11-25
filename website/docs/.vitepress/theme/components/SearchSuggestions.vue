<template>
  <div class="search-suggestions" dir="rtl">
    <section v-if="recent.length" class="suggestion-group" aria-labelledby="recent-searches-title">
      <div class="suggestion-heading">
        <span id="recent-searches-title" class="suggestion-label">
          <Clock3 :size="14" aria-hidden="true" />
          عمليات بحث أخيرة
        </span>
        <button type="button" class="suggestion-clear" @click="emit('clear')">
          مسح
        </button>
      </div>
      <div class="suggestion-chips">
        <button
          v-for="term in recent"
          :key="`recent-${term}`"
          type="button"
          class="suggestion-chip suggestion-chip--recent"
          @click="emit('select', term)"
        >
          <Clock3 :size="12" aria-hidden="true" />
          {{ term }}
        </button>
      </div>
    </section>

    <section class="suggestion-group" aria-labelledby="popular-searches-title">
      <div class="suggestion-heading">
        <span id="popular-searches-title" class="suggestion-label">
          <Sparkles :size="14" aria-hidden="true" />
          جرّب البحث عن
        </span>
      </div>
      <div class="suggestion-chips">
        <button
          v-for="term in popular"
          :key="`popular-${term}`"
          type="button"
          class="suggestion-chip"
          @click="emit('select', term)"
        >
          {{ term }}
        </button>
      </div>
    </section>

    <p class="suggestion-hint">
      اكتب كلمة أو عبارة، وستظهر النتائج مع مقتطفات من الدروس وإبراز مواضع التطابق.
    </p>
  </div>
</template>

<script setup lang="ts">
import { Clock3, Sparkles } from 'lucide-vue-next'

defineProps<{
  recent: string[]
  popular: string[]
}>()

const emit = defineEmits<{
  select: [term: string]
  clear: []
}>()
</script>

<style scoped>
.search-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0.2rem 0.15rem 0.1rem;
  text-align: start;
}

.suggestion-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.suggestion-heading {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;
}

.suggestion-label {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

.suggestion-clear {
  padding: 0.15rem 0.4rem;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 5px;
}

.suggestion-clear:hover {
  color: var(--nectarine-text);
  background: color-mix(in srgb, var(--nectarine) 12%, transparent);
}

.suggestion-clear:focus-visible,
.suggestion-chip:focus-visible {
  outline: 2px solid var(--lagune-text);
  outline-offset: 2px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.suggestion-chip {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
  padding: 0.4rem 0.7rem;
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: var(--bg);
  border: 2px solid var(--lagune);
  border-radius: 999px;
  box-shadow: var(--neo-shadow-sm);
  transition: color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease,
    box-shadow 0.2s ease;
}

.suggestion-chip:hover {
  color: var(--lagune-text);
  background: color-mix(in srgb, var(--lagune) 13%, transparent);
  border-color: var(--lagune-text);
}

.suggestion-chip--recent {
  color: var(--peche-text);
  border-color: var(--peche);
}

.suggestion-chip--recent:hover {
  color: var(--peche-text);
  background: color-mix(in srgb, var(--peche) 14%, transparent);
  border-color: var(--peche-text);
}

.suggestion-hint {
  margin: 0;
  font-size: 0.7rem;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

@media (prefers-reduced-motion: reduce) {
  .suggestion-chip {
    transition: none;
  }
}
</style>
