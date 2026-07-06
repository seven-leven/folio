<script setup lang="ts">
import type { ItemGroup } from "../data/types.ts";
import ImageCard from "./ImageCard.vue";

defineProps<{ group: ItemGroup }>();
</script>

<template>
  <section class="mb-14">
    <h2 class="mb-5 font-display text-2xl font-semibold">
      {{ group.title }}
    </h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <ImageCard v-for="item in group.items" :key="item.title" :item="item" />
    </div>
  </section>
</template>
