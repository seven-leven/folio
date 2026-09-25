/* Animations for the Coding timeline on the homepage.
 *
 * Each timeline entry has a <canvas data-vis="name"> (the donut uses a <pre>),
 * drawn by the module in visuals/ registered under that name below. A module's
 * default export is a factory, factory(element, data) => { draw(t), still }:
 * draw(t) renders the scene at t seconds and `still` is the time to show when
 * the viewer prefers reduced motion. A module that needs data exports
 * `data` (a URL to a JSON file in assets/data/, made by tools/data/).
 *
 * Visuals are created (and their data fetched) only when they come near the
 * screen, and only those on screen animate, at about 30 frames per second.
 */
import { reduceMotion } from "./core.js";
import * as anime from "./visuals/anime.js";
import * as archiver from "./visuals/archiver.js";
import * as autocad from "./visuals/autocad.js";
import * as coastal from "./visuals/coastal.js";
import * as coup from "./visuals/coup.js";
import * as discord from "./visuals/discord.js";
import * as donut from "./visuals/donut.js";
import * as knight from "./visuals/knight.js";
import * as lightNovels from "./visuals/light-novels.js";
import * as mancalaBot from "./visuals/mancala-bot.js";
import * as mancalaCli from "./visuals/mancala-cli.js";
import * as pipeline from "./visuals/pipeline.js";
import * as radar from "./visuals/radar.js";
import * as sieve from "./visuals/sieve.js";
import * as titanic from "./visuals/titanic.js";
import * as traffic from "./visuals/traffic.js";
import * as ventilation from "./visuals/ventilation.js";
import * as wildlife from "./visuals/wildlife.js";
import * as wind from "./visuals/wind.js";

const VISUALS = {
  anime,
  archiver,
  autocad,
  coastal,
  coup,
  discord,
  donut,
  knight,
  lightNovels,
  mancalaBot,
  mancalaCli,
  pipeline,
  radar,
  sieve,
  titanic,
  traffic,
  ventilation,
  wildlife,
  wind,
};

const dataCache = new Map();
function loadData(url) {
  if (!dataCache.has(url.href)) {
    dataCache.set(
      url.href,
      fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status} ${url}`)))),
    );
  }
  return dataCache.get(url.href);
}

function init() {
  const items = [...document.querySelectorAll("[data-vis]")]
    .filter((el) => VISUALS[el.dataset.vis])
    .map((el) => ({ el, mod: VISUALS[el.dataset.vis], vis: null, t: 0, on: false }));
  if (!items.length) return;

  const noObserver = !("IntersectionObserver" in window);
  const drawStill = (it) => it.vis?.draw(it.vis.still);

  async function create(it) {
    if (it.vis || it.creating) return;
    it.creating = true;
    try {
      const data = it.mod.data ? await loadData(it.mod.data) : undefined;
      it.vis = it.mod.default(it.el, data);
      if (reduceMotion || noObserver) drawStill(it);
      else it.vis.draw(it.vis.still ?? 0); // a first frame, so nothing is blank before it animates
      start();
    } catch (err) {
      console.warn(`Coding timeline: couldn't draw "${it.el.dataset.vis}"`, err);
    }
  }

  // Reduced motion (or no IntersectionObserver): draw each still frame, redraw on resize.
  if (reduceMotion || noObserver) {
    if (noObserver) items.forEach(create);
    let timer;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => items.forEach(drawStill), 150);
    });
  }

  // Create visuals shortly before they scroll into view.
  if (!noObserver) {
    const near = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        near.unobserve(e.target);
        create(items.find((i) => i.el === e.target));
      });
    }, { rootMargin: "600px 0px" });
    items.forEach((it) => near.observe(it.el));
  }
  if (reduceMotion || noObserver) return;

  // Animate the ones on screen.
  let raf = 0;
  let last = 0;
  const loop = (now) => {
    raf = 0;
    const running = items.filter((it) => it.on && it.vis);
    if (!running.length || document.hidden) return;
    if (now - last >= 32) {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      running.forEach((it) => {
        it.t += dt;
        it.vis.draw(it.t);
      });
    }
    raf = requestAnimationFrame(loop);
  };
  function start() {
    if (!raf && !document.hidden && items.some((it) => it.on && it.vis)) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  const onScreen = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const it = items.find((i) => i.el === e.target);
      if (it) it.on = e.isIntersecting;
    });
    start();
  });
  items.forEach((it) => onScreen.observe(it.el));
  document.addEventListener("visibilitychange", start);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
