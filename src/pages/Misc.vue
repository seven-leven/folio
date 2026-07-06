<script setup lang="ts">
import { miscGroups } from "../data/misc.ts";
import ItemGroupSection from "../components/ItemGroupSection.vue";
</script>

<template>
  <header class="mb-10">
    <h1 class="font-display text-4xl font-bold">Misc</h1>
    <p class="mt-2 text-muted">Art, making and drawings.</p>
  </header>

  <ItemGroupSection
    v-for="group in miscGroups"
    :key="group.title"
    :group="group"
  />
</template>
