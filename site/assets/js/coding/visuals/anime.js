import { COL, ease, roundRect, SANS, surface, text } from "../core.js";

export const data = new URL("../../../data/anime.json", import.meta.url);

// --- Nov 2021: anime list in numbers -----------------------------------------
export default function anime(canvas, D) {
  // Completed episodes by finish year, from a MyAnimeList export (tools/data/anime.py).
  const { years, episodesByYear: eps, titles, days } = D;
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

      text(ctx, Math.round(shown).toLocaleString("en-US"), 18, 30, {
        size: 30,
        color: COL.paper,
        font: SANS,
        weight: 600,
      });
      text(ctx, "episodes finished", 20, 54, { size: 11, color: COL.dim });
      const doneFrac = shown / total;
      text(
        ctx,
        `${titles.toLocaleString("en-US")} titles · ≈ ${Math.round(days * doneFrac)} days of watching`,
        342,
        30,
        {
          size: 10,
          color: COL.accent,
          align: "right",
        },
      );

      const base = 236;
      const bw = 25;
      years.forEach((y, i) => {
        const x = 22 + i * 32.5;
        const h = (eps[i] / max) * 150 * grow(i);
        ctx.fillStyle = i === 2 ? COL.accent : COL.accentSoft;
        roundRect(ctx, x, base - h, bw, h, 3);
        ctx.fill();
        if (grow(i) > 0.95) {
          text(ctx, eps[i].toLocaleString("en-US"), x + bw / 2, base - h - 9, {
            size: 9,
            align: "center",
            color: COL.dim,
          });
        }
        text(ctx, String(y), x + bw / 2, base + 14, { size: 9, align: "center", color: COL.dim });
      });
      ctx.fillStyle = COL.faint;
      ctx.fillRect(18, base, 324, 1);
    },
  };
}
