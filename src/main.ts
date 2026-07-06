import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import { routes } from "./router.ts";
import "./styles/main.css";

const router = createRouter({
  // Hash history so deep links work on GitHub Pages without server config.
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

createApp(App).use(router).mount("#app");
