/* Animated visuals for the Coding timeline on the homepage.
 *
 * Each timeline entry has a <canvas data-vis="name"> (the donut uses a <pre>).
 * A visual is a factory: VISUALS[name](el) returns { draw(t), still }, where
 * draw(t) renders the scene at t seconds of animation time and `still` is the
 * time to show when the viewer prefers reduced motion. Only visuals on screen
 * advance, at about 30 frames per second.
 */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const COL = {
    paper: "#f6f4ef",
    dim: "rgba(246, 244, 239, 0.55)",
    faint: "rgba(246, 244, 239, 0.16)",
    ghost: "rgba(246, 244, 239, 0.07)",
    accent: "#e39a86",
    accentSoft: "rgba(227, 154, 134, 0.35)",
    blue: "#8fbde6",
    blueSoft: "rgba(143, 189, 230, 0.35)",
    red: "#d9695f",
    sand: "#d8bd8c",
    panel: "rgba(0, 0, 0, 0.32)",
  };
  const SANS = '"Inter", system-ui, sans-serif';
  const MONO = 'ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace';

  // Every canvas scene is drawn in a 360 x 270 design space, scaled to fit.
  const W = 360;
  const H = 270;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  const lerp = (a, b, k) => a + (b - a) * k;

  function surface(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    let s = canvas._surface;
    if (!s || s.w !== w || s.h !== h || s.dpr !== dpr) {
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      s = canvas._surface = { ctx: canvas.getContext("2d"), w, h, dpr };
    }
    const { ctx } = s;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform((dpr * w) / W, 0, 0, (dpr * h) / H, 0, 0);
    ctx.textBaseline = "middle";
    return ctx;
  }

  function text(ctx, str, x, y, { size = 11, color = COL.dim, font = SANS, align = "left", weight = 400 } = {}) {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  /** Deterministic pseudo-random numbers, so loops replay identically. */
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const VISUALS = {};

  // --- May 2021: Archiver.bat -------------------------------------------------
  // Type the menu choices, make numbered volume folders, then zip them to .cbz.
  VISUALS.archiver = (canvas) => {
    const lines = [
      { at: 0.2, str: "Enter your selection (1-4): 1" },
      { at: 1.4, str: "No.of volumes: 8" },
      { at: 5.0, str: "Enter your selection (1-4): 2" },
    ];
    const PERIOD = 11;
    const typed = (line, t) => {
      const prompt = line.str.lastIndexOf(":") + 2;
      const n = Math.floor((t - line.at) * 22);
      return n <= 0 ? "" : line.str.slice(0, Math.min(line.str.length, prompt + Math.max(0, n - prompt)));
    };

    function folder(ctx, x, y, label, zip, alpha) {
      ctx.globalAlpha = alpha;
      if (!zip) {
        ctx.fillStyle = COL.accent;
        roundRect(ctx, x, y + 4, 30, 22, 3);
        ctx.fill();
        roundRect(ctx, x, y, 13, 8, 2);
        ctx.fill();
      } else {
        ctx.fillStyle = COL.blue;
        roundRect(ctx, x + 4, y, 22, 26, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        for (let i = 0; i < 5; i++) ctx.fillRect(x + 13, y + 3 + i * 4, 4, 2);
      }
      text(ctx, zip ? label + ".cbz" : label, x + 15, y + 36, { size: 9, color: COL.dim, align: "center", font: MONO });
      ctx.globalAlpha = 1;
    }

    return {
      still: 9,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const fade = t > PERIOD - 0.6 ? (PERIOD - t) / 0.6 : 1;
        ctx.globalAlpha = fade;

        // Terminal
        ctx.fillStyle = COL.panel;
        roundRect(ctx, 10, 10, 340, 104, 8);
        ctx.fill();
        ["1. Create Folders", "2. Folders to cbr", "3. Misc", "4. Exit"].forEach((s, i) =>
          text(ctx, s, 22, 26 + i * 13, { size: 10, font: MONO, color: COL.dim })
        );
        lines.forEach((line, i) => {
          if (t < line.at) return;
          const y = 26 + (4 + i) * 13;
          text(ctx, typed(line, t), 22, y, { size: 10, font: MONO, color: COL.paper });
        });
        // Blinking cursor on the active line
        const active = [...lines].reverse().find((l) => t >= l.at) || lines[0];
        if (Math.floor(t * 2) % 2 === 0 && t < 7) {
          const idx = lines.indexOf(active);
          const y = 26 + (4 + idx) * 13;
          ctx.font = `400 10px ${MONO}`;
          const x = 22 + ctx.measureText(typed(active, t)).width + 2;
          ctx.fillStyle = COL.paper;
          ctx.fillRect(x, y - 5, 6, 10);
        }
        ctx.globalAlpha = fade;

        // Folders appear one by one (MD "Title v1" ...), then turn into archives.
        for (let i = 0; i < 8; i++) {
          const appear = 2.2 + i * 0.3;
          if (t < appear) continue;
          const zipped = t > 5.9 + i * 0.3;
          const x = 26 + (i % 4) * 82;
          const y = 130 + Math.floor(i / 4) * 64;
          const pop = ease((t - appear) / 0.3);
          folder(ctx, x + 14, y + (1 - pop) * 8, `Title v${i + 1}`, zipped, pop * fade);
        }
        ctx.globalAlpha = 1;
      },
    };
  };

  // --- Sep 2021: the spinning ASCII donut --------------------------------------
  // A torus sampled in (theta, phi), rotated about two axes, projected with a
  // z-buffer and shaded by the surface normal, like the original Python version.
  VISUALS.donut = (pre) => {
    const COLS = 56;
    const ROWS = 28;
    const R1 = 1;
    const R2 = 2;
    const K2 = 5;
    const K1 = (COLS * K2 * 3) / (8 * (R1 + R2));
    const CHARS = ".,-~:;=!*#$@";
    const out = new Array(COLS * ROWS);
    const z = new Float32Array(COLS * ROWS);

    function frame(A, B) {
      out.fill(" ");
      z.fill(0);
      const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
      for (let th = 0; th < 6.283; th += 0.07) {
        const ct = Math.cos(th), st = Math.sin(th);
        for (let ph = 0; ph < 6.283; ph += 0.02) {
          const cp = Math.cos(ph), sp = Math.sin(ph);
          const cx = R2 + R1 * ct, cy = R1 * st;
          const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
          const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
          const ooz = 1 / (K2 + cA * cx * sp + cy * sA);
          const xp = Math.floor(COLS / 2 + K1 * ooz * x);
          const yp = Math.floor(ROWS / 2 - K1 * 0.5 * ooz * y);
          if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) continue;
          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
          const i = xp + COLS * yp;
          if (L > 0 && ooz > z[i]) {
            z[i] = ooz;
            out[i] = CHARS[Math.min(CHARS.length - 1, Math.floor(L * 8))];
          }
        }
      }
      let s = "";
      for (let r = 0; r < ROWS; r++) s += out.slice(r * COLS, r * COLS + COLS).join("") + "\n";
      pre.textContent = s;
    }

    return { still: 0, draw: (t) => frame(1 + t * 1.2, 0.6 + t * 0.6) };
  };

  // --- Nov 2021: anime list in numbers -----------------------------------------
  VISUALS.anime = (canvas) => {
    // Completed titles by finish year, from the September 2026 export (2026 is partial).
    const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const eps = [133, 1642, 3297, 2521, 2326, 1545, 930, 581, 257, 72];
    const total = eps.reduce((a, b) => a + b, 0);
    const max = Math.max(...eps);
    const PERIOD = 10;
    return {
      still: 8,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const grow = (i) => ease((t - 0.4 - i * 0.35) / 0.7);
        let shown = 0;
        eps.forEach((e, i) => (shown += e * grow(i)));

        text(ctx, Math.round(shown).toLocaleString("en-US"), 18, 30, { size: 30, color: COL.paper, font: SANS, weight: 600 });
        text(ctx, "episodes finished", 20, 54, { size: 11, color: COL.dim });
        const doneFrac = shown / total;
        text(ctx, `1,360 titles · ≈ ${Math.round(212 * doneFrac)} days of watching`, 342, 30, {
          size: 10,
          color: COL.accent,
          align: "right",
        });

        const base = 236;
        const bw = 25;
        years.forEach((y, i) => {
          const x = 22 + i * 32.5;
          const h = (eps[i] / max) * 150 * grow(i);
          ctx.fillStyle = i === 2 ? COL.accent : COL.accentSoft;
          roundRect(ctx, x, base - h, bw, h, 3);
          ctx.fill();
          if (grow(i) > 0.95) text(ctx, eps[i].toLocaleString("en-US"), x + bw / 2, base - h - 9, { size: 9, align: "center", color: COL.dim });
          text(ctx, String(y), x + bw / 2, base + 14, { size: 9, align: "center", color: COL.dim });
        });
        ctx.fillStyle = COL.faint;
        ctx.fillRect(18, base, 324, 1);
      },
    };
  };

  // --- Jun 2022: the traffic model benchmark -----------------------------------
  // Real timings (average of 10,000 runs) for every version of the function.
  VISUALS.traffic = (canvas) => {
    const runs = [
      ["v1 · mine", 108.9], ["v2", 83.8], ["v3", 177.9], ["v4", 96.3], ["v5", 95.5, true],
      ["v6", 96.1, true], ["v7", 98.5, true], ["v8", 61.0], ["v9", 61.2], ["v10", 60.4],
      ["v11", 35.6], ["v12", 34.4], ["v13", 33.6], ["v14", 33.2], ["v15", 38.5], ["v16 · latest", 6.8],
    ];
    const max = 180;
    const PERIOD = 11;
    return {
      still: 9,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        text(ctx, "µs per run · shorter is faster", 18, 16, { size: 10, color: COL.dim });
        runs.forEach(([name, us, wrong], i) => {
          const y = 34 + i * 14.4;
          const k = ease((t - 0.3 - i * 0.28) / 0.6);
          const mine = i === 0;
          const best = i === runs.length - 1;
          text(ctx, name, 78, y, { size: 9, align: "right", color: mine || best ? COL.paper : COL.dim, weight: mine || best ? 600 : 400 });
          const w = (us / max) * 210 * k;
          ctx.fillStyle = wrong ? "rgba(217, 105, 95, 0.55)" : best ? COL.accent : mine ? COL.blue : COL.faint;
          roundRect(ctx, 86, y - 4.5, Math.max(w, 1), 9, 2);
          ctx.fill();
          if (k > 0.98) {
            const label = wrong ? `${us.toFixed(1)} · wrong answer` : `${us.toFixed(1)}`;
            text(ctx, label, 90 + w, y, { size: 9, color: wrong ? COL.red : best ? COL.accent : COL.dim });
          }
        });
        const k = ease((t - 5.2) / 0.8);
        if (k > 0) text(ctx, "16× faster than mine", 342, 16, { size: 10, align: "right", color: `rgba(227, 154, 134, ${k})`, weight: 600 });
      },
    };
  };

  // --- Nov 2023: coastal engineering assignments ------------------------------
  // Scene 1: longshore drift filling a groyne (time t in seconds, p = 0..1 filled).
  function groyneScene() {
    const GX = 190; // groyne position
    const SHORE = 150; // original shoreline
    const rand = rng(7);
    const grains = Array.from({ length: 70 }, () => ({ x: rand() * W, o: rand() * 6, s: 0.6 + rand() * 0.8 }));
    const shoreAt = (x, p) =>
      x < GX ? SHORE - 46 * p * Math.exp(-(GX - x) / 70) : SHORE + 22 * p * Math.exp(-(x - GX) / 60);

    return (ctx, time, p) => {
      // Sea
      const sea = ctx.createLinearGradient(0, 0, 0, SHORE);
      sea.addColorStop(0, "#15324a");
      sea.addColorStop(1, "#2d5877");
      ctx.fillStyle = sea;
      ctx.fillRect(0, 0, W, H);

      // Wave crests arriving at an angle
      ctx.strokeStyle = "rgba(246, 244, 239, 0.28)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        const off = ((time * 18 + i * 34) % 238) - 20;
        ctx.beginPath();
        ctx.moveTo(-40 + off * 0.35, off - 40);
        ctx.lineTo(W + 40 + off * 0.35, off - 40 + 70);
        ctx.stroke();
      }

      // Beach, with the shoreline built up updrift and eroded downdrift
      ctx.fillStyle = COL.sand;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) ctx.lineTo(x, shoreAt(x, p));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      // Original shoreline
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, SHORE);
      ctx.lineTo(W, SHORE);
      ctx.stroke();
      ctx.setLineDash([]);

      // Groyne
      ctx.fillStyle = "#6f6a62";
      roundRect(ctx, GX - 5, 70, 10, 150, 3);
      ctx.fill();

      // Sand grains drifting along the shore; they pile up until the groyne fills
      const bypass = p > 0.85;
      grains.forEach((g) => {
        let x = (g.x + time * 22 * g.s) % (W + 20);
        if (!bypass && x > GX - 8 && x < GX + 30) x = GX - 8 - g.o * 3;
        const y = shoreAt(x, p) - 4 - g.o;
        ctx.fillStyle = "rgba(246, 236, 210, 0.9)";
        ctx.fillRect(x, y, 2, 2);
      });

      // Drift arrow and labels
      text(ctx, "longshore drift →", 16, 18, { size: 10, color: COL.paper });
      text(ctx, `year ${Math.round(p * 20)}`, 344, 18, { size: 10, color: COL.paper, align: "right", font: MONO });
      text(ctx, bypass ? "full: sand bypasses the groyne" : "sand trapped updrift", 16, 236, { size: 10, color: "#3a3226" });
    };
  }

  // Scene 2: beach profile after each of three storms (assignment data), with the
  // sand eroded and deposited shaded. Volumes are the integrated areas, in m³/m.
  function profileScene() {
    const X = [-100.0, -90.0, -80.1, -70.1, -60.1, -50.2, -40.2, -30.2, -20.3, -10.3, -0.3, 9.6, 19.6, 29.6, 39.5, 49.5, 59.5, 69.4, 79.4, 89.4, 99.3, 109.3, 119.3, 129.2, 139.2, 149.2, 159.1, 169.1, 179.1, 189.0, 199.0, 209.0, 218.9, 228.9, 238.9, 248.8, 258.8, 268.8, 278.7, 288.7, 298.7, 308.6, 318.6, 328.6, 338.5, 348.5, 358.5, 368.4, 378.4, 388.4, 398.3, 408.3, 418.3, 428.2, 438.2, 448.2, 458.1, 468.1, 478.1, 488.0, 498.0];
    const P = [
      [5.0, 5.0, 5.0, 5.0, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 4.34, 3.43, 2.55, 1.62, 0.15, -0.03, -0.15, -0.17, -0.5, -0.9, -1.44, -1.96, -3.1, -4.01, -4.84, -5.21, -5.52, -5.76, -5.92, -6.08, -6.23, -6.36, -6.48, -6.59, -6.69, -6.75, -6.79, -6.8, -6.81, -6.8, -6.77, -6.77, -6.82, -6.9, -6.99, -7.14, -7.34, -7.56, -7.99, -8.44, -8.89, -9.33, -9.76, -10.19, -10.62, -11.08, -11.56, -12.04, -12.52, -13.0],
      [5.0, 5.0, 5.0, 5.0, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 4.99, 3.64, 1.48, 0.76, 0.16, -0.38, -0.85, -1.25, -1.6, -1.93, -2.25, -2.54, -2.82, -3.09, -3.35, -3.61, -3.86, -4.11, -4.35, -4.6, -4.84, -5.08, -5.32, -5.55, -5.78, -6.0, -6.21, -6.41, -6.65, -6.87, -7.05, -7.17, -7.28, -7.38, -7.5, -7.61, -7.74, -7.87, -8.0, -8.15, -8.32, -8.48, -8.65, -8.9, -9.33, -9.95, -10.62, -11.25, -11.83, -12.38, -13.0],
      [5.0, 5.0, 5.0, 5.0, 4.99, 4.99, 4.99, 4.99, 5.0, 3.39, 2.74, 1.54, 0.37, -0.35, -0.25, -0.31, -0.64, -1.06, -1.37, -1.64, -1.91, -2.3, -2.78, -2.98, -2.8, -3.01, -3.54, -3.94, -3.99, -3.91, -4.31, -4.58, -4.79, -5.06, -5.26, -5.5, -5.9, -6.33, -6.73, -7.05, -7.17, -7.26, -7.36, -7.47, -7.58, -7.7, -7.83, -7.97, -8.11, -8.27, -8.45, -8.64, -8.81, -9.02, -9.34, -9.8, -10.36, -10.98, -11.61, -12.2, -12.81],
      [5.0, 5.0, 5.0, 5.0, 4.99, 4.99, 4.6, 2.83, 2.74, 1.21, 0.88, 0.49, 0.29, -0.17, -0.57, -0.84, -1.12, -1.39, -1.58, -1.83, -2.01, -2.21, -2.37, -2.55, -2.73, -2.89, -3.06, -3.26, -3.42, -3.59, -3.76, -3.95, -4.16, -4.38, -4.64, -5.0, -5.37, -5.67, -5.93, -6.17, -6.4, -6.63, -6.85, -7.08, -7.29, -7.52, -7.75, -7.95, -8.13, -8.29, -8.46, -8.65, -8.83, -8.99, -9.18, -9.52, -10.08, -10.83, -11.55, -12.18, -12.82],
    ];
    const VOL = [null, [192, 191], [280, 258], [363, 362]];
    const x0 = 34, x1 = 346, y0 = 44, y1 = 228;
    const px = (x) => x0 + ((x + 100) / 598) * (x1 - x0);
    const py = (z) => y0 + ((5 - z) / 18) * (y1 - y0);

    return (ctx, t) => {
      const storm = 1 + Math.min(2, Math.floor(t / 2.7));
      const k = ease((t - (storm - 1) * 2.7) / 1.4);
      const cur = P[0].map((z, i) => lerp(z, P[storm][i], k));

      // Water between sea level and the seabed
      ctx.fillStyle = "rgba(45, 88, 119, 0.35)";
      for (let i = 0; i < X.length - 1; i++) {
        if (cur[i] >= 0 && cur[i + 1] >= 0) continue;
        ctx.beginPath();
        ctx.moveTo(px(X[i]), py(0));
        ctx.lineTo(px(X[i + 1]), py(0));
        ctx.lineTo(px(X[i + 1]), py(Math.min(0, cur[i + 1])));
        ctx.lineTo(px(X[i]), py(Math.min(0, cur[i])));
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "rgba(143, 189, 230, 0.6)";
      ctx.fillRect(x0, py(0), x1 - x0, 1);
      text(ctx, "sea level", x1 - 4, py(0) - 7, { size: 8, align: "right", color: COL.dim });

      // Eroded (red) and deposited (blue) areas between the profiles
      for (let i = 0; i < X.length - 1; i++) {
        const a0 = P[0][i], a1 = P[0][i + 1], b0 = cur[i], b1 = cur[i + 1];
        const eroded = a0 + a1 > b0 + b1;
        if (Math.abs(a0 - b0) + Math.abs(a1 - b1) < 0.02) continue;
        ctx.fillStyle = eroded ? "rgba(217, 105, 95, 0.55)" : "rgba(143, 189, 230, 0.55)";
        ctx.beginPath();
        ctx.moveTo(px(X[i]), py(a0));
        ctx.lineTo(px(X[i + 1]), py(a1));
        ctx.lineTo(px(X[i + 1]), py(b1));
        ctx.lineTo(px(X[i]), py(b0));
        ctx.closePath();
        ctx.fill();
      }
      const line = (zs, color, width, dash) => {
        ctx.setLineDash(dash || []);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        zs.forEach((z, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, px(X[i]), py(z)));
        ctx.stroke();
        ctx.setLineDash([]);
      };
      line(P[0], COL.dim, 1, [4, 3]);
      line(cur, COL.sand, 2);

      text(ctx, `Beach profile after storm ${storm}`, 16, 18, { size: 10, color: COL.paper, weight: 600 });
      text(ctx, "dashed: before", 344, 18, { size: 9, align: "right", color: COL.dim });
      if (k > 0.9) {
        const [er, de] = VOL[storm];
        text(ctx, `${er} m³/m eroded`, 16, 34, { size: 9, color: COL.red });
        text(ctx, `${de} m³/m deposited`, 108, 34, { size: 9, color: COL.blue });
      }
    };
  }

  // Scene 3: rubble-mound breakwater cross-section, built layer by layer from the
  // design results (crest +9.27 m, 1.2 t armour in a 1.56 m layer, 1:2 slopes).
  function breakwaterScene() {
    const Hc = 9.27, a = 2.35, SWL = 7.2;
    const SX = 7, SY = 14, CX = 180, BED = 222;
    const X = (m) => CX + m * SX;
    const Y = (m) => BED - m * SY;
    const shape = (t) => {
      const top = a - 0.236 * t;
      const base = a + 2 * Hc - 2.236 * t;
      return [[-base, 0], [-top, Hc - t], [top, Hc - t], [base, 0]];
    };
    const layers = [
      { t: 2.56, color: "#d2c9b6", label: "core" },
      { t: 2.29, color: "#bdb5a6", label: "underlayer 2 · 0.27 m" },
      { t: 1.56, color: "#a39b8e", label: "underlayer 1 · 0.73 m" },
      { t: 0, color: "#7f786d", label: "armour · 1.2 t stones · 1.56 m" },
    ];

    return (ctx, t) => {
      // Water to the design level, then the seabed
      ctx.fillStyle = "rgba(45, 88, 119, 0.45)";
      ctx.fillRect(0, Y(SWL), W, BED - Y(SWL));
      ctx.fillStyle = "rgba(143, 189, 230, 0.7)";
      ctx.fillRect(0, Y(SWL), W, 1);
      text(ctx, "design water +7.2 m", 344, Y(SWL) - 7, { size: 8, align: "right", color: COL.blue });
      ctx.fillStyle = "#5b5146";
      ctx.fillRect(0, BED, W, H - BED);

      // Layers appear from the core outwards; draw the outermost shown first.
      const shown = layers.map((_, i) => ease((t - 0.3 - i * 0.9) / 0.7));
      for (let i = layers.length - 1; i >= 0; i--) {
        if (shown[i] <= 0) continue;
        ctx.globalAlpha = shown[i];
        ctx.fillStyle = layers[i].color;
        ctx.beginPath();
        shape(layers[i].t).forEach(([x, y], j) => (j ? ctx.lineTo : ctx.moveTo).call(ctx, X(x), Y(y)));
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Toe berm on the seaward side
      const toe = ease((t - 4) / 0.6);
      if (toe > 0) {
        ctx.globalAlpha = toe;
        ctx.fillStyle = "#7f786d";
        roundRect(ctx, X(a + 2 * Hc - 1.5), Y(1.45), 4.5 * SX, 1.45 * SY, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      text(ctx, "Rubble-mound breakwater", 16, 18, { size: 10, color: COL.paper, weight: 600 });
      text(ctx, "crest +9.27 m", X(0), Y(Hc) - 9, { size: 9, align: "center", color: COL.paper });
      layers.forEach((l, i) => {
        if (shown[i] < 0.9) return;
        const y = 36 + (layers.length - 1 - i) * 13;
        ctx.fillStyle = l.color;
        ctx.fillRect(16, y - 4, 8, 8);
        text(ctx, l.label, 30, y, { size: 8.5, color: COL.dim });
      });
      if (toe > 0.9) {
        ctx.fillStyle = "#7f786d";
        ctx.fillRect(16, 36 + 4 * 13 - 4, 8, 8);
        text(ctx, "toe · 1.45 m high", 30, 36 + 4 * 13, { size: 8.5, color: COL.dim });
      }
    };
  }

  VISUALS.coastal = (canvas) => {
    const scenes = [
      ["Groyne", groyneScene()],
      ["Storm profiles", profileScene()],
      ["Breakwater", breakwaterScene()],
    ];
    const SCENE = 8.5;
    return {
      still: SCENE * 2 + 6,
      draw(time) {
        const t = time % (SCENE * scenes.length);
        const i = Math.floor(t / SCENE);
        const local = t - i * SCENE;
        const ctx = surface(canvas);
        const [, scene] = scenes[i];
        if (i === 0) scene(ctx, time, ease(local / 7));
        else scene(ctx, local);
        // Fade between scenes
        const edge = Math.min(local, SCENE - local);
        if (edge < 0.35) {
          ctx.fillStyle = `rgba(18, 17, 16, ${1 - edge / 0.35})`;
          ctx.fillRect(0, 0, W, H);
        }
        // Scene tabs
        ctx.fillStyle = "rgba(18, 17, 16, 0.7)";
        ctx.fillRect(0, H - 22, W, 22);
        scenes.forEach(([name], j) => {
          const x = 16 + j * 116;
          text(ctx, `${j + 1} · ${name}`, x, H - 11, { size: 9, color: j === i ? COL.paper : COL.dim, weight: j === i ? 600 : 400 });
          if (j === i) {
            ctx.fillStyle = COL.accent;
            ctx.fillRect(x, H - 3, 100 * (local / SCENE), 2);
          }
        });
      },
    };
  };

  // --- Oct 2021: sieve of Eratosthenes -------------------------------------------
  VISUALS.sieve = (canvas) => {
    const N = 120, COLS = 15;
    const PRIMES = [2, 3, 5, 7];
    const PHASE = 2;
    const PERIOD = PRIMES.length * PHASE + 4.5;
    // When each composite gets crossed out, by its smallest prime factor
    const crossAt = new Array(N + 1).fill(Infinity);
    PRIMES.forEach((p, k) => {
      const multiples = [];
      for (let m = p * p; m <= N; m += p) if (crossAt[m] === Infinity) multiples.push(m);
      multiples.forEach((m, j) => (crossAt[m] = k * PHASE + 0.5 + (j / multiples.length) * 1.3));
    });
    const cell = (n) => [18 + ((n - 1) % COLS) * 21.6, 38 + Math.floor((n - 1) / COLS) * 25];

    return {
      still: PERIOD - 1,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const phase = Math.min(PRIMES.length - 1, Math.floor(t / PHASE));
        const done = t > PRIMES.length * PHASE;
        text(ctx, done ? "What's left is prime" : `Crossing out multiples of ${PRIMES[phase]}`, 16, 18, { size: 10, color: COL.paper, weight: 600 });
        for (let n = 1; n <= N; n++) {
          const [x, y] = cell(n);
          const crossed = n === 1 || t >= crossAt[n];
          const active = !done && n === PRIMES[phase];
          const prime = !crossed && (done || PRIMES.slice(0, phase + 1).includes(n) || n <= PRIMES[phase]);
          if (active || (done && !crossed)) {
            ctx.fillStyle = active ? COL.accent : COL.accentSoft;
            ctx.beginPath();
            ctx.arc(x + 9, y + 8, 9, 0, Math.PI * 2);
            ctx.fill();
          }
          text(ctx, String(n), x + 9, y + 8.5, {
            size: 9,
            align: "center",
            font: MONO,
            color: active ? "#161514" : crossed ? "rgba(246, 244, 239, 0.18)" : prime ? COL.paper : COL.dim,
            weight: active || (done && !crossed) ? 700 : 400,
          });
        }
        if (done) {
          const k = ease((t - PRIMES.length * PHASE - 0.6) / 0.8);
          ctx.globalAlpha = k;
          text(ctx, "…and 455,052,511 primes below ten billion", 16, 252, { size: 10, color: COL.accent, weight: 600 });
          ctx.globalAlpha = 1;
        }
      },
    };
  };

  // --- Dec 2022: forty years of wind -----------------------------------------------
  // A wind rose for each year 1980-2019 (days the wind came from each of 16
  // directions), and an arrow circling through the year pointing the way the
  // wind blows that week, averaged over all forty years.
  VISUALS.wind = (canvas) => {
    const ROSE = [[15,21,45,35,5,5,1,3,1,5,12,70,79,42,16,11],[9,18,33,53,12,4,0,3,3,6,15,42,75,57,25,10],[12,12,34,61,21,2,3,1,3,12,22,55,53,42,22,10],[27,37,30,27,4,3,0,0,3,4,10,38,75,56,33,18],[27,21,25,28,10,4,1,1,2,3,11,32,77,70,37,16],[10,21,33,34,14,4,1,0,0,1,11,44,78,74,23,17],[6,18,37,42,19,4,0,1,2,4,6,32,99,63,19,13],[8,19,32,43,12,3,2,0,3,10,18,49,70,54,34,8],[9,13,29,52,9,10,1,1,1,3,4,45,75,61,41,12],[2,19,46,53,10,5,1,1,1,5,13,41,72,65,19,11],[8,16,35,38,13,5,3,3,1,4,17,47,70,59,34,12],[10,12,36,44,13,10,0,4,2,2,17,54,65,47,34,15],[10,21,49,47,10,3,0,2,1,2,9,56,82,45,20,9],[9,22,24,37,13,8,3,2,1,13,7,26,97,53,33,17],[9,22,33,50,13,9,3,4,10,11,31,46,59,30,20,14],[8,21,33,54,8,4,1,0,2,3,7,48,107,44,17,8],[3,14,31,43,11,2,1,1,1,5,6,45,87,78,29,9],[9,23,20,47,35,23,10,10,10,12,31,44,41,31,16,3],[13,21,29,45,15,3,3,1,3,3,9,44,66,76,25,9],[16,26,16,33,10,2,4,1,1,3,17,62,84,59,18,12],[19,19,22,29,10,5,1,1,1,3,9,32,98,67,30,20],[16,15,23,30,18,13,0,1,0,8,13,47,69,73,29,10],[11,13,28,45,25,8,1,1,3,4,17,33,63,86,20,7],[9,19,42,51,24,4,3,0,1,1,19,44,58,52,25,13],[11,15,31,50,20,9,4,2,1,9,15,43,63,62,20,11],[6,17,22,43,11,3,0,1,0,4,23,54,73,64,35,9],[9,17,36,47,12,4,7,2,10,18,22,36,63,49,25,8],[7,10,21,67,9,4,1,1,3,6,20,50,75,53,26,12],[15,12,21,30,16,5,1,1,1,7,21,38,74,63,44,17],[11,8,25,50,15,10,1,3,5,5,13,52,87,52,20,7],[7,8,26,38,5,6,0,3,0,2,11,55,89,70,27,18],[20,22,16,26,8,11,4,0,3,8,20,54,64,65,26,18],[15,15,35,28,17,9,5,5,6,5,12,32,51,80,38,13],[15,12,26,41,16,7,2,3,5,4,16,44,73,53,28,20],[3,9,29,51,17,7,3,1,4,6,11,62,66,64,24,7],[8,12,23,49,15,12,9,5,4,13,16,36,69,60,24,10],[12,13,36,40,13,7,4,3,1,0,5,21,77,96,32,6],[14,15,18,33,15,0,2,3,0,6,8,42,97,59,32,21],[14,15,23,45,18,11,6,3,3,4,22,33,78,55,20,15],[8,12,30,64,24,10,6,4,15,20,10,30,52,47,22,10]];
    // Weekly mean wind [direction it comes from (degrees), speed m/s]
    const WEEK = [[54,4.35],[56,4.52],[62,4.86],[56,4.86],[53,4.59],[50,4.21],[47,4],[48,3.69],[46,3.23],[43,2.78],[42,2.52],[9,1.61],[344,1.54],[319,1.51],[294,1.78],[284,2.44],[285,3.07],[272,3.5],[274,4.5],[264,5.24],[263,5.68],[261,6.25],[258,6.33],[260,5.8],[262,5.43],[266,5.36],[271,5.18],[273,5.16],[271,5.02],[274,4.28],[269,4.25],[269,4.34],[276,4.4],[285,4.8],[281,4.49],[281,4.33],[281,4.62],[279,5.14],[280,5.12],[272,5.32],[268,4.46],[273,3.91],[273,3.15],[272,3.24],[284,2.7],[302,1.25],[4,0.75],[41,1.13],[56,1.82],[51,2.47],[65,3.57],[58,4.05]];
    const NAMES = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const MONTHS = "JFMAMJJASOND";
    const cx = 128, cy = 136, R = 84;
    const MAX = 107;
    const LOOP = 13; // one year of the arrow, and one pass through all forty roses
    const rad = (deg) => ((deg - 90) * Math.PI) / 180;

    return {
      still: LOOP * 0.55,
      draw(time) {
        const t = (time % LOOP) / LOOP;
        const ctx = surface(canvas);
        const yf = t * (ROSE.length - 1);
        const yi = Math.floor(yf);
        const counts = ROSE[yi].map((c, s) => lerp(c, ROSE[Math.min(ROSE.length - 1, yi + 1)][s], yf - yi));

        // Rings and compass
        ctx.strokeStyle = COL.ghost;
        ctx.lineWidth = 1;
        [0.33, 0.66, 1].forEach((f) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Rose wedges, one per direction
        counts.forEach((c, s) => {
          const r = Math.sqrt(c / MAX) * R;
          const a = rad(s * 22.5);
          ctx.fillStyle = s >= 10 && s <= 13 ? COL.accent : COL.accentSoft;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, a - 0.17, a + 0.17);
          ctx.closePath();
          ctx.fill();
        });

        // Month ring and the arrow travelling around it
        const ORBIT = R + 24;
        for (let m = 0; m < 12; m++) {
          const a = -Math.PI / 2 + (m / 12) * Math.PI * 2;
          text(ctx, MONTHS[m], cx + Math.cos(a) * (ORBIT + 13), cy + Math.sin(a) * (ORBIT + 13), { size: 7.5, align: "center", color: COL.dim });
        }
        const wk = Math.floor(t * 52) % 52;
        const [from, speed] = WEEK[wk];
        const oa = -Math.PI / 2 + t * Math.PI * 2;
        const ox = cx + Math.cos(oa) * ORBIT, oy = cy + Math.sin(oa) * ORBIT;
        const to = rad(from + 180);
        const len = 5 + speed * 2.6;
        const tx = ox + Math.cos(to) * len, ty = oy + Math.sin(to) * len;
        ctx.strokeStyle = COL.blue;
        ctx.fillStyle = COL.blue;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox - Math.cos(to) * len, oy - Math.sin(to) * len);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tx + Math.cos(to) * 4, ty + Math.sin(to) * 4);
        ctx.lineTo(tx + Math.cos(to + 2.4) * 6, ty + Math.sin(to + 2.4) * 6);
        ctx.lineTo(tx + Math.cos(to - 2.4) * 6, ty + Math.sin(to - 2.4) * 6);
        ctx.closePath();
        ctx.fill();

        // Readout
        text(ctx, String(1980 + Math.round(yf)), 262, 60, { size: 26, color: COL.paper, weight: 600 });
        text(ctx, "days by direction", 263, 82, { size: 9, color: COL.dim });
        text(ctx, `week ${wk + 1}`, 263, 128, { size: 9, color: COL.dim, font: MONO });
        text(ctx, `from ${NAMES[Math.round(from / 22.5) % 16]}`, 263, 146, { size: 12, color: COL.blue, weight: 600 });
        text(ctx, `${speed.toFixed(1)} m/s avg`, 263, 162, { size: 9, color: COL.dim, font: MONO });
        text(ctx, "North is up", 263, 220, { size: 8.5, color: COL.dim });
        text(ctx, "NE ↔ W monsoons", 263, 234, { size: 8.5, color: COL.dim });
      },
    };
  };

  // --- Jul 2025: first machine learning models on the Titanic ----------------------
  // First, how each model splits the passengers: every model trained on just two
  // features (age and fare) so its decision regions can be drawn, from scikit-learn
  // on a 40 x 30 grid ("1" = predicted to survive). Then the real results: each
  // model on all features, scored on the same 179 held-out passengers.
  VISUALS.titanic = (canvas) => {
    const D = {
      lr: [-1.9238720727908878,-1.1245890625341044,3.98241634464795],
      lr_grid: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111110000000000000000000000000000000000011111111100000000000000000000000000000001111111111111100000000000000000000000000111111111111111111100000000000000000000011111111111111111111111100000000000000001111111111111111111111111111000000000000111111111111111111111111111111111000000011111111111111111111111111111111111111001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
      knn: "111000000000000000000000000000000000000011110000000000000000000000000000000000000111000000000000000000000000000000000000011010000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111100000000000000000000000000000000000011111000000000000000000000000000000000001111110000000000000000000000000000000000111111100000000000000000000000000000000011111110000001000000000000000000000000001111110010000000000000010000000000000000111111110000011110001100000000000000000011110000000110000110000000000010000000001111000000111000011000001100100000000000111000011111001011000001111000000000000000000000111111001100010011000000000000001110000000111101000000000010000000000000000000000011100111110001110110000000000001100000011111111111101111011111100000000000001110011111111110011111111110000000111111111101111111111001111111111100000011111111111111111111110011011111111000001111111111011111111111111111111111000000111111111110011111111111111111111111000011111111111100011111111111111111110111001111111111111111111111111111111111101110111111111111111111111111111111111110011111111111111111111111111111111111111000011111111111111111111111111111111111110000",
      svm: "aaaaaaaaaa0000000000aaaaaaaaaaaaaaaaaaaabaaaaaaaa000000000000aaaaaaaaaaaaaaaaaaabaaaaaaa000000000000000aaaaaaaaaaaaaaaaabaaaaaaa0000000000000000aaaaaaaaaaaaaaaabaaaaaaa00000000000000000aaaaaaaaaaaaaaabbaaaaaa0000000000000000000aaaaaaaaaaaaabbaaaaaa000000000000000000000aaaaaaaaaaabbaaaaaa000000000000000000000000aaaaaaaabbaaaaaaa000000000000000000000000000aaaabbbaaaaaa000000000000000000000000000000abbbaaaaaaa000000000000000000000000000000bbbbaaaaaaaa0000000000000000000000000000bbbbaaaaaaaaaaaaaaaaaa000000000000000000bbbbbaaaaaaaaaaaaaaaaaaaaaa0000000000000bbbbbbaaaaaaaaaaaaaaaaaaaaaaaa0000000000bbbbbbbaaaaaaaaaaaaaaaaaaaaaaaa000000000bbbbbbbbbaaaaaaaaaaaaaaaaaaaaaaaa00000001bbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaaa000001bbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaaa001bbbbbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaaaa11bbbbbbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaaaa11bbbbbbbbbbbbbb11bbbbbbbbbbbbbaaaaaaaaa11bbbbbbb11111111111111bbbbbbbbbaaaaaaaa11bbb11111111111111111111bbbbbbbbbaaaaaabbbb1111111111111111111111bbbbbbbbbaaaaabbbbb11111111111111111111111bbbbbbbbaaaabbbbb111111111111111111111111bbbbbbbbbaabbbbbb11111111111111111111111bbbbbbbbbbabbbbbbb11111111111111111111111bbbbbbbbbbbbbbbbbb1111111111111111111111bbbbbbbbbb",
      rf_trees: ["111111110000000000000000000000000000001111111111000000000000000000000000000000111111111100000000000000000000000000000011111111110000000000000000000000000000001111111111000000000000000000000000000000111111111100000000000000000000000000000011111111110000000000000000000000000000001111111111000000000000000000000000000000111111111100000000000000000000000000000011111111110000000000000000000000000000001111111111000000000000000000000000000000110001111100000000000000000000000000000011111111110000000000000000000000000000001111111111111111111100000000000000000000111110000000000000000000001110000000000011111000000000000000000000111000000000001110000000000000000000000011100000000000111000000000000000000000001111000000000011111000000000000000000000111100000000001111111111100110010000000000000000000000001111111110011001000000000000000000000000111111111111111111111111100011111111111111111111100000000000000000000000000000001111111111111111111111110111111111111111111111111111111111111111011111111111111111111111111111111111111101111111111111110000000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","101100000000000000000000000000010000000010110000000000000000000000000001000000001011000000000000000000000000000100000000101100000000000000000000000000010000000010110000000000000000000000000001000000001011000000000000000000000000000100000000101100000000000000000000000000010000000010110000000000000000000000000001000000001011000000000000000000000000000100000000101100000000000000000000000000010000000010110000000000000000000000000001000000001011000000000000000000000000000100000000101100000000000000000000000000010000000010110000000000000000000000000001000000001011000000000000000000000000000100000000111100000000000000000000000000010000000010000000000000000000000000000001000000001111000000000000000000000000000100000000011100000000000000000111111111110000000001111111111111111111100011111111000000000111111111111111111110001111111100000000011111111111111111111000111111110000000001111111111111111111100011111111000000000111111111111111111110001111111100000000011111111111111111111000111111110000000001111111111111111111100011111111000000000111111111111111111110001111111100000000011111111111111111111000111111110000000001111111111111111111100011111111000000000111111111111111111110001111111100000000","000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000101000000000000000000000000000000000000010000000000000000000000000000000000000001110000000000000000000000000000000000000011000000000000000000000000000000000000001111111111111111111111111111111000000000111111111111111111111111111111100000000011111111111111111111111111111110000000001111111111111111111111111111111000000000111111111111111111111111111111100000000011000000000001111111111111111110000000001100000000000111111111111111111000000000110000000000011111111111111111100000000011000000000001111111111111111110000000001100000000000111111111111111111000000000110000000000011111111111111111100000000"],
      rf: "111100100000000000000000000000000000000011110010000000000000000000000000000000001111001000000000000000000000000000000000111100100000000000000000000000000000000011110000000000000000000000000000000000001111000000000000000000000000000000000000111100000000000000000000000000000000000011110000000000000000000000000000000000001111000000000000000000000000000000000000111100000000000000000000000000000000000011110011000000000000000000000000000000001110000000000000000000000000000000000000111100100000000000000000000000000000000011110010000000000000000000000000000000001111000000000000000000000000000000000000111100000000000000000000000000000000000010000000000000000000000000000000000000001110000000000000000000000000000000000000011000000000000000000000000000000000000011111111111111111111111111111111000000000111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000",
      gb: ["000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000","100000000000000000000000000000000000000010000000000000000000000000000000000000001000000000000000000000000000000000000000100000000000000000000000000000000000000010000000000000000000000000000000000000001000000000000000000000000000000000000000100000000000000000000000000000000000000010000000000000000000000000000000000000001000000000000000000000000000000000000000100000000000000000000000000000000000000011111111000000000000000000000000000000001000000000000000000000000000000000000000111111110000000000000000000000000000000011111110000000001111100000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000011000000000000000000000000000000000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000111111111111111111111111111111110000000011111111111111111111111111111111000000001111111111111111111111111111111100000000","111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001110000000000000000000000000000000000000111000000000000000000000000000000000000011111111000000000000000000000001000000011111111000000000000000000000000100000001111111110000010000000000000000010000000111111111110111111101100011100001000000011111111111111111110110001110000100000001100000000000000000000000000000010000000111100000000001011100000000100001000000011110000000000000000000000010000100000001011000000000000000000000000000010000000101111111111111111101111011111111000000010111111111111111110111101111111100000001011111111111111111111110111111110000000101111111111111111111111011111111000000010111111111111111111111111111111100000001011111111111111111111111111111110000000101111111111111111111111111111111000000010111111110000111110111111111111100000001011111111011111111111111111111110000000101111111101111111111111111111111000000010111111110111111111111111111111100000001"],
      nn: ["000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000110000000000000000000000000000000000000011111100000000000000000000000000000000001111111111100000000000000000000000000000111111111111111000000000000000000000000011111111111111111000000000000000000000001111111111111111111000000000000000000000111111111111111111111000000000000000000011111111111111111111111000000000000000001111111111111111111111111100000000000000","000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000001100000000000000000000000000000000000000111000000000000000000000000000000000000011100000000000000000000000000000000000001111000000000000000000000000000000000000111110000000000000000000000000000000000011111000000000000000000000000000000000001111110000000000000000000000000000000000111111100000000000000000000000000000000011111111000000000000000000000000000000001111111111110000000000000000000000000000111111111111111110000000000000000000000011111111111111111111100000000000000000001111111111111111111111111000000000000000111111111111111111111111111111000000000011111111111111111111111111111111100000001111111111111111111111111111111111110000111111111111111111111111111111111111110011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","111111111000000000000000000000000000000011111111100000000000000000000000000000001111111110000000000000000000000000000000111111111000000000000000000000000000000011111111000000000000000000000000000000001111111100000000000000000000000000000000111111110000000000000000000000000000000011111111000000000000000000000000000000001111111100000000000000000000000000000000111111110000000000000000000000000000000011111110000000000000000000000000000000001111111000000000000000000000000000000000111111100000000000000000000000000000000011111111111111100000000000000000000000001111111111111111111111000000000000000000111111111111111111111111110000000000000011111111111111111111111111111100000000001111111111111111111111111111111111100000111111111111111111111111111111111111111011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111","111111111000000000000000000000000000000011111111100000000000000000000000000000001111111100000000000000000000000000000000111111110000000000000000000000000000000011111111100000000000000000000000000000001111111110000000000000000000000000000000111111111000000000000000000000000000000011111111000000000000000000000000000000001111111100000000000000000000000000000000111111110000000000000000000000000000000011111110000000000000000000000000000000001111111000000000000000000000000000000000111111100000000000000000000000000000000011111100000000000000000000000000000000001111100011111100111000000000000000000000111100011111111111111111100000000000000011100001111111111111111111100000000000001100001111111111111111111111110000000000100000111111111111111111111111110000000010000111111111111111111111111111110000001000011111111111111111111111111111111000111011111111111111111111111111111111111011111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"],
      pts: [[0.212,0.363,0],[0.3,0.527,1],[0.35,0.422,0],[0.237,0.349,1],[0.3,0.459,1],[0.312,0.469,0],[0.3,0.422,0],[0.562,0.528,1],[0.008,0.438,1],[0.45,0.449,0],[0.4,0.689,0],[0.237,0.638,0],[0.062,0.556,1],[0.237,0.527,1],[0.562,0.709,0],[0.212,0.337,0],[0.275,0.347,1],[0.456,0.527,0],[0.388,0.422,1],[0.01,0.477,1],[0.613,0.719,1],[0.525,0.345,0],[0.25,0.381,0],[0.2,0.618,0],[0.6,0.57,0],[0.275,0.337,0],[0.425,0.561,1],[0.062,0.481,1],[0.087,0.528,1],[0.362,0.674,0],[0.625,0.784,1],[0.25,0.363,0],[0.312,0.723,1],[0.725,0.547,0],[0.312,0.6,0],[0.2,0.652,1],[0.312,0.527,0],[0.113,0.555,0],[0.388,0.347,0],[0.275,0.352,0],[0.287,0.422,0],[0.487,0.646,1],[0.237,0.386,0],[0.287,0.35,0],[0.637,0.661,0],[0.438,0.529,1],[0.812,0.53,0],[0.55,0.537,1],[0.45,0.0,0],[0.263,0.381,0],[0.438,0.786,1],[0.338,0.349,0],[0.3,0.349,0],[0.637,0.352,0],[0.287,0.891,1],[0.688,0.551,0],[0.506,0.347,0],[0.362,0.527,1],[0.312,0.645,1],[0.188,0.352,1],[0.013,0.618,0],[0.388,0.63,0],[0.2,0.346,1],[0.487,0.516,0],[0.45,0.529,1],[0.562,0.332,0],[0.525,0.363,0],[0.675,0.433,0],[0.4,0.347,0],[0.6,0.67,1],[0.362,0.39,1],[0.562,0.53,1],[0.588,0.438,0],[0.3,0.348,0],[0.4,0.349,1],[0.05,0.59,1],[0.487,0.544,0],[0.487,0.555,0],[0.375,0.748,1],[0.287,0.349,0],[0.275,0.349,0],[0.375,0.727,1],[0.275,0.337,0],[0.762,0.566,0],[0.675,0.656,1],[0.569,0.337,0],[0.35,0.707,0],[0.175,0.4,1],[0.181,0.438,0],[0.212,0.363,0],[0.263,0.347,0],[0.412,0.413,0],[0.412,0.347,0],[0.475,0.556,1],[0.3,0.891,1],[0.487,0.422,0],[0.675,0.699,1],[0.375,0.516,0],[0.05,0.508,1],[0.5,0.349,0],[0.588,0.443,0],[0.625,0.748,0],[0.425,0.322,0],[0.775,0.53,0],[0.312,0.349,0],[0.375,0.422,0],[0.388,0.635,0],[0.25,0.333,0],[0.463,0.527,0],[0.45,0.786,1],[0.3,0.438,1],[0.4,0.648,1],[0.3,0.352,0],[0.212,0.438,0],[0.037,0.495,0],[0.113,0.556,0],[0.25,0.337,1],[0.375,0.422,0],[0.025,0.555,0],[0.237,0.349,0],[0.15,0.4,1],[0.55,0.527,0],[0.463,0.377,0],[0.425,0.352,0],[0.537,0.528,0],[0.388,0.757,1],[0.362,0.39,0],[0.512,0.592,0],[0.275,0.335,0],[0.3,0.481,1],[0.362,0.349,0],[0.013,0.581,1],[0.3,0.533,1],[0.438,0.709,1],[0.113,0.446,0],[0.613,0.754,0],[0.2,0.352,1],[0.113,0.491,1],[0.438,0.638,1],[0.575,0.701,0]],
    };
    const GX = 40, GY = 30;
    const px0 = 16, py0 = 40, PW = 208, PH = 156; // plot area
    const X = (u) => px0 + u * PW;
    const Y = (v) => py0 + PH - v * PH;
    const SURVIVED = "143, 189, 230";
    const DIED = "227, 154, 134";

    // Each grid becomes a 40 x 30 pixel image, drawn scaled up without smoothing
    // so the cells meet without seams.
    const images = new Map();
    function regionImage(grid) {
      if (images.has(grid)) return images.get(grid);
      const img = document.createElement("canvas");
      img.width = GX;
      img.height = GY;
      const g = img.getContext("2d");
      const data = g.createImageData(GX, GY);
      for (let j = 0; j < GY; j++) {
        for (let i = 0; i < GX; i++) {
          const c = grid[j * GX + i];
          const rgb = (c === "1" || c === "b" ? SURVIVED : DIED).split(",").map(Number);
          const o = ((GY - 1 - j) * GX + i) * 4;
          data.data.set([...rgb, (c === "a" || c === "b" ? 0.08 : 0.22) * 255], o);
        }
      }
      g.putImageData(data, 0, 0);
      images.set(grid, img);
      return img;
    }
    function regions(ctx, grid, alpha = 1) {
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(regionImage(grid), px0, py0, PW, PH);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 1;
    }
    function points(ctx) {
      D.pts.forEach(([u, v, s]) => {
        ctx.fillStyle = `rgb(${s ? SURVIVED : DIED})`;
        ctx.beginPath();
        ctx.arc(X(u), Y(v), 2.1, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    const fadeIn = (t, at) => ease((t - at) / 0.6);

    const MODELS = [
      {
        name: "Logistic regression",
        how: ["Fits one straight", "line between the", "two groups."],
        draw(ctx, t) {
          regions(ctx, D.lr_grid, fadeIn(t, 1.5));
          // The line settles from flat into its fitted slope
          const [b0, b1, b2] = D.lr;
          const k = ease(t / 1.4);
          const at = (u) => lerp(0.45, -(b0 + b1 * u) / b2, k);
          ctx.strokeStyle = COL.paper;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(X(0), Y(clamp(at(0), 0, 1)));
          ctx.lineTo(X(1), Y(clamp(at(1), 0, 1)));
          ctx.stroke();
        },
      },
      {
        name: "Nearest neighbours",
        how: ["Asks the five", "closest passengers", "and takes a vote."],
        draw(ctx, t) {
          regions(ctx, D.knn, fadeIn(t, 2.2));
          const u = 0.5 + 0.34 * Math.sin(t * 1.3), v = 0.45 + 0.28 * Math.sin(t * 2.1 + 1);
          const near = D.pts
            .map((p) => [Math.hypot(p[0] - u, p[1] - v), p])
            .sort((a, b) => a[0] - b[0])
            .slice(0, 5);
          const votes = near.filter(([, p]) => p[2]).length;
          ctx.strokeStyle = "rgba(246, 244, 239, 0.5)";
          ctx.lineWidth = 1;
          near.forEach(([, p]) => {
            ctx.beginPath();
            ctx.moveTo(X(u), Y(v));
            ctx.lineTo(X(p[0]), Y(p[1]));
            ctx.stroke();
          });
          ctx.fillStyle = `rgb(${votes >= 3 ? SURVIVED : DIED})`;
          ctx.strokeStyle = COL.paper;
          ctx.beginPath();
          ctx.arc(X(u), Y(v), 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          return `${votes} of 5 survived`;
        },
      },
      {
        name: "SVM",
        how: ["Finds the boundary", "with the widest", "margin (lighter)."],
        draw(ctx, t) {
          regions(ctx, D.svm, fadeIn(t, 0.3));
        },
      },
      {
        name: "Random forest",
        how: ["Many trees, each", "cutting with straight", "splits; they vote."],
        draw(ctx, t) {
          const tree = Math.floor(t / 0.8);
          if (tree < 3) {
            regions(ctx, D.rf_trees[tree], 1);
            return `tree ${tree + 1}`;
          }
          regions(ctx, D.rf, fadeIn(t, 2.4));
          return "100 trees vote";
        },
      },
      {
        name: "Gradient boosting",
        how: ["Adds small trees one", "by one, each fixing", "the last one's errors."],
        draw(ctx, t) {
          const s = Math.min(3, Math.floor(t / 0.8));
          regions(ctx, D.gb[s], 1);
          return `round ${[1, 5, 20, 100][s]}`;
        },
      },
      {
        name: "Neural network",
        how: ["Bends its boundary", "as it trains, pass", "after pass."],
        draw(ctx, t) {
          const s = Math.min(3, Math.floor(t / 0.8));
          regions(ctx, D.nn[s], 1);
          return `epoch ${[2, 10, 40, 300][s]}`;
        },
      },
    ];

    const RESULTS = [
      ["Logistic regression", 84.4, 28],
      ["SVM", 83.8, 29],
      ["Gradient boosting", 81.6, 33],
      ["k-nearest neighbours", 81.0, 34],
      ["Neural network", 79.9, 36],
      ["Random forest", 79.3, 37],
    ];
    const STEP = 3.6;
    const SHOW = MODELS.length * STEP;
    const PERIOD = SHOW + 6.5;

    function drawResults(ctx, t) {
      const lo = 75, hi = 86;
      text(ctx, "All features · 179 held-out passengers", 16, 18, { size: 10, color: COL.paper, weight: 600 });
      RESULTS.forEach(([name, acc, wrong], i) => {
        const y = 52 + i * 30;
        const k = ease((t - 0.2 - i * 0.25) / 0.8);
        const best = i === 0;
        text(ctx, name, 132, y, { size: 9.5, align: "right", color: best ? COL.paper : COL.dim, weight: best ? 600 : 400 });
        ctx.fillStyle = COL.ghost;
        roundRect(ctx, 140, y - 6, 150, 12, 3);
        ctx.fill();
        ctx.fillStyle = best ? COL.accent : COL.accentSoft;
        roundRect(ctx, 140, y - 6, Math.max(2, ((acc - lo) / (hi - lo)) * 150 * k), 12, 3);
        ctx.fill();
        if (k > 0.95) {
          text(ctx, `${acc.toFixed(1)}%`, 296, y - 1, { size: 9.5, color: best ? COL.accent : COL.paper, weight: 600 });
          text(ctx, `${wrong} wrong`, 296, y + 10, { size: 7.5, color: COL.dim });
        }
      });
      const v = ease((t - 2.4) / 0.8);
      if (v > 0) {
        ctx.globalAlpha = v;
        text(ctx, "The simplest model won.", 16, 244, { size: 10, color: COL.accent, weight: 600 });
        ctx.globalAlpha = 1;
      }
      text(ctx, `axis ${lo}–${hi}%`, 344, 244, { size: 8, align: "right", color: COL.dim });
    }

    return {
      still: PERIOD - 1,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        if (t >= SHOW) return drawResults(ctx, t - SHOW);

        const m = Math.floor(t / STEP);
        const local = t - m * STEP;
        const model = MODELS[m];
        // Plot frame and axes
        ctx.strokeStyle = COL.faint;
        ctx.lineWidth = 1;
        ctx.strokeRect(px0, py0, PW, PH);
        const note = model.draw(ctx, local);
        points(ctx);
        text(ctx, "age →", px0 + PW, py0 + PH + 11, { size: 8, align: "right", color: COL.dim });
        ctx.save();
        ctx.translate(px0 - 7, py0);
        ctx.rotate(-Math.PI / 2);
        text(ctx, "fare →", 0, 0, { size: 8, align: "right", color: COL.dim });
        ctx.restore();

        text(ctx, `How each model splits passengers · ${m + 1}/${MODELS.length}`, 16, 18, { size: 9.5, color: COL.dim });
        text(ctx, model.name, 236, 56, { size: 12, color: COL.paper, weight: 600 });
        model.how.forEach((line, i) => text(ctx, line, 236, 78 + i * 14, { size: 9, color: COL.dim }));
        if (note) text(ctx, note, 236, 136, { size: 9, font: MONO, color: COL.accent });

        // Legend
        [["survived", SURVIVED], ["did not", DIED]].forEach(([label, rgb], i) => {
          const x = 16 + i * 80;
          ctx.fillStyle = `rgb(${rgb})`;
          ctx.beginPath();
          ctx.arc(x + 3, 222, 3, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, label, x + 10, 222, { size: 8.5, color: COL.dim });
        });
        text(ctx, "shown on two features: age and fare", 16, 244, { size: 8, color: COL.dim });
        // Step dots
        MODELS.forEach((_, i) => {
          ctx.fillStyle = i === m ? COL.accent : COL.faint;
          ctx.beginPath();
          ctx.arc(236 + i * 12, 170, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      },
    };
  };

  // --- Dec 2024: natural ventilation check (illustration) --------------------------
  // Opening types are set up once; each room is a name, a floor area and its
  // openings as one line of text. The line is parsed, the open area summed, and
  // the room passes if openings are at least 10% of the floor area.
  VISUALS.ventilation = (canvas) => {
    const OPENINGS = { W1: 1.2, W2: 0.8, V1: 0.3 }; // opening area, m²
    const rooms = [
      ["Bedroom 1", 14.0, "W1 x2"],
      ["Kitchen", 9.5, "W2, V1"],
      ["Store", 6.0, "V1"],
    ];
    const parse = (str) =>
      str.split(",").map((part) => {
        const [code, times] = part.trim().split(/\s*x\s*/i);
        return [code, Number(times || 1)];
      });
    const openArea = (str) => parse(str).reduce((sum, [code, n]) => sum + OPENINGS[code] * n, 0);
    const STEP = 3.6;
    const DONE = STEP * rooms.length;
    const PERIOD = DONE + 3;
    const colX = [16, 118, 176, 236, 300];

    return {
      still: PERIOD - 0.5,
      draw(time) {
        const t = time % PERIOD;
        const idx = Math.min(rooms.length - 1, Math.floor(t / STEP));
        const local = t - idx * STEP;
        const finished = t >= DONE;
        const [name, area, str] = rooms[idx];
        const ctx = surface(canvas);

        // Opening types, entered once
        text(ctx, "Opening types", 16, 16, { size: 9, color: COL.dim, weight: 600 });
        Object.entries(OPENINGS).forEach(([code, a], i) => {
          const x = 16 + i * 78;
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, x, 26, 70, 22, 4);
          ctx.fill();
          const used = !finished && parse(str).some(([c]) => c === code) && local > 1.9;
          text(ctx, code, x + 8, 37, { size: 9, font: MONO, color: used ? COL.accent : COL.paper, weight: 700 });
          text(ctx, `${a.toFixed(1)} m²`, x + 30, 37, { size: 8.5, font: MONO, color: COL.dim });
        });

        // The room being entered: name, area, openings as text
        const typed = (s, from) => s.slice(0, Math.max(0, Math.floor((local - from) * 18)));
        const fields = finished
          ? ["", "", ""]
          : [typed(name, 0.1), local > 0.7 ? `${area.toFixed(1)}` : "", typed(str, 1.0)];
        [["Room", 16, 96], ["Area m²", 116, 56], ["Openings", 176, 168]].forEach(([label, x, w], i) => {
          text(ctx, label, x, 62, { size: 8, color: COL.dim });
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, x, 70, w, 22, 4);
          ctx.fill();
          text(ctx, fields[i], x + 7, 81, { size: 9, font: i === 1 || i === 2 ? MONO : SANS, color: COL.paper });
        });
        if (!finished && local > 1.9 && local < 2.7) {
          const sum = parse(str).map(([c, n]) => (n > 1 ? `${c}×${n}` : c)).join(" + ");
          text(ctx, `${sum} = ${openArea(str).toFixed(1)} m²`, 344, 104, { size: 8.5, align: "right", color: COL.accent, font: MONO });
        }

        // Results
        const head = ["Room", "Area", "Open", "%", ""];
        head.forEach((h, i) => text(ctx, h, colX[i], 124, { size: 8, color: COL.dim }));
        ctx.fillStyle = COL.faint;
        ctx.fillRect(16, 132, 328, 1);
        const shown = finished ? rooms.length : idx + (local > 2.7 ? 1 : 0);
        rooms.slice(0, shown).forEach(([n, a, s], r) => {
          const y = 146 + r * 20;
          const open = openArea(s);
          const pct = (open / a) * 100;
          const ok = pct >= 10;
          text(ctx, n, colX[0], y, { size: 9, color: COL.paper });
          text(ctx, a.toFixed(1), colX[1], y, { size: 9, font: MONO, color: COL.paper });
          text(ctx, open.toFixed(1), colX[2], y, { size: 9, font: MONO, color: COL.paper });
          text(ctx, `${pct.toFixed(1)}%`, colX[3], y, { size: 9, font: MONO, color: ok ? COL.paper : COL.red });
          text(ctx, ok ? "OK" : "below 10%", colX[4], y, { size: 8.5, color: ok ? "#9fd4a8" : COL.red, weight: 600 });
        });

        // Export
        const k = ease((t - DONE - 0.4) / 0.5);
        ctx.globalAlpha = 0.35 + 0.65 * k;
        ctx.strokeStyle = COL.accent;
        ctx.lineWidth = 1;
        roundRect(ctx, 236, 222, 108, 24, 5);
        ctx.stroke();
        text(ctx, "Export to Excel ↓", 290, 234, { size: 9, align: "center", color: COL.accent, weight: 600 });
        ctx.globalAlpha = 1;
        text(ctx, "illustration · openings ≥ 10% of floor area", 16, 234, { size: 8, color: COL.dim });
      },
    };
  };

  // --- Oct 2025: AutoCAD layouts by script (illustration) ------------------------------
  VISUALS.autocad = (canvas) => {
    const SHEETS = 8;
    const PERIOD = 10;
    const rand = rng(21);
    const plans = Array.from({ length: SHEETS }, () =>
      Array.from({ length: 5 }, () => [rand(), rand(), rand() > 0.5])
    );
    return {
      still: 9,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        // One clock for both: 45 minutes of work plays out over 8 seconds.
        const minutes = 45 * clamp(t / 8, 0, 1);
        const k = Math.min(minutes, 10) / 10; // the script's progress
        text(ctx, "Sheets set up", 16, 18, { size: 10, color: COL.paper, weight: 600 });

        // Sheets appear as the script runs
        const made = Math.floor(k * SHEETS + 0.001);
        for (let i = 0; i < SHEETS; i++) {
          const x = 16 + (i % 4) * 84;
          const y = 32 + Math.floor(i / 4) * 70;
          ctx.strokeStyle = i < made ? COL.faint : COL.ghost;
          ctx.lineWidth = 1;
          roundRect(ctx, x, y, 76, 58, 3);
          ctx.stroke();
          if (i >= made) continue;
          // Viewport with a scrap of plan, and the title block
          ctx.strokeStyle = COL.blueSoft;
          ctx.strokeRect(x + 5, y + 5, 50, 48);
          ctx.strokeStyle = COL.dim;
          plans[i].forEach(([a, b, vertical]) => {
            ctx.beginPath();
            if (vertical) {
              ctx.moveTo(x + 9 + a * 42, y + 9);
              ctx.lineTo(x + 9 + a * 42, y + 9 + b * 40);
            } else {
              ctx.moveTo(x + 9, y + 9 + a * 40);
              ctx.lineTo(x + 9 + b * 42, y + 9 + a * 40);
            }
            ctx.stroke();
          });
          ctx.fillStyle = COL.accentSoft;
          ctx.fillRect(x + 59, y + 5, 12, 48);
          text(ctx, String(i + 1).padStart(2, "0"), x + 65, y + 46, { size: 7, align: "center", color: COL.paper, font: MONO });
        }

        // Time bars: by hand vs by script
        const bars = [
          ["by hand", 45, COL.dim],
          ["script", 10, COL.accent],
        ];
        bars.forEach(([name, mins, color], i) => {
          const y = 196 + i * 26;
          text(ctx, name, 16, y, { size: 9, color: COL.paper });
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, 66, y - 5, 230, 10, 3);
          ctx.fill();
          const w = (Math.min(minutes, mins) / 45) * 230;
          ctx.fillStyle = color;
          roundRect(ctx, 66, y - 5, Math.max(2, w), 10, 3);
          ctx.fill();
          text(ctx, `${Math.round(Math.min(minutes, mins))} min`, 302, y, { size: 9, color: i === 1 ? COL.accent : COL.dim, font: MONO });
        });
        text(ctx, "illustration", 344, 18, { size: 8, align: "right", color: COL.dim });
      },
    };
  };

  // --- Mancala (ohvalhugondi) engine, ported from the webui version -------------
  // 14 pits (0-6 bottom player, 7-13 top player), 7 seeds each, relay sowing.
  function newGame() {
    return { pits: Array(14).fill(7), stores: [0, 0], player: 0 };
  }
  const cloneGame = (g) => ({ pits: g.pits.slice(), stores: g.stores.slice(), player: g.player });
  const validMoves = (g, p = g.player) =>
    [0, 1, 2, 3, 4, 5, 6].map((i) => i + p * 7).filter((i) => g.pits[i] > 0);
  const isOver = (g) => g.pits.slice(0, 7).every((n) => !n) || g.pits.slice(7).every((n) => !n);

  /** Plays a move in place; returns true if the player moves again. */
  function sow(g, start, trace) {
    let hand = g.pits[start];
    g.pits[start] = 0;
    let pit = start;
    let again = false;
    trace?.push({ at: start, hand, g: cloneGame(g) });
    for (let guard = 0; hand > 0 && guard < 2000; guard++) {
      pit = (pit + 1) % 14;
      if (pit === (7 + g.player * 7) % 14) {
        g.stores[g.player]++;
        hand--;
        trace?.push({ at: "store", hand, g: cloneGame(g) });
        if (hand === 0) {
          again = true;
          break;
        }
      }
      if (hand === 1 && g.pits[pit] > 0) {
        hand += g.pits[pit];
        g.pits[pit] = 0;
      } else {
        g.pits[pit]++;
        hand--;
      }
      trace?.push({ at: pit, hand, g: cloneGame(g) });
    }
    if (!again) {
      const opp = 13 - pit;
      if (g.pits[opp]) {
        g.stores[g.player] += g.pits[opp];
        g.pits[opp] = 0;
        trace?.push({ at: opp, hand: 0, capture: true, g: cloneGame(g) });
      }
    }
    return again;
  }

  function play(g, move, trace) {
    const again = sow(g, move, trace);
    if (!again) g.player = 1 - g.player;
    return again;
  }

  /** The depth-limited DFS bot: best store difference `depth` moves ahead. */
  function dfsMove(game, depth) {
    const score = (g, me) => g.stores[me] - g.stores[1 - me];
    const search = (g, d, me) => {
      if (d === 0 || isOver(g)) return score(g, me);
      const mine = g.player === me;
      let best = mine ? -Infinity : Infinity;
      for (const m of validMoves(g)) {
        const c = cloneGame(g);
        play(c, m);
        const s = search(c, d - 1, me);
        best = mine ? Math.max(best, s) : Math.min(best, s);
      }
      return best;
    };
    let bestMove = null;
    let best = -Infinity;
    for (const m of validMoves(game)) {
      const c = cloneGame(game);
      play(c, m);
      const s = search(c, depth - 1, game.player);
      if (s > best) {
        best = s;
        bestMove = m;
      }
    }
    return bestMove;
  }

  // --- Dec 2022: the command-line game loop ------------------------------------
  VISUALS.mancalaCli = (canvas) => {
    const rand = rng(12);
    const states = [];
    const g = newGame();
    for (let i = 0; i < 14 && !isOver(g); i++) {
      const moves = validMoves(g);
      const move = moves[Math.floor(rand() * moves.length)];
      states.push({ g: cloneGame(g), move });
      play(g, move);
    }
    states.push({ g: cloneGame(g), move: null });
    const STEP = 2.4;
    const PERIOD = states.length * STEP;
    const pad = (n) => String(n).padStart(2, " ");

    return {
      still: STEP * 3 + 2,
      draw(time) {
        const t = time % PERIOD;
        const i = Math.floor(t / STEP);
        const local = t - i * STEP;
        const { g: s, move } = states[i];
        const ctx = surface(canvas);
        ctx.fillStyle = COL.panel;
        roundRect(ctx, 10, 10, 340, 250, 8);
        ctx.fill();
        const line = (str, row, color = COL.paper) => text(ctx, str, 24, 34 + row * 17, { size: 11, font: MONO, color });
        line("$ python mancala.py", 0, COL.dim);
        const top = [13, 12, 11, 10, 9, 8, 7].map((p) => `[${pad(s.pits[p])}]`).join("");
        const bottom = [0, 1, 2, 3, 4, 5, 6].map((p) => `[${pad(s.pits[p])}]`).join("");
        line("       7   6   5   4   3   2   1", 2, COL.dim);
        line(`     ${top}`, 3);
        line(`(${pad(s.stores[1])})                            (${pad(s.stores[0])})`, 4, COL.accent);
        line(`     ${bottom}`, 5);
        line("       1   2   3   4   5   6   7", 6, COL.dim);
        if (move === null) {
          line(`Game over: ${s.stores[0]} - ${s.stores[1]}`, 8, COL.accent);
          return;
        }
        const who = s.player === 0 ? "Player 1" : "Player 2";
        const choice = String(s.player === 0 ? move + 1 : move - 6);
        const prompt = `${who}, pick a pit (1-7): `;
        line(prompt + (local > 0.8 ? choice : ""), 8);
        if (local <= 0.8 && Math.floor(local * 3) % 2 === 0) {
          ctx.font = `400 11px ${MONO}`;
          ctx.fillStyle = COL.paper;
          ctx.fillRect(24 + ctx.measureText(prompt).width, 34 + 8 * 17 - 6, 7, 12);
        }
        if (local > 1.2) line(`sowing ${s.pits[move]} seeds from pit ${choice}...`, 9, COL.dim);
      },
    };
  };

  // --- Dec 2022 - Jan 2023: the archiving bot ----------------------------------
  VISUALS.discord = (canvas) => {
    const threads = [
      { name: "series-a", base: 214, color: COL.accent },
      { name: "series-b", base: 87, color: COL.blue },
      { name: "fan-art-c", base: 152, color: COL.sand },
    ];
    const rand = rng(3);
    const items = Array.from({ length: 64 }, (_, i) => ({ thread: Math.floor(rand() * 3), id: 100 + i * 3 + Math.floor(rand() * 3) }));
    const STEP = 0.9;
    const FLY = 0.7;
    const PERIOD = items.length * STEP;
    const rowY = (i) => 86 + i * 58;
    const QY = 34; // top of the queue column

    return {
      still: STEP * 6 + 0.02,
      draw(time) {
        const t = time % PERIOD;
        const n = Math.floor(t / STEP); // items already delivered
        const k = ease((t - n * STEP) / FLY);
        const ctx = surface(canvas);

        text(ctx, "queue/", 22, 22, { size: 10, font: MONO, color: COL.dim });
        text(ctx, "# archive · threads", 148, 22, { size: 10, font: MONO, color: COL.dim });

        // Queue of files waiting to be archived; it shuffles up as one leaves.
        for (let q = 0; q < 5; q++) {
          const item = items[(n + q + 1) % items.length];
          const y = QY + (q + 1 - k) * 42;
          ctx.globalAlpha = q === 4 ? k : 1;
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, 16, y, 108, 34, 5);
          ctx.fill();
          ctx.fillStyle = threads[item.thread].color;
          roundRect(ctx, 22, y + 5, 24, 24, 3);
          ctx.fill();
          text(ctx, `#${item.id}.jpg`, 54, y + 17, { size: 9, font: MONO, color: COL.dim });
          ctx.globalAlpha = 1;
        }

        // Threads, with a running post count
        threads.forEach((th, i) => {
          const delivered = items.slice(0, n + (k >= 1 ? 1 : 0)).filter((it) => it.thread === i).length;
          const y = rowY(i);
          const current = items[n % items.length];
          const flash = current.thread === i && k > 0.85 ? 1 - (k - 0.85) / 0.15 : 0;
          ctx.fillStyle = flash > 0 ? `rgba(227, 154, 134, ${0.12 + flash * 0.2})` : COL.ghost;
          roundRect(ctx, 144, y - 20, 200, 42, 6);
          ctx.fill();
          text(ctx, `# ${th.name}`, 156, y - 4, { size: 11, color: COL.paper, weight: 600 });
          text(ctx, `${th.base + delivered} posts`, 156, y + 11, { size: 9, color: COL.dim });
          ctx.fillStyle = th.color;
          ctx.beginPath();
          ctx.arc(330, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // The file being posted flies from the queue into its thread
        const cur = items[n % items.length];
        const x = lerp(22, 300, k);
        const y = lerp(QY + 5, rowY(cur.thread) - 12, k);
        ctx.fillStyle = threads[cur.thread].color;
        ctx.globalAlpha = 1 - Math.max(0, k - 0.8) * 5;
        roundRect(ctx, x, y, 24, 24, 3);
        ctx.fill();
        ctx.globalAlpha = 1;
        text(ctx, "sorted by title · logged to posts.csv", 16, 258, { size: 9, color: COL.dim });
      },
    };
  };

  // --- May 2023: Coup Elo ratings (real games, names replaced) -----------------
  VISUALS.coup = (canvas) => {
    const players = {
      A: [1000, 1015, 1026, 1092, 1086, 1020, 942, 912, 974, 996, 1013, 1029, 1072, 1108, 1149, 1152, 1115, 1083, 1117, 1117, 1117, 1117, 1117],
      B: [1000, 1044, 990, 1007, 1050, 1082, 1077, 1133, 1128, 1155, 1117, 1146, 1109, 1078, 1078, 1078, 1078, 1078, 1078, 1078, 1078, 1078, 1078],
      C: [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1033, 969, 992, 1011, 965, 1023, 949, 950, 1011],
      D: [1000, 1073, 1040, 1075, 1130, 1026, 1063, 1033, 1014, 968, 1021, 973, 933, 900, 900, 900, 900, 900, 900, 912, 951, 983, 1007],
      E: [1000, 956, 1011, 964, 928, 930, 933, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994, 994],
      F: [1000, 926, 1018, 940, 880, 982, 942, 971, 932, 930, 898, 901, 934, 962, 943, 927, 896, 962, 956, 926, 992, 924, 931],
      G: [1000, 986, 916, 922, 927, 959, 1042, 958, 958, 958, 958, 958, 958, 958, 958, 958, 958, 958, 958, 897, 880, 865, 824],
    };
    const games = players.A.length - 1;
    const x0 = 44, x1 = 320, y0 = 36, y1 = 232;
    const lo = 800, hi = 1180;
    const X = (i) => x0 + (i / games) * (x1 - x0);
    const Y = (r) => y1 - ((r - lo) / (hi - lo)) * (y1 - y0);
    const PERIOD = 11;
    const shades = { A: COL.accent, B: COL.blue, C: "#b9d7a8", D: "#e6cf8f", E: "#c9b3e0", F: "#9fd4d0", G: "#d9a3b8" };

    return {
      still: 9,
      draw(time) {
        const t = time % PERIOD;
        const upto = ease(t / 7) * games;
        const ctx = surface(canvas);
        text(ctx, "Elo rating after each game", 18, 16, { size: 10, color: COL.dim });
        [850, 950, 1050, 1150].forEach((r) => {
          ctx.fillStyle = COL.ghost;
          ctx.fillRect(x0, Y(r), x1 - x0, 1);
          text(ctx, String(r), x0 - 6, Y(r), { size: 8, align: "right", color: COL.dim });
        });
        text(ctx, "game 1", x0, 250, { size: 8, color: COL.dim });
        text(ctx, `game ${games}`, x1, 250, { size: 8, color: COL.dim, align: "right" });

        const ends = [];
        Object.entries(players).forEach(([name, series]) => {
          const lead = name === "A";
          ctx.strokeStyle = shades[name];
          ctx.globalAlpha = lead ? 1 : 0.6;
          ctx.lineWidth = lead ? 2.2 : 1.2;
          ctx.beginPath();
          const whole = Math.floor(upto);
          for (let i = 0; i <= whole; i++) (i ? ctx.lineTo : ctx.moveTo).call(ctx, X(i), Y(series[i]));
          let ex = X(whole), ey = Y(series[whole]);
          if (whole < games) {
            const f = upto - whole;
            ex = lerp(X(whole), X(whole + 1), f);
            ey = lerp(Y(series[whole]), Y(series[whole + 1]), f);
            ctx.lineTo(ex, ey);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = shades[name];
          ctx.beginPath();
          ctx.arc(ex, ey, lead ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
          ends.push({ name, y: ey, x: ex });
        });
        if (upto >= games) {
          ends.sort((p, q) => p.y - q.y);
          for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 10);
          ends.forEach((e) => text(ctx, `Player ${e.name}`, e.x + 6, e.y, { size: 8, color: shades[e.name] }));
        }
      },
    };
  };

  // --- Jan 2024: Re:Zero volume release prediction -----------------------------
  VISUALS.lightNovels = (canvas) => {
    const jp = [2014.063, 2014.151, 2014.227, 2014.479, 2014.81, 2015.227, 2015.731, 2016.23, 2016.728, 2016.816, 2016.977, 2017.227, 2017.476, 2017.731, 2017.98, 2018.225, 2018.731, 2018.98, 2019.233, 2019.479, 2019.731, 2020.23, 2020.482, 2020.734, 2020.983, 2021.227, 2021.479, 2021.977, 2022.227, 2022.476, 2022.723, 2022.975, 2023.238, 2023.474, 2023.731, 2023.98, 2024.23, 2024.482, 2024.734, 2025.225, 2025.479, 2025.731, 2025.98, 2026.227, 2026.479, 2026.731];
    const en = [2016.548, 2016.873, 2017.216, 2017.465, 2017.83, 2018.156, 2018.482, 2018.827, 2019.134, 2019.46, 2019.92, 2020.151, 2020.553, 2020.802, 2021.164, 2021.471, 2021.854, 2022.142, 2022.564, 2022.89, 2023.216, 2023.465, 2023.81, 2024.214, 2024.559, 2024.903, 2025.419, 2025.956, 2026.531, 2026.934];
    const [a, b] = [2016.0431, 0.3467]; // English date = a + b * (volume - 1)
    const x0 = 34, x1 = 344, y0 = 30, y1 = 236;
    const X = (yr) => x0 + ((yr - 2014) / (2033 - 2014)) * (x1 - x0);
    const Y = (v) => y1 - (v / 48) * (y1 - y0);
    const PERIOD = 12;
    const dot = (ctx, x, y, color, hollow) => {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      if (hollow) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
    };

    return {
      still: 10,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        // Axes
        ctx.fillStyle = COL.faint;
        ctx.fillRect(x0, y1, x1 - x0, 1);
        [2015, 2020, 2025, 2030].forEach((yr) => text(ctx, String(yr), X(yr), y1 + 12, { size: 8, align: "center", color: COL.dim }));
        [10, 20, 30, 40].forEach((v) => {
          ctx.fillStyle = COL.ghost;
          ctx.fillRect(x0, Y(v), x1 - x0, 1);
          text(ctx, String(v), x0 - 6, Y(v), { size: 8, align: "right", color: COL.dim });
        });
        text(ctx, "volume", 8, 18, { size: 8, color: COL.dim });
        // Today
        const today = 2026.73;
        ctx.fillStyle = "rgba(246, 244, 239, 0.25)";
        ctx.fillRect(X(today), y0, 1, y1 - y0);
        text(ctx, "today", X(today) + 3, y1 - 8, { size: 8, color: COL.dim });

        const jpN = Math.floor(ease(t / 2.2) * jp.length);
        jp.slice(0, jpN).forEach((yr, i) => dot(ctx, X(yr), Y(i + 1), COL.blue));
        const enN = Math.floor(ease((t - 2.2) / 2) * en.length);
        en.slice(0, enN).forEach((yr, i) => dot(ctx, X(yr), Y(i + 1), COL.accent));

        // Regression line, then predicted English dates for the rest
        const k = ease((t - 4.4) / 1.2);
        if (k > 0) {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = COL.accentSoft;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(X(a), Y(1));
          const vEnd = lerp(1, 47, k);
          ctx.lineTo(X(a + b * (vEnd - 1)), Y(vEnd));
          ctx.stroke();
          ctx.setLineDash([]);
        }
        const predN = Math.floor(ease((t - 5.6) / 1.6) * (jp.length - en.length));
        for (let v = en.length + 1; v <= en.length + predN; v++) dot(ctx, X(a + b * (v - 1)), Y(v), COL.accent, true);

        // Legend and verdict
        dot(ctx, 44, 16, COL.blue);
        text(ctx, "Japan", 50, 16, { size: 9, color: COL.dim });
        dot(ctx, 92, 16, COL.accent);
        text(ctx, "English", 98, 16, { size: 9, color: COL.dim });
        dot(ctx, 148, 16, COL.accent, true);
        text(ctx, "predicted", 154, 16, { size: 9, color: COL.dim });
        const v = ease((t - 7.4) / 0.8);
        if (v > 0) {
          ctx.globalAlpha = v;
          text(ctx, "vol. 46 in English ≈ late 2031", x0 + 8, 40, { size: 10, color: COL.accent, weight: 600 });
          text(ctx, "R² = 0.997 · the gap keeps growing", x0 + 8, 55, { size: 9, color: COL.dim });
          ctx.globalAlpha = 1;
        }
      },
    };
  };

  // --- Jun 2024: the trapped knight --------------------------------------------
  // Squares numbered in a spiral from 1; the knight always jumps to the
  // lowest-numbered square it hasn't visited, until it has nowhere to go.
  VISUALS.knight = (canvas) => {
    const num = (x, y) => {
      const d = Math.max(Math.abs(x), Math.abs(y));
      const layer = (2 * d + 1) ** 2;
      if (Math.abs(x) >= Math.abs(y)) return x >= 0 ? layer - d - y : layer - 5 * d + y;
      return y >= 0 ? layer - 3 * d + x : layer - 7 * d - x;
    };
    const JUMPS = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];
    const path = [[0, 0]];
    const seen = new Set([num(0, 0)]);
    for (;;) {
      const [x, y] = path[path.length - 1];
      let best = null;
      for (const [dx, dy] of JUMPS) {
        const n = num(x + dx, y + dy);
        if (!seen.has(n) && (best === null || n < best[0])) best = [n, x + dx, y + dy];
      }
      if (!best) break;
      seen.add(best[0]);
      path.push([best[1], best[2]]);
    }
    const moves = path.length - 1;
    const last = path[moves];
    const trappedOn = num(last[0], last[1]);
    const span = Math.max(...path.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
    const scale = 110 / span;
    const cx = W / 2, cy = 140;
    const P = ([x, y]) => [cx + x * scale, cy - y * scale];
    // Blue to terracotta to pale gold along the route
    const stops = [[143, 189, 230], [227, 154, 134], [246, 227, 170]];
    const colorAt = (f) => {
      const s = f < 0.5 ? 0 : 1;
      const k = f < 0.5 ? f * 2 : (f - 0.5) * 2;
      const c = stops[s].map((v, i) => Math.round(lerp(v, stops[s + 1][i], k)));
      return `rgb(${c})`;
    };
    const PERIOD = 12;

    return {
      still: 10,
      draw(time) {
        const t = time % PERIOD;
        const n = Math.floor(clamp(t / 8, 0, 1) * moves);
        const ctx = surface(canvas);
        ctx.lineWidth = 0.8;
        for (let i = 1; i <= n; i++) {
          const [ax, ay] = P(path[i - 1]);
          const [bx, by] = P(path[i]);
          ctx.strokeStyle = colorAt(i / moves);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        text(ctx, `move ${n.toLocaleString("en-US")}`, 16, 18, { size: 10, font: MONO, color: COL.paper });
        if (n >= moves) {
          const [x, y] = P(last);
          ctx.strokeStyle = COL.red;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 5, y - 5);
          ctx.lineTo(x + 5, y + 5);
          ctx.moveTo(x + 5, y - 5);
          ctx.lineTo(x - 5, y + 5);
          ctx.stroke();
          text(ctx, `trapped on square ${trappedOn.toLocaleString("en-US")}`, 344, 18, { size: 10, align: "right", color: COL.red, weight: 600 });
        }
      },
    };
  };

  // --- Aug 2024: the DFS bot playing the real rules ----------------------------
  VISUALS.mancalaBot = (canvas) => {
    const DEPTHS = [4, 1]; // bottom player looks 4 moves ahead, top player 1
    let game, frames, fi, pause;
    const reset = () => {
      game = newGame();
      frames = [];
      fi = 0;
      pause = 0;
    };
    reset();
    const nextMove = () => {
      if (isOver(game)) return false;
      const trace = [];
      const move = dfsMove(game, DEPTHS[game.player]);
      const mover = game.player;
      play(game, move, trace);
      trace.forEach((f) => (f.mover = mover));
      frames = trace;
      fi = 0;
      return true;
    };

    const pitX = (i) => 70 + i * 36.5;
    const pos = (p) => (p < 7 ? [pitX(p), 176] : [pitX(13 - p), 94]);

    function drawBoard(ctx, g, at, mover, hand, capture) {
      ctx.fillStyle = "rgba(120, 82, 50, 0.35)";
      roundRect(ctx, 12, 56, 336, 158, 40);
      ctx.fill();
      // Stores: bottom player's on the right, top player's on the left
      [[1, 34], [0, 326]].forEach(([p, x]) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        roundRect(ctx, x - 16, 76, 32, 118, 16);
        ctx.fill();
        text(ctx, String(g.stores[p]), x, 135, { size: 14, align: "center", color: p === 0 ? COL.accent : COL.blue, weight: 600 });
      });
      for (let p = 0; p < 14; p++) {
        const [x, y] = pos(p);
        const active = p === at;
        ctx.fillStyle = active ? (capture ? "rgba(217, 105, 95, 0.55)" : "rgba(227, 154, 134, 0.4)") : "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, String(g.pits[p]), x, y, { size: 11, align: "center", color: g.pits[p] ? COL.paper : COL.faint });
      }
      if (at === "store") {
        const x = mover === 0 ? 326 : 34;
        ctx.strokeStyle = COL.accent;
        ctx.lineWidth = 1.5;
        roundRect(ctx, x - 16, 76, 32, 118, 16);
        ctx.stroke();
      }
      text(ctx, `Bot · looks ${DEPTHS[0]} moves ahead`, 180, 236, { size: 10, align: "center", color: COL.accent });
      text(ctx, `Bot · looks ${DEPTHS[1]} move ahead`, 180, 34, { size: 10, align: "center", color: COL.blue });
      if (hand > 0) text(ctx, `in hand: ${hand}`, 344, 256, { size: 9, align: "right", color: COL.dim, font: MONO });
    }

    let lastTime = 0;
    let acc = 0;
    return {
      still: null,
      draw(time) {
        const ctx = surface(canvas);
        if (time === null) {
          // Reduced motion: show the position a few moves into a real game.
          reset();
          for (let i = 0; i < 6; i++) nextMove();
          const f = frames[frames.length - 1];
          drawBoard(ctx, f.g, null, f.mover, 0, false);
          return;
        }
        acc += Math.max(0, time - lastTime);
        lastTime = time;
        // Advance the animation: one sowing step per tick, faster for long relays.
        const tick = frames.length > 40 ? 0.05 : 0.11;
        while (acc > tick) {
          acc -= tick;
          if (pause > 0) {
            pause -= tick;
            if (pause <= 0 && isOver(game)) reset();
            continue;
          }
          if (fi < frames.length - 1) fi++;
          else if (!nextMove()) pause = 3;
          else if (frames.length) fi = 0;
          if (fi === frames.length - 1) pause = 0.5;
        }
        const f = frames[fi];
        const g = f ? f.g : game;
        drawBoard(ctx, g, f ? f.at : null, f ? f.mover : 0, f ? f.hand : 0, f?.capture);
        if (isOver(game) && fi === frames.length - 1) {
          const [s0, s1] = game.stores;
          const verdict = s0 === s1 ? `Draw, ${s0}-${s1}` : `${s0 > s1 ? "4-move" : "1-move"} bot wins ${Math.max(s0, s1)}-${Math.min(s0, s1)}`;
          ctx.fillStyle = "rgba(22, 21, 20, 0.75)";
          roundRect(ctx, 90, 118, 180, 34, 8);
          ctx.fill();
          text(ctx, verdict, 180, 135, { size: 12, align: "center", color: COL.paper, weight: 600 });
        }
      },
    };
  };

  // --- Oct 2024: Wildlife Illustrated, version by version ---------------------------
  // The app's own changelog: each version appears in turn with what it changed.
  // The version string is derived like the real one: patch = commits, +n = drawings.
  VISUALS.wildlife = (canvas) => {
    const VERSIONS = [
      ["v0.1", "Oct 2024", "First page", "HTML · CSS · JS", ""],
      ["v0.2", "Jan 2025", "Deployment", "GitHub Actions", ""],
      ["v0.3", "Feb 2025", "Deno & build tools", "Deno · esbuild · tests", "migration"],
      ["v0.4", "May 2025", "Vue rewrite", "Vue · WebP", "rewrite"],
      ["v0.5", "Jan 2026", "Tailwind & dark mode", "Tailwind · git hooks", "migration"],
      ["v0.6", "Feb 2026", "Search & data", "Dhivehi names · search", ""],
      ["v0.7", "Mar 2026", "Multi-collection", "birds · sharks · shells", "rewrite"],
      ["v0.8", "Jul 2026", "Redesign & performance", "Lighthouse 100 · CI", ""],
    ];
    const STEP = 0.9;
    const PERIOD = VERSIONS.length * STEP + 4;
    const drawings = () => {
      const n = parseInt(document.querySelector('[data-count="all"]')?.textContent || "", 10);
      return Number.isFinite(n) ? n : 18;
    };

    return {
      still: PERIOD - 1,
      draw(time) {
        const t = time % PERIOD;
        const shown = Math.min(VERSIONS.length, Math.floor(t / STEP) + 1);
        const ctx = surface(canvas);
        text(ctx, "CHANGELOG.md", 16, 18, { size: 10, font: MONO, color: COL.paper, weight: 700 });

        VERSIONS.slice(0, shown).forEach(([v, date, title, , tag], i) => {
          const y = 42 + i * 22;
          const latest = i === shown - 1;
          const k = latest ? ease((t - i * STEP) / 0.35) : 1;
          ctx.globalAlpha = k;
          if (latest) {
            ctx.fillStyle = COL.ghost;
            roundRect(ctx, 10, y - 10, 340, 20, 4);
            ctx.fill();
          }
          text(ctx, v, 16, y, { size: 9.5, font: MONO, color: latest ? COL.accent : COL.dim, weight: 700 });
          text(ctx, date, 52, y, { size: 8.5, color: COL.dim });
          text(ctx, title, 110, y, { size: 9.5, color: latest ? COL.paper : COL.dim, weight: latest ? 600 : 400 });
          if (tag) {
            ctx.font = `600 7.5px ${SANS}`;
            const w = ctx.measureText(tag).width + 10;
            ctx.strokeStyle = tag === "rewrite" ? COL.accent : COL.blueSoft;
            ctx.lineWidth = 1;
            roundRect(ctx, 344 - w, y - 6, w, 12, 6);
            ctx.stroke();
            text(ctx, tag, 344 - w / 2, y, { size: 7.5, align: "center", color: tag === "rewrite" ? COL.accent : COL.blue, weight: 600 });
          }
          ctx.globalAlpha = 1;
        });

        // The stack of the newest version, and the derived version string
        const [, , , stack] = VERSIONS[shown - 1];
        ctx.fillStyle = COL.faint;
        ctx.fillRect(16, 222, 328, 1);
        text(ctx, stack, 16, 238, { size: 9.5, color: COL.blue, weight: 600 });
        const commits = [2, 11, 18, 35, 46, 60, 72, 149][shown - 1];
        const n = shown === VERSIONS.length ? drawings() : [2, 3, 3, 14, 15, 17, 18, 18][shown - 1];
        text(ctx, `${VERSIONS[shown - 1][0]}.${String(commits).padStart(3, "0")}+${String(n).padStart(3, "0")}`, 344, 238, {
          size: 9.5,
          align: "right",
          font: MONO,
          color: COL.paper,
        });
        text(ctx, "patch = commits · +n = drawings", 344, 254, { size: 7.5, align: "right", color: COL.dim });
      },
    };
  };

  // --- Aug 2025: radar and Doppler shift ------------------------------------------
  VISUALS.radar = (canvas) => {
    const F0 = 10e9; // 10 GHz, X band
    const C = 3e8;
    // Targets: start position (polar, 0-1 of range), heading, speed in m/s
    const targets = [
      { r: 0.8, a: 0.6, heading: 0.6 + Math.PI, v: 240 }, // inbound aircraft
      { r: 0.45, a: 2.4, heading: 2.4, v: 90 }, // outbound
      { r: 0.65, a: 4.1, heading: 4.1 + Math.PI / 2, v: 60 }, // crossing, little radial speed
      { r: 0.3, a: 5.3, heading: 0, v: 0 }, // stationary
    ];
    const cx = 140, cy = 135, R = 116;
    const SWEEP = 1.3; // radians per second
    const LOOP = 16;

    return {
      still: 3.2,
      draw(time) {
        const t = time % LOOP;
        const ctx = surface(canvas);
        // Scope
        ctx.fillStyle = "rgba(20, 40, 30, 0.55)";
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(160, 230, 190, 0.18)";
        ctx.lineWidth = 1;
        [0.33, 0.66, 1].forEach((f) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(cx - R, cy);
        ctx.lineTo(cx + R, cy);
        ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx, cy + R);
        ctx.stroke();

        // Sweep with a fading trail
        const sweep = (time * SWEEP) % (Math.PI * 2);
        for (let i = 0; i < 24; i++) {
          const a = sweep - i * 0.035;
          ctx.strokeStyle = `rgba(160, 230, 190, ${0.5 * (1 - i / 24)})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
          ctx.stroke();
        }

        // Targets: brightest just after the sweep passes them
        const readouts = [];
        targets.forEach((tg, i) => {
          const x0 = Math.cos(tg.a) * tg.r, y0 = Math.sin(tg.a) * tg.r;
          const move = (tg.v / 240) * 0.05 * t;
          let x = x0 + Math.cos(tg.heading) * move;
          let y = y0 + Math.sin(tg.heading) * move;
          const dist = Math.hypot(x, y);
          if (dist > 0.95) return;
          const ang = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
          const since = (((sweep - ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const glow = Math.exp(-since / 2.2);
          // Radial velocity: positive when approaching the radar
          const radial = -(Math.cos(tg.heading) * x + Math.sin(tg.heading) * y) / (dist || 1) * tg.v;
          const fd = (2 * radial * F0) / C;
          const color = Math.abs(radial) < 5 ? "160, 230, 190" : radial > 0 ? "143, 189, 230" : "227, 154, 134";
          ctx.fillStyle = `rgba(${color}, ${0.2 + glow * 0.8})`;
          ctx.beginPath();
          ctx.arc(cx + x * R, cy + y * R, 3.5, 0, Math.PI * 2);
          ctx.fill();
          readouts.push({ i, dist, fd, color, glow });
        });

        // Readout panel
        text(ctx, "range · Doppler", 266, 36, { size: 9, color: COL.dim });
        readouts.sort((p, q) => p.i - q.i).forEach((ro, row) => {
          const y = 62 + row * 34;
          ctx.fillStyle = `rgb(${ro.color})`;
          ctx.beginPath();
          ctx.arc(268, y, 3, 0, Math.PI * 2);
          ctx.fill();
          const km = (ro.dist * 60).toFixed(0);
          text(ctx, `${km} km`, 277, y - 6, { size: 9, color: COL.paper, font: MONO });
          const khz = ro.fd / 1000;
          const label = Math.abs(khz) < 0.2 ? "no shift" : `${khz > 0 ? "+" : ""}${khz.toFixed(1)} kHz`;
          text(ctx, label, 277, y + 7, { size: 9, color: `rgb(${ro.color})`, font: MONO });
        });
        text(ctx, "f_d = 2·v·f₀/c", 264, 250, { size: 9, color: COL.dim, font: MONO });
      },
    };
  };

  // --- Sep 2026: this portfolio's pipeline ------------------------------------------
  VISUALS.pipeline = (canvas) => {
    const steps = [
      ["site/", "HTML · CSS · JS"],
      ["build", "stamp partials"],
      ["check", "8 pages · 176 images"],
      ["gh-pages", "live"],
    ];
    const PERIOD = 6;
    return {
      still: 5,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const xs = steps.map((_, i) => 48 + i * 88);
        const y = 118;
        const k = clamp(t / 4, 0, 1) * (steps.length - 1);
        ctx.fillStyle = COL.faint;
        ctx.fillRect(xs[0], y - 1, xs[3] - xs[0], 2);
        ctx.fillStyle = COL.accent;
        ctx.fillRect(xs[0], y - 1, (xs[3] - xs[0]) * (k / 3), 2);
        steps.forEach(([name, note], i) => {
          const lit = k >= i - 0.02;
          ctx.fillStyle = lit ? COL.accent : "rgba(0, 0, 0, 0.35)";
          ctx.strokeStyle = lit ? COL.accent : COL.faint;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(xs[i], y, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (lit) text(ctx, "✓", xs[i], y + 1, { size: 12, align: "center", color: "#161514", weight: 700 });
          text(ctx, name, xs[i], y + 32, { size: 11, align: "center", color: lit ? COL.paper : COL.dim, font: MONO, weight: 600 });
          text(ctx, note, xs[i], y + 48, { size: 8, align: "center", color: COL.dim });
        });
        text(ctx, "git push main → build → check → deploy", 180, 50, { size: 10, align: "center", color: COL.dim, font: MONO });
      },
    };
  };

  // --- Runner ------------------------------------------------------------------------
  function init() {
    const items = [];
    document.querySelectorAll("[data-vis]").forEach((el) => {
      const make = VISUALS[el.dataset.vis];
      if (make) items.push({ el, vis: make(el), t: 0, on: false });
    });
    if (!items.length) return;

    const drawStill = () => items.forEach((it) => it.vis.draw(it.vis.still));
    if (reduceMotion || !("IntersectionObserver" in window)) {
      drawStill();
      let timer;
      window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(drawStill, 150);
      });
      return;
    }

    // Draw a first frame for everything so nothing is blank before it scrolls in.
    items.forEach((it) => it.vis.draw(it.vis.still ?? 0));

    let raf = 0;
    let last = 0;
    const loop = (now) => {
      raf = 0;
      const running = items.filter((it) => it.on);
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
    const start = () => {
      if (!raf && !document.hidden && items.some((it) => it.on)) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const it = items.find((i) => i.el === e.target);
        if (it) it.on = e.isIntersecting;
      });
      start();
    });
    items.forEach((it) => io.observe(it.el));
    document.addEventListener("visibilitychange", start);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
