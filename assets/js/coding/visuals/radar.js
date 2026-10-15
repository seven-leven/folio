import { COL, MONO, surface, text } from "../core.js";

// --- Aug 2025: radar and Doppler shift ------------------------------------------
export default function radar(canvas) {
  const F0 = 10e9; // 10 GHz, X band
  const C = 3e8;
  // Targets: start position (polar, 0-1 of range), heading, speed in m/s
  const targets = [
    { r: 0.8, a: 0.6, heading: 0.6 + Math.PI, v: 240 }, // inbound aircraft
    { r: 0.45, a: 2.4, heading: 2.4, v: 90 }, // outbound
    { r: 0.65, a: 4.1, heading: 4.1 + Math.PI / 2, v: 60 }, // crossing, little radial speed
    { r: 0.3, a: 5.3, heading: 0, v: 0 }, // stationary
  ];
  const cx = 140, cy = 135, R = 116;
  const SWEEP = 1.3; // radians per second
  const LOOP = 16;

  return {
    still: 3.2,
    draw(time) {
      const t = time % LOOP;
      const ctx = surface(canvas);
      // Scope
      ctx.fillStyle = "rgba(20, 40, 30, 0.55)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(160, 230, 190, 0.18)";
      ctx.lineWidth = 1;
      [0.33, 0.66, 1].forEach((f) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Sweep with a fading trail
      const sweep = (time * SWEEP) % (Math.PI * 2);
      for (let i = 0; i < 24; i++) {
        const a = sweep - i * 0.035;
        ctx.strokeStyle = `rgba(160, 230, 190, ${0.5 * (1 - i / 24)})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }

      // Targets: brightest just after the sweep passes them
      const readouts = [];
      targets.forEach((tg, i) => {
        const x0 = Math.cos(tg.a) * tg.r, y0 = Math.sin(tg.a) * tg.r;
        const move = (tg.v / 240) * 0.05 * t;
        const x = x0 + Math.cos(tg.heading) * move;
        const y = y0 + Math.sin(tg.heading) * move;
        const dist = Math.hypot(x, y);
        if (dist > 0.95) return;
        const ang = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
        const since = (((sweep - ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const glow = Math.exp(-since / 2.2);
        // Radial velocity: positive when approaching the radar
        const radial = -(Math.cos(tg.heading) * x + Math.sin(tg.heading) * y) / (dist || 1) * tg.v;
        const fd = (2 * radial * F0) / C;
        const color = Math.abs(radial) < 5 ? "160, 230, 190" : radial > 0 ? "143, 189, 230" : "227, 154, 134";
        ctx.fillStyle = `rgba(${color}, ${0.2 + glow * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx + x * R, cy + y * R, 3.5, 0, Math.PI * 2);
        ctx.fill();
        readouts.push({ i, dist, fd, color, glow });
      });

      // Readout panel
      text(ctx, "range · Doppler", 266, 36, { size: 9, color: COL.dim });
      readouts.sort((p, q) => p.i - q.i).forEach((ro, row) => {
        const y = 62 + row * 34;
        ctx.fillStyle = `rgb(${ro.color})`;
        ctx.beginPath();
        ctx.arc(268, y, 3, 0, Math.PI * 2);
        ctx.fill();
        const km = (ro.dist * 60).toFixed(0);
        text(ctx, `${km} km`, 277, y - 6, { size: 9, color: COL.paper, font: MONO });
        const khz = ro.fd / 1000;
        const label = Math.abs(khz) < 0.2 ? "no shift" : `${khz > 0 ? "+" : ""}${khz.toFixed(1)} kHz`;
        text(ctx, label, 277, y + 7, { size: 9, color: `rgb(${ro.color})`, font: MONO });
      });
      text(ctx, "f_d = 2·v·f₀/c", 264, 250, { size: 9, color: COL.dim, font: MONO });
    },
  };
}
