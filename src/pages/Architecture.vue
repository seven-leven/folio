<script setup lang="ts">
import { architectureGroups } from "../data/architecture.ts";
import ItemGroupSection from "../components/ItemGroupSection.vue";
</script>

<template>
  <header class="mb-10">
    <h1 class="font-display text-4xl font-bold">Architecture &amp; Engineering</h1>
    <p class="mt-2 text-muted">Studio designs, trips, thesis and precedent studies.</p>
  </header>

  <ItemGroupSection
    v-for="group in architectureGroups"
    :key="group.title"
    :group="group"
  />
</template>
