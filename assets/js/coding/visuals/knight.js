import { clamp, COL, lerp, MONO, surface, text, W } from "../core.js";

// --- Jun 2024: the trapped knight --------------------------------------------
// Squares numbered in a spiral from 1; the knight always jumps to the
// lowest-numbered square it hasn't visited, until it has nowhere to go.
export default function knight(canvas) {
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
        text(ctx, `trapped on square ${trappedOn.toLocaleString("en-US")}`, 344, 18, {
          size: 10,
          align: "right",
          color: COL.red,
          weight: 600,
        });
      }
    },
  };
}
