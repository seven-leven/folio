import { COL, ease, H, lerp, MONO, rng, roundRect, surface, text, W } from "../core.js";

export const data = new URL("../../../data/coastal.json", import.meta.url);

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
    text(ctx, bypass ? "full: sand bypasses the groyne" : "sand trapped updrift", 16, 236, {
      size: 10,
      color: "#3a3226",
    });
  };
}

// Scene 2: beach profile after each of three storms (assignment data), with the
// sand eroded and deposited shaded. Volumes are the integrated areas, in m³/m.
function profileScene(D) {
  const X = D.x;
  const P = D.profiles;
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
      const [er, de] = D.volumes[storm - 1];
      text(ctx, `${er} m³/m eroded`, 16, 34, { size: 9, color: COL.red });
      text(ctx, `${de} m³/m deposited`, 108, 34, { size: 9, color: COL.blue });
    }
  };
}

// Scene 3: rubble-mound breakwater cross-section, built layer by layer from the
// design results in D.breakwater (crest height, armour weight, layer thicknesses; 1:2 slopes).
function breakwaterScene(D) {
  const B = D.breakwater;
  const Hc = B.crest, SWL = B.designWater;
  const a = 1.5 * B.armour; // crest half-width, three armour stones across
  const SX = 7, SY = 14, CX = 180, BED = 222;
  const X = (m) => CX + m * SX;
  const Y = (m) => BED - m * SY;
  const shape = (t) => {
    const top = a - 0.236 * t;
    const base = a + 2 * Hc - 2.236 * t;
    return [[-base, 0], [-top, Hc - t], [top, Hc - t], [base, 0]];
  };
  const layers = [
    // t: depth of each layer's outer face below the armour surface
    { t: B.armour + B.underlayer1 + B.underlayer2, color: "#d2c9b6", label: "core" },
    { t: B.armour + B.underlayer1, color: "#bdb5a6", label: `underlayer 2 · ${B.underlayer2} m` },
    { t: B.armour, color: "#a39b8e", label: `underlayer 1 · ${B.underlayer1} m` },
    { t: 0, color: "#7f786d", label: `armour · ${B.armourTonnes} t stones · ${B.armour} m` },
  ];

  return (ctx, t) => {
    // Water to the design level, then the seabed
    ctx.fillStyle = "rgba(45, 88, 119, 0.45)";
    ctx.fillRect(0, Y(SWL), W, BED - Y(SWL));
    ctx.fillStyle = "rgba(143, 189, 230, 0.7)";
    ctx.fillRect(0, Y(SWL), W, 1);
    text(ctx, `design water +${SWL} m`, 344, Y(SWL) - 7, { size: 8, align: "right", color: COL.blue });
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
      roundRect(ctx, X(a + 2 * Hc - 1.5), Y(B.toe), 4.5 * SX, B.toe * SY, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    text(ctx, "Rubble-mound breakwater", 16, 18, { size: 10, color: COL.paper, weight: 600 });
    text(ctx, `crest +${Hc} m`, X(0), Y(Hc) - 9, { size: 9, align: "center", color: COL.paper });
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
      text(ctx, `toe · ${B.toe} m high`, 30, 36 + 4 * 13, { size: 8.5, color: COL.dim });
    }
  };
}

export default function coastal(canvas, D) {
  const scenes = [
    ["Groyne", groyneScene()],
    ["Storm profiles", profileScene(D)],
    ["Breakwater", breakwaterScene(D)],
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
        text(ctx, `${j + 1} · ${name}`, x, H - 11, {
          size: 9,
          color: j === i ? COL.paper : COL.dim,
          weight: j === i ? 600 : 400,
        });
        if (j === i) {
          ctx.fillStyle = COL.accent;
          ctx.fillRect(x, H - 3, 100 * (local / SCENE), 2);
        }
      });
    },
  };
}
