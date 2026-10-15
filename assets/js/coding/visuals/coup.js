import { COL, ease, lerp, surface, text } from "../core.js";

export const data = new URL("../../../data/coup.json", import.meta.url);

// --- May 2023: Coup Elo ratings (real games, names replaced) -----------------
export default function coup(canvas, D) {
  const { players } = D;
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
}
