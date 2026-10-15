// --- Sep 2021: the spinning ASCII donut --------------------------------------
// A torus sampled in (theta, phi), rotated about two axes, projected with a
// z-buffer and shaded by the surface normal, like the original Python version.
export default function donut(pre) {
  const COLS = 56;
  const ROWS = 28;
  const R1 = 1;
  const R2 = 2;
  const K2 = 5;
  const K1 = (COLS * K2 * 3) / (8 * (R1 + R2));
  const CHARS = ".,-~:;=!*#$@";
  const out = new Array(COLS * ROWS);
  const z = new Float32Array(COLS * ROWS);

  function frame(A, B) {
    out.fill(" ");
    z.fill(0);
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let th = 0; th < 6.283; th += 0.07) {
      const ct = Math.cos(th), st = Math.sin(th);
      for (let ph = 0; ph < 6.283; ph += 0.02) {
        const cp = Math.cos(ph), sp = Math.sin(ph);
        const cx = R2 + R1 * ct, cy = R1 * st;
        const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
        const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
        const ooz = 1 / (K2 + cA * cx * sp + cy * sA);
        const xp = Math.floor(COLS / 2 + K1 * ooz * x);
        const yp = Math.floor(ROWS / 2 - K1 * 0.5 * ooz * y);
        if (xp < 0 || xp >= COLS || yp < 0 || yp >= ROWS) continue;
        const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
        const i = xp + COLS * yp;
        if (L > 0 && ooz > z[i]) {
          z[i] = ooz;
          out[i] = CHARS[Math.min(CHARS.length - 1, Math.floor(L * 8))];
        }
      }
    }
    let s = "";
    for (let r = 0; r < ROWS; r++) s += out.slice(r * COLS, r * COLS + COLS).join("") + "\n";
    pre.textContent = s;
  }

  return { still: 0, draw: (t) => frame(1 + t * 1.2, 0.6 + t * 0.6) };
}
