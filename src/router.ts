import type { RouteRecordRaw } from "vue-router";
import Home from "./pages/Home.vue";
import Architecture from "./pages/Architecture.vue";
import Coding from "./pages/Coding.vue";
import Misc from "./pages/Misc.vue";
import NotFound from "./pages/NotFound.vue";

export const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: Home },
  { path: "/architecture", name: "architecture", component: Architecture },
  { path: "/coding", name: "coding", component: Coding },
  { path: "/misc", name: "misc", component: Misc },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound },
];
