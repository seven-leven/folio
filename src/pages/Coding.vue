<script setup lang="ts">
import { codingProjects, githubUrl } from "../data/coding.ts";
import ImageCard from "../components/ImageCard.vue";
</script>

<template>
  <header class="mb-10">
    <h1 class="font-display text-4xl font-bold">Coding</h1>
    <p class="mt-2 text-muted">Bots, games, data experiments and web projects.</p>
  </header>

  <a
    :href="githubUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="mb-12 flex items-center justify-between rounded-lg border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div>
      <h2 class="font-display text-xl font-semibold">Explore my GitHub</h2>
      <p class="mt-1 text-sm text-muted">Repositories, contributions and activity.</p>
    </div>
    <span class="text-2xl">→</span>
  </a>

  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <ImageCard v-for="p in codingProjects" :key="p.title" :item="p" />
  </div>
</template>
