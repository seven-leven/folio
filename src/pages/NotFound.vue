<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div class="py-24 text-center">
    <h1 class="font-display text-6xl font-bold">404</h1>
    <p class="mt-4 text-muted">This page doesn't exist (yet).</p>
    <RouterLink to="/" class="mt-6 inline-block text-accent hover:underline">
      ← Back home
    </RouterLink>
  </div>
</template>
