<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";
import SiteFooter from "./components/SiteFooter.vue";
</script>

<template>
  <Navbar />
  <main class="mx-auto min-h-[70vh] max-w-5xl px-5 py-10">
    <RouterView />
  </main>
  <SiteFooter />
</template>
