<script setup lang="ts">
import { socials } from "../data/socials.ts";
</script>

<template>
  <footer class="mt-16 border-t border-line">
    <div
      class="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:justify-between"
    >
      <p>© {{ new Date().getFullYear() }} · CC BY-NC</p>
      <div class="flex gap-5">
        <a
          v-for="s in socials"
          :key="s.label"
          :href="s.url"
          target="_blank"
          rel="noopener noreferrer"
          class="transition hover:text-ink"
        >
          {{ s.label }}
        </a>
      </div>
    </div>
  </footer>
</template>
