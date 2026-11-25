<template>
  <span class="phase-badge">المرحلة {{ phaseId }}</span>
</template>

<script setup lang="ts">
defineProps<{
  phaseId: string | number
}>()
</script>

<style scoped>
.phase-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.28rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffffff;
  background: var(--lagune-strong);
  border: 2px solid var(--lagune);
  border-radius: 999px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
