import { COL, ease, lerp, surface, text } from "../core.js";

export const data = new URL("../../../data/rezero.json", import.meta.url);

// --- Jan 2024: Re:Zero volume release prediction -----------------------------
export default function lightNovels(canvas, D) {
  const { jp, en } = D;
  const [a, b] = D.fit; // English date = a + b * (volume - 1)
  // When the newest Japanese volume should reach English
  const catchUp = a + b * (jp.length - 1);
  const part = catchUp % 1 < 0.34 ? "early" : catchUp % 1 < 0.67 ? "mid" : "late";
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
      [2015, 2020, 2025, 2030].forEach((yr) =>
        text(ctx, String(yr), X(yr), y1 + 12, { size: 8, align: "center", color: COL.dim })
      );
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
        text(ctx, `vol. ${jp.length} in English ≈ ${part} ${Math.floor(catchUp)}`, x0 + 8, 40, {
          size: 10,
          color: COL.accent,
          weight: 600,
        });
        text(ctx, `R² = ${D.r2.toFixed(3)} · the gap keeps growing`, x0 + 8, 55, { size: 9, color: COL.dim });
        ctx.globalAlpha = 1;
      }
    },
  };
}
