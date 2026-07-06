<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import type { PortfolioItem } from "../data/types.ts";
import { onImageError } from "../utils/image.ts";

const props = defineProps<{ item: PortfolioItem }>();

const isInternal = computed(() => props.item.link?.startsWith("/") ?? false);
const isExternal = computed(
  () => !!props.item.link && !isInternal.value,
);
const statusLabel = computed(() => {
  if (props.item.status === "wip") return "In progress";
  if (props.item.status === "planned") return "Coming soon";
  return null;
});
</script>

<template>
  <component
    :is="isInternal ? RouterLink : isExternal ? 'a' : 'div'"
    :to="isInternal ? item.link : undefined"
    :href="isExternal ? item.link : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    class="group block overflow-hidden rounded-lg border border-line bg-white transition"
    :class="item.link ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : 'opacity-80'"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-line/40">
      <img
        :src="item.image"
        :alt="item.title"
        loading="lazy"
        @error="onImageError"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
      <span
        v-if="statusLabel"
        class="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-medium text-paper"
      >{{ statusLabel }}</span>
    </div>
    <div class="p-4">
      <h3 class="font-display text-lg font-semibold">{{ item.title }}</h3>
      <p class="mt-1 text-sm text-muted">{{ item.description }}</p>
    </div>
  </component>
</template>
