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
    const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const eps = [133, 1642, 3297, 2521, 2326, 1545, 930, 250];
    const total = eps.reduce((a, b) => a + b, 0);
    const max = Math.max(...eps);
    const PERIOD = 10;
    return {
      still: 8,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const grow = (i) => ease((t - 0.4 - i * 0.45) / 0.7);
        let shown = 0;
        eps.forEach((e, i) => (shown += e * grow(i)));

        text(ctx, Math.round(shown).toLocaleString("en-US"), 18, 30, { size: 30, color: COL.paper, font: SANS, weight: 600 });
        text(ctx, "episodes finished", 20, 54, { size: 11, color: COL.dim });
        const doneFrac = shown / total;
        text(ctx, `1,293 titles · ≈ ${Math.round(200 * doneFrac)} days of watching`, 342, 30, {
          size: 10,
          color: COL.accent,
          align: "right",
        });

        const base = 236;
        const bw = 30;
        years.forEach((y, i) => {
          const x = 24 + i * 40;
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

  // --- Nov 2022: longshore drift filling a groyne ------------------------------
  VISUALS.groyne = (canvas) => {
    const PERIOD = 12;
    const GX = 190; // groyne position
    const SHORE = 150; // original shoreline
    const rand = rng(7);
    const grains = Array.from({ length: 70 }, () => ({ x: rand() * W, o: rand() * 6, s: 0.6 + rand() * 0.8 }));
    const shoreAt = (x, p) =>
      x < GX ? SHORE - 46 * p * Math.exp(-(GX - x) / 70) : SHORE + 22 * p * Math.exp(-(x - GX) / 60);

    return {
      still: 10,
      draw(time) {
        const t = time % PERIOD;
        const p = ease(t / 10);
        const ctx = surface(canvas);

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
        text(ctx, bypass ? "full: sand bypasses the groyne" : "sand trapped updrift", 16, 252, { size: 10, color: "#3a3226" });
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

  // --- Jan 2025: Wildlife Illustrated progress ----------------------------------
  VISUALS.wildlife = (canvas) => {
    const read = (sel, fallback) => {
      const n = parseInt(document.querySelector(sel)?.textContent || "", 10);
      return Number.isFinite(n) ? n : fallback;
    };
    const PERIOD = 8;
    return {
      still: 6,
      draw(time) {
        const t = time % PERIOD;
        const ctx = surface(canvas);
        const done = read('[data-count="all"]', 18);
        const total = read('[data-total="all"]', 276);
        const k = ease((t - 0.3) / 2.5);
        const cx = 110, cy = 138, r = 78;
        ctx.lineWidth = 12;
        ctx.strokeStyle = COL.ghost;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = COL.accent;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (done / total) * Math.PI * 2 * k);
        ctx.stroke();
        ctx.lineCap = "butt";
        text(ctx, String(Math.round(done * k)), cx, cy - 6, { size: 30, align: "center", color: COL.paper, weight: 600 });
        text(ctx, `of ${total} species`, cx, cy + 20, { size: 10, align: "center", color: COL.dim });

        const groups = [
          ["Birds", read('[data-count="birds"]', 15), read('[data-total="birds"]', 204), COL.accent],
          ["Shells", read('[data-count="shells"]', 3), read('[data-total="shells"]', 30), COL.sand],
          ["Sharks", read('[data-count="sharks"]', 0), read('[data-total="sharks"]', 42), COL.blue],
        ];
        groups.forEach(([name, n, of, color], i) => {
          const y = 92 + i * 38;
          text(ctx, name, 218, y, { size: 10, color: COL.paper });
          text(ctx, `${n} / ${of}`, 340, y, { size: 9, align: "right", color: COL.dim });
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, 218, y + 10, 122, 6, 3);
          ctx.fill();
          ctx.fillStyle = color;
          roundRect(ctx, 218, y + 10, Math.max(2, (n / of) * 122 * ease((t - 0.8 - i * 0.3) / 1.5)), 6, 3);
          ctx.fill();
        });
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
