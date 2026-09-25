import { clamp, COL, MONO, rng, roundRect, surface, text } from "../core.js";

// --- Oct 2025: AutoCAD layouts by script (illustration) ------------------------------
export default function autocad(canvas) {
  const SHEETS = 8;
  const PERIOD = 10;
  const rand = rng(21);
  const plans = Array.from({ length: SHEETS }, () => Array.from({ length: 5 }, () => [rand(), rand(), rand() > 0.5]));
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
        text(ctx, String(i + 1).padStart(2, "0"), x + 65, y + 46, {
          size: 7,
          align: "center",
          color: COL.paper,
          font: MONO,
        });
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
        text(ctx, `${Math.round(Math.min(minutes, mins))} min`, 302, y, {
          size: 9,
          color: i === 1 ? COL.accent : COL.dim,
          font: MONO,
        });
      });
      text(ctx, "illustration", 344, 18, { size: 8, align: "right", color: COL.dim });
    },
  };
}
