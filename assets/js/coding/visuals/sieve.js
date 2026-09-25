import { COL, ease, MONO, surface, text } from "../core.js";

// --- Oct 2021: sieve of Eratosthenes -------------------------------------------
export default function sieve(canvas) {
  const N = 120, COLS = 15;
  const PRIMES = [2, 3, 5, 7];
  const PHASE = 2;
  const PERIOD = PRIMES.length * PHASE + 4.5;
  // When each composite gets crossed out, by its smallest prime factor
  const crossAt = new Array(N + 1).fill(Infinity);
  PRIMES.forEach((p, k) => {
    const multiples = [];
    for (let m = p * p; m <= N; m += p) if (crossAt[m] === Infinity) multiples.push(m);
    multiples.forEach((m, j) => (crossAt[m] = k * PHASE + 0.5 + (j / multiples.length) * 1.3));
  });
  const cell = (n) => [18 + ((n - 1) % COLS) * 21.6, 38 + Math.floor((n - 1) / COLS) * 25];

  return {
    still: PERIOD - 1,
    draw(time) {
      const t = time % PERIOD;
      const ctx = surface(canvas);
      const phase = Math.min(PRIMES.length - 1, Math.floor(t / PHASE));
      const done = t > PRIMES.length * PHASE;
      text(ctx, done ? "What's left is prime" : `Crossing out multiples of ${PRIMES[phase]}`, 16, 18, {
        size: 10,
        color: COL.paper,
        weight: 600,
      });
      for (let n = 1; n <= N; n++) {
        const [x, y] = cell(n);
        const crossed = n === 1 || t >= crossAt[n];
        const active = !done && n === PRIMES[phase];
        const prime = !crossed && (done || PRIMES.slice(0, phase + 1).includes(n) || n <= PRIMES[phase]);
        if (active || (done && !crossed)) {
          ctx.fillStyle = active ? COL.accent : COL.accentSoft;
          ctx.beginPath();
          ctx.arc(x + 9, y + 8, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        text(ctx, String(n), x + 9, y + 8.5, {
          size: 9,
          align: "center",
          font: MONO,
          color: active ? "#161514" : crossed ? "rgba(246, 244, 239, 0.18)" : prime ? COL.paper : COL.dim,
          weight: active || (done && !crossed) ? 700 : 400,
        });
      }
      if (done) {
        const k = ease((t - PRIMES.length * PHASE - 0.6) / 0.8);
        ctx.globalAlpha = k;
        text(ctx, "…and 455,052,511 primes below ten billion", 16, 252, { size: 10, color: COL.accent, weight: 600 });
        ctx.globalAlpha = 1;
      }
    },
  };
}
