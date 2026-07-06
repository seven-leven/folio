import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// base "./" keeps asset URLs relative so the site works from a GitHub Pages
// project subpath (e.g. user.github.io/folio/) together with hash routing.
export default defineConfig({
  base: "./",
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: "dist",
  },
});
