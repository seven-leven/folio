import { COL, ease, lerp, MONO, rng, roundRect, surface, text } from "../core.js";

// --- Dec 2022 - Jan 2023: the archiving bot ----------------------------------
export default function discord(canvas) {
  const threads = [
    { name: "series-a", base: 214, color: COL.accent },
    { name: "series-b", base: 87, color: COL.blue },
    { name: "fan-art-c", base: 152, color: COL.sand },
  ];
  const rand = rng(3);
  const items = Array.from(
    { length: 64 },
    (_, i) => ({ thread: Math.floor(rand() * 3), id: 100 + i * 3 + Math.floor(rand() * 3) }),
  );
  const STEP = 0.9;
  const FLY = 0.7;
  const PERIOD = items.length * STEP;
  const rowY = (i) => 86 + i * 58;
  const QY = 34; // top of the queue column

  return {
    still: STEP * 6 + 0.02,
    draw(time) {
      const t = time % PERIOD;
      const n = Math.floor(t / STEP); // items already delivered
      const k = ease((t - n * STEP) / FLY);
      const ctx = surface(canvas);

      text(ctx, "queue/", 22, 22, { size: 10, font: MONO, color: COL.dim });
      text(ctx, "# archive · threads", 148, 22, { size: 10, font: MONO, color: COL.dim });

      // Queue of files waiting to be archived; it shuffles up as one leaves.
      for (let q = 0; q < 5; q++) {
        const item = items[(n + q + 1) % items.length];
        const y = QY + (q + 1 - k) * 42;
        ctx.globalAlpha = q === 4 ? k : 1;
        ctx.fillStyle = COL.ghost;
        roundRect(ctx, 16, y, 108, 34, 5);
        ctx.fill();
        ctx.fillStyle = threads[item.thread].color;
        roundRect(ctx, 22, y + 5, 24, 24, 3);
        ctx.fill();
        text(ctx, `#${item.id}.jpg`, 54, y + 17, { size: 9, font: MONO, color: COL.dim });
        ctx.globalAlpha = 1;
      }

      // Threads, with a running post count
      threads.forEach((th, i) => {
        const delivered = items.slice(0, n + (k >= 1 ? 1 : 0)).filter((it) => it.thread === i).length;
        const y = rowY(i);
        const current = items[n % items.length];
        const flash = current.thread === i && k > 0.85 ? 1 - (k - 0.85) / 0.15 : 0;
        ctx.fillStyle = flash > 0 ? `rgba(227, 154, 134, ${0.12 + flash * 0.2})` : COL.ghost;
        roundRect(ctx, 144, y - 20, 200, 42, 6);
        ctx.fill();
        text(ctx, `# ${th.name}`, 156, y - 4, { size: 11, color: COL.paper, weight: 600 });
        text(ctx, `${th.base + delivered} posts`, 156, y + 11, { size: 9, color: COL.dim });
        ctx.fillStyle = th.color;
        ctx.beginPath();
        ctx.arc(330, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // The file being posted flies from the queue into its thread
      const cur = items[n % items.length];
      const x = lerp(22, 300, k);
      const y = lerp(QY + 5, rowY(cur.thread) - 12, k);
      ctx.fillStyle = threads[cur.thread].color;
      ctx.globalAlpha = 1 - Math.max(0, k - 0.8) * 5;
      roundRect(ctx, x, y, 24, 24, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
      text(ctx, "sorted by title · logged to posts.csv", 16, 258, { size: 9, color: COL.dim });
    },
  };
}
