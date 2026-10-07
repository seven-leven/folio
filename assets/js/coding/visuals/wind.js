import { COL, lerp, MONO, surface, text } from "../core.js";

export const data = new URL("../../../data/wind.json", import.meta.url);

// --- Dec 2022: forty years of wind -----------------------------------------------
// A wind rose for each year 1980-2019 (days the wind came from each of 16
// directions), and an arrow circling through the year pointing the way the
// wind blows that week, averaged over all forty years.
export default function wind(canvas, D) {
  const ROSE = D.rose;
  const WEEK = D.week; // [direction it comes from (degrees), speed m/s]
  const NAMES = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const MONTHS = "JFMAMJJASOND";
  const cx = 128, cy = 136, R = 84;
  const MAX = 107;
  const LOOP = 13; // one year of the arrow, and one pass through all forty roses
  const rad = (deg) => ((deg - 90) * Math.PI) / 180;

  return {
    still: LOOP * 0.55,
    draw(time) {
      const t = (time % LOOP) / LOOP;
      const ctx = surface(canvas);
      const yf = t * (ROSE.length - 1);
      const yi = Math.floor(yf);
      const counts = ROSE[yi].map((c, s) => lerp(c, ROSE[Math.min(ROSE.length - 1, yi + 1)][s], yf - yi));

      // Rings and compass
      ctx.strokeStyle = COL.ghost;
      ctx.lineWidth = 1;
      [0.33, 0.66, 1].forEach((f) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rose wedges, one per direction
      counts.forEach((c, s) => {
        const r = Math.sqrt(c / MAX) * R;
        const a = rad(s * 22.5);
        ctx.fillStyle = s >= 10 && s <= 13 ? COL.accent : COL.accentSoft;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a - 0.17, a + 0.17);
        ctx.closePath();
        ctx.fill();
      });

      // Month ring and the arrow travelling around it
      const ORBIT = R + 24;
      for (let m = 0; m < 12; m++) {
        const a = -Math.PI / 2 + (m / 12) * Math.PI * 2;
        text(ctx, MONTHS[m], cx + Math.cos(a) * (ORBIT + 13), cy + Math.sin(a) * (ORBIT + 13), {
          size: 7.5,
          align: "center",
          color: COL.dim,
        });
      }
      const wk = Math.floor(t * 52) % 52;
      const [from, speed] = WEEK[wk];
      const oa = -Math.PI / 2 + t * Math.PI * 2;
      const ox = cx + Math.cos(oa) * ORBIT, oy = cy + Math.sin(oa) * ORBIT;
      const to = rad(from + 180);
      const len = 5 + speed * 2.6;
      const tx = ox + Math.cos(to) * len, ty = oy + Math.sin(to) * len;
      ctx.strokeStyle = COL.blue;
      ctx.fillStyle = COL.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox - Math.cos(to) * len, oy - Math.sin(to) * len);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx + Math.cos(to) * 4, ty + Math.sin(to) * 4);
      ctx.lineTo(tx + Math.cos(to + 2.4) * 6, ty + Math.sin(to + 2.4) * 6);
      ctx.lineTo(tx + Math.cos(to - 2.4) * 6, ty + Math.sin(to - 2.4) * 6);
      ctx.closePath();
      ctx.fill();

      // Readout
      text(ctx, String(D.firstYear + Math.round(yf)), 262, 60, { size: 26, color: COL.paper, weight: 600 });
      text(ctx, "days by direction", 263, 82, { size: 9, color: COL.dim });
      text(ctx, `week ${wk + 1}`, 263, 128, { size: 9, color: COL.dim, font: MONO });
      text(ctx, `from ${NAMES[Math.round(from / 22.5) % 16]}`, 263, 146, { size: 12, color: COL.blue, weight: 600 });
      text(ctx, `${speed.toFixed(1)} m/s avg`, 263, 162, { size: 9, color: COL.dim, font: MONO });
      text(ctx, "North is up", 263, 220, { size: 8.5, color: COL.dim });
      text(ctx, "NE ↔ W monsoons", 263, 234, { size: 8.5, color: COL.dim });
    },
  };
}
