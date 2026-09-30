import { clamp, COL, MONO, surface, text } from "../core.js";

// --- Sep 2026: this portfolio's pipeline ------------------------------------------
export default function pipeline(canvas) {
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
        text(ctx, name, xs[i], y + 32, {
          size: 11,
          align: "center",
          color: lit ? COL.paper : COL.dim,
          font: MONO,
          weight: 600,
        });
        text(ctx, note, xs[i], y + 48, { size: 8, align: "center", color: COL.dim });
      });
      text(ctx, "git push main → build → check → deploy", 180, 50, {
        size: 10,
        align: "center",
        color: COL.dim,
        font: MONO,
      });
    },
  };
}
