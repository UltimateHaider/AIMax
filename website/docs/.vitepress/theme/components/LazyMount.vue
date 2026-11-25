<template>
  <div
    ref="root"
    class="lazy-mount"
    :style="visible ? undefined : { minHeight }"
    :aria-busy="visible ? undefined : 'true'"
  >
    <slot v-if="visible" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    minHeight?: string
    rootMargin?: string
  }>(),
  {
    minHeight: '360px',
    rootMargin: '0px'
  }
)

const visible = ref(false)
const root = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

function reveal(): void {
  visible.value = true
  observer?.disconnect()
  observer = null
}

onMounted(() => {
  if (!('IntersectionObserver' in window)) {
    reveal()
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) reveal()
    },
    {
      rootMargin: props.rootMargin,
      threshold: 0
    }
  )

  if (root.value) observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.lazy-mount {
  width: 100%;
}
</style>
