<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/architecture", label: "Architecture" },
  { to: "/coding", label: "Coding" },
  { to: "/misc", label: "Misc" },
];

const open = ref(false);
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
      <RouterLink to="/" class="font-display text-xl font-bold tracking-tight">
        Folio
      </RouterLink>

      <div class="hidden gap-6 sm:flex">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-muted transition hover:text-ink"
          active-class="!text-ink"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <button
        class="sm:hidden"
        type="button"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <span class="block text-2xl leading-none">{{ open ? "✕" : "☰" }}</span>
      </button>
    </div>

    <div v-if="open" class="border-t border-line sm:hidden">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block px-5 py-3 text-sm font-medium text-muted hover:bg-line/40"
        active-class="!text-ink"
        @click="open = false"
      >
        {{ link.label }}
      </RouterLink>
    </div>
  </nav>
</template>
