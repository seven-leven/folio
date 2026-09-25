import { clamp, COL, ease, lerp, MONO, roundRect, surface, text } from "../core.js";

export const data = new URL("../../../data/titanic.json", import.meta.url);

// --- Jul 2025: first machine learning models on the Titanic ----------------------
// First, how each model splits the passengers: every model trained on just two
// features (age and fare) so its decision regions can be drawn, from scikit-learn
// on a 40 x 30 grid ("1" = predicted to survive). Then the real results: each
// model on all features, scored on the same 179 held-out passengers.
export default function titanic(canvas, D) {
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

  const RESULTS = D.results; // [model, accuracy %, wrong of 179]
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
      text(ctx, name, 132, y, {
        size: 9.5,
        align: "right",
        color: best ? COL.paper : COL.dim,
        weight: best ? 600 : 400,
      });
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
}
