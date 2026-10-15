/* The shape of the Wildlife Illustrated code over time, for code-wildlife.html.
 *
 * <div class="pk-evo" data-evo> becomes two rows of bars, one bar per layer of
 * the app, whose heights follow the lines of code in that layer at ten points
 * in the project's history. It steps through them by itself while on screen,
 * and stops for good once the reader picks a step.
 *
 * The numbers were counted from the bird_dash repository at the commit named
 * in each stage (tests and type declarations excluded from the app's layers).
 */
(() => {
  "use strict";

  // Left to right is the direction of imports: a layer only uses those to its left.
  const SITE = [
    ["types", "Types", "the shapes of the data"],
    ["lib", "Helpers", "plain functions"],
    ["composables", "Composables", "reusable logic"],
    ["stores", "Stores", "the app's state"],
    ["components", "Components", "what you see"],
    ["app", "App.vue", "the top of the app"],
  ];
  const AROUND = [
    ["styles", "Styles", "CSS"],
    ["pipeline", "Pipeline", "build scripts"],
    ["tests", "Tests", ""],
  ];

  // [lines, files] per layer
  const STAGES = [
    {
      when: "May 2025",
      version: "0.4",
      commit: "60e8403",
      title: "One file and a card",
      text: "The first Vue version. App.vue does everything; one component draws a card.",
      d: { app: [119, 1], components: [61, 1], styles: [224, 3] },
    },
    {
      when: "Dec 2025",
      version: "0.4",
      commit: "6d675f5",
      title: "It only grows",
      text: "Seven months of features, all added to the same file. The styles double.",
      d: { app: [325, 1], components: [71, 1], styles: [468, 3] },
    },
    {
      when: "Jan 2026",
      version: "0.5",
      commit: "dd38c2f",
      title: "Tailwind, and the first scripts",
      text: "The stylesheet all but disappears. Two build scripts enter the repository.",
      d: { app: [282, 1], components: [362, 2], styles: [35, 1], pipeline: [117, 2], lib: [3, 1] },
    },
    {
      when: "Feb 2026",
      version: "0.6",
      commit: "9f656d1",
      title: "Features pile into components",
      text: "Search, the full-size view and the info panel arrive as five large components.",
      d: { app: [358, 1], components: [1012, 5], styles: [47, 1], pipeline: [862, 4] },
    },
    {
      when: "10 Mar 2026",
      version: "0.7",
      commit: "f1d3d10",
      title: "Collections arrive",
      text: "Sharks and shells are in. App.vue is back to 427 lines, its second peak.",
      d: { app: [427, 1], components: [936, 5], styles: [47, 1], pipeline: [946, 10], lib: [105, 1] },
    },
    {
      when: "14 Mar 2026",
      version: "0.7",
      commit: "08489fb",
      title: "The split",
      text: "Four days later the logic has moved out into composables, and the types have a home.",
      d: {
        app: [190, 1],
        components: [1010, 7],
        composables: [757, 9],
        types: [325, 5],
        styles: [47, 1],
        pipeline: [854, 9],
      },
    },
    {
      when: "5 Jul 2026",
      version: "0.8",
      commit: "65480cd",
      title: "Many small parts",
      text: "The same amount of interface, cut into 27 components by feature.",
      d: {
        app: [197, 1],
        components: [1240, 27],
        composables: [969, 14],
        types: [218, 4],
        styles: [113, 1],
        pipeline: [852, 11],
      },
    },
    {
      when: "13 Jul 2026",
      version: "0.9",
      commit: "591607b",
      title: "Stores, and the first tests",
      text: "State gets its own layer. App.vue drops under 100 lines. Tests appear.",
      d: {
        app: [93, 1],
        components: [1189, 15],
        composables: [1017, 15],
        stores: [198, 5],
        types: [152, 4],
        lib: [8, 1],
        styles: [113, 1],
        pipeline: [828, 13],
        tests: [581, 15],
      },
    },
    {
      when: "Sep 2026",
      version: "0.9",
      commit: "f07a06c",
      title: "Tests outgrow everything",
      text: "More lines of tests than of composables and components put together.",
      d: {
        app: [114, 1],
        components: [1251, 15],
        composables: [1205, 15],
        stores: [199, 5],
        types: [152, 4],
        lib: [13, 2],
        styles: [113, 1],
        pipeline: [1036, 14],
        tests: [2546, 39],
      },
    },
    {
      when: "Oct 2026",
      version: "0.9",
      commit: "74f405e",
      title: "Today",
      text: "Six layers, each importing only from those to its left. App.vue is 104 lines.",
      d: {
        app: [104, 1],
        components: [1543, 18],
        composables: [1133, 13],
        stores: [262, 5],
        types: [166, 5],
        lib: [163, 6],
        styles: [376, 1],
        pipeline: [1669, 18],
        tests: [3547, 53],
      },
    },
  ];

  const STEP_MS = 3200;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n) => n.toLocaleString("en-GB");
  const peak = (keys) => Math.max(...STAGES.flatMap((s) => keys.map(([k]) => (s.d[k] ? s.d[k][0] : 0))));

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function row(heading, note, layers) {
    const wrap = el("div", "pk-evo__group");
    const head = el("p", "pk-evo__heading", heading);
    head.append(el("span", "", note));
    const bars = el("div", "pk-evo__bars");
    bars.style.setProperty("--n", layers.length);
    const max = peak(layers);
    const cols = layers.map(([key, name, hint]) => {
      const col = el("div", "pk-evo__col");
      col.dataset.layer = key;
      const track = el("div", "pk-evo__track");
      const bar = el("div", "pk-evo__bar");
      const value = el("b", "pk-evo__value");
      bar.append(value);
      track.append(bar);
      const label = el("p", "pk-evo__label", name);
      const files = el("span", "pk-evo__files", hint);
      label.append(files);
      col.append(track, label);
      bars.append(col);
      return { key, hint, col, bar, value, files, max };
    });
    wrap.append(head, bars);
    return { wrap, cols };
  }

  function init(root) {
    root.textContent = "";
    root.classList.add("is-ready");

    const caption = el("div", "pk-evo__caption");
    const when = el("p", "pk-evo__when");
    const title = el("p", "pk-evo__title");
    const text = el("p", "pk-evo__text");
    caption.append(when, title, text);

    const site = row("The site", "imports point left: each layer only uses the ones before it", SITE);
    const around = row("Around it", "its own scale", AROUND);
    const cols = [...site.cols, ...around.cols];

    const controls = el("div", "pk-evo__controls");
    const play = el("button", "pk-evo__play");
    play.type = "button";
    const steps = el("div", "pk-evo__steps");
    steps.setAttribute("role", "group");
    steps.setAttribute("aria-label", "Point in the project's history");
    const buttons = STAGES.map((s, i) => {
      const b = el("button", "", s.when);
      b.type = "button";
      b.addEventListener("click", () => {
        stop();
        caption.setAttribute("aria-live", "polite");
        show(i);
      });
      steps.append(b);
      return b;
    });
    controls.append(play, steps);
    root.append(caption, site.wrap, around.wrap, controls);

    let at = 0;
    let timer = null;
    let onScreen = false;
    let wanted = !reduceMotion; // the reader has not taken over yet

    function show(i) {
      at = i;
      const s = STAGES[i];
      when.textContent = `${s.when} · v${s.version}`;
      title.textContent = s.title;
      text.textContent = s.text;
      for (const c of cols) {
        const v = s.d[c.key];
        c.col.classList.toggle("is-empty", !v);
        c.bar.style.height = v ? `${Math.max(1.5, (v[0] / c.max) * 100)}%` : "0%";
        c.value.textContent = v ? fmt(v[0]) : "";
        c.files.textContent = v ? (v[1] === 1 ? "1 file" : `${v[1]} files`) : "not yet";
      }
      buttons.forEach((b, j) => {
        b.classList.toggle("is-active", j === i);
        b.setAttribute("aria-pressed", String(j === i));
      });
    }

    function tick() {
      show((at + 1) % STAGES.length);
    }
    function start() {
      if (timer || !wanted || !onScreen) return;
      timer = setInterval(tick, STEP_MS);
      play.textContent = "Pause";
    }
    function pause() {
      clearInterval(timer);
      timer = null;
      play.textContent = "Play";
    }
    function stop() {
      wanted = false;
      pause();
    }
    play.addEventListener("click", () => {
      if (timer) return stop();
      wanted = true;
      if (at === STAGES.length - 1) show(0);
      start();
    });

    show(0);
    play.textContent = "Play";
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else pause();
      }, { threshold: 0.4 }).observe(root);
    } else {
      onScreen = true;
      start();
    }
  }

  document.querySelectorAll("[data-evo]").forEach(init);
})();
