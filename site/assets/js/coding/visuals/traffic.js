import { COL, ease, roundRect, surface, text } from "../core.js";

export const data = new URL("../../../data/traffic.json", import.meta.url);

// --- Jun 2022: the traffic model benchmark -----------------------------------
// Real timings (average of 10,000 runs) for every version of the function.
export default function traffic(canvas, D) {
  const runs = D.runs.map(([label, us, wrong]) => [label, us, wrong]);
  const max = Math.ceil(Math.max(...runs.map((r) => r[1])) / 10) * 10;
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
        text(ctx, name, 78, y, {
          size: 9,
          align: "right",
          color: mine || best ? COL.paper : COL.dim,
          weight: mine || best ? 600 : 400,
        });
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
      if (k > 0) {
        text(ctx, `${Math.round(runs[0][1] / runs[runs.length - 1][1])}× faster than mine`, 342, 16, {
          size: 10,
          align: "right",
          color: `rgba(227, 154, 134, ${k})`,
          weight: 600,
        });
      }
    },
  };
}
