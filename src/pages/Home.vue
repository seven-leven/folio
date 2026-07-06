<script setup lang="ts">
import { RouterLink } from "vue-router";
import { home } from "../data/home.ts";
import { socials, email } from "../data/socials.ts";

const sections = [
  { to: "/architecture", label: "Architecture", blurb: "Studio designs, trips, thesis & precedent studies." },
  { to: "/coding", label: "Coding", blurb: "Bots, games, data and web projects." },
  { to: "/misc", label: "Misc", blurb: "Sketches, drawings, Blender & more." },
];
</script>

<template>
  <!-- Intro -->
  <section class="mb-14">
    <p class="text-sm uppercase tracking-widest text-accent">{{ home.role }}</p>
    <h1 class="mt-2 font-display text-4xl font-bold sm:text-5xl">{{ home.name }}</h1>
    <p class="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{{ home.statement }}</p>
  </section>

  <!-- Section links -->
  <section class="mb-16 grid gap-5 sm:grid-cols-3">
    <RouterLink
      v-for="s in sections"
      :key="s.to"
      :to="s.to"
      class="rounded-lg border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <h2 class="font-display text-xl font-semibold">{{ s.label }}</h2>
      <p class="mt-2 text-sm text-muted">{{ s.blurb }}</p>
    </RouterLink>
  </section>

  <!-- Work & Education -->
  <section class="mb-16 grid gap-10 sm:grid-cols-2">
    <div>
      <h2 class="mb-4 font-display text-2xl font-semibold">Work</h2>
      <ul class="space-y-2 text-muted">
        <li v-for="w in home.work" :key="w">{{ w }}</li>
      </ul>
    </div>
    <div>
      <h2 class="mb-4 font-display text-2xl font-semibold">Education</h2>
      <ul class="space-y-2 text-muted">
        <li v-for="e in home.education" :key="e">{{ e }}</li>
      </ul>
    </div>
  </section>

  <!-- Contact -->
  <section
    id="contact"
    class="rounded-lg border border-line bg-white p-8 text-center"
  >
    <h2 class="font-display text-2xl font-semibold">Get in touch</h2>
    <a :href="`mailto:${email}`" class="mt-2 block text-accent hover:underline">{{ email }}</a>
    <div class="mt-4 flex justify-center gap-6 text-sm text-muted">
      <a
        v-for="s in socials"
        :key="s.label"
        :href="s.url"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-ink"
      >{{ s.label }}</a>
    </div>
  </section>
</template>
