import { COL, ease, MONO, roundRect, SANS, surface, text } from "../core.js";

// --- Oct 2024: Wildlife Illustrated, version by version ---------------------------
// The app's own changelog: each version appears in turn with what it changed.
// The version string is derived like the real one: patch = commits, +n = drawings.
export default function wildlife(canvas) {
  const VERSIONS = [
    ["v0.1", "Oct 2024", "First page", "HTML · CSS · JS", ""],
    ["v0.2", "Jan 2025", "Deployment", "GitHub Actions", ""],
    ["v0.3", "Feb 2025", "Deno & build tools", "Deno · esbuild · tests", "migration"],
    ["v0.4", "May 2025", "Vue rewrite", "Vue · WebP", "rewrite"],
    ["v0.5", "Jan 2026", "Tailwind & dark mode", "Tailwind · git hooks", "migration"],
    ["v0.6", "Feb 2026", "Search & data", "Dhivehi names · search", ""],
    ["v0.7", "Mar 2026", "Multi-collection", "birds · sharks · shells", "rewrite"],
    ["v0.8", "Jul 2026", "Redesign & performance", "Lighthouse 100 · CI", ""],
  ];
  const STEP = 0.9;
  const PERIOD = VERSIONS.length * STEP + 4;
  const drawings = () => {
    const n = parseInt(document.querySelector('[data-count="all"]')?.textContent || "", 10);
    return Number.isFinite(n) ? n : 18;
  };

  return {
    still: PERIOD - 1,
    draw(time) {
      const t = time % PERIOD;
      const shown = Math.min(VERSIONS.length, Math.floor(t / STEP) + 1);
      const ctx = surface(canvas);
      text(ctx, "CHANGELOG.md", 16, 18, { size: 10, font: MONO, color: COL.paper, weight: 700 });

      VERSIONS.slice(0, shown).forEach(([v, date, title, , tag], i) => {
        const y = 42 + i * 22;
        const latest = i === shown - 1;
        const k = latest ? ease((t - i * STEP) / 0.35) : 1;
        ctx.globalAlpha = k;
        if (latest) {
          ctx.fillStyle = COL.ghost;
          roundRect(ctx, 10, y - 10, 340, 20, 4);
          ctx.fill();
        }
        text(ctx, v, 16, y, { size: 9.5, font: MONO, color: latest ? COL.accent : COL.dim, weight: 700 });
        text(ctx, date, 52, y, { size: 8.5, color: COL.dim });
        text(ctx, title, 110, y, { size: 9.5, color: latest ? COL.paper : COL.dim, weight: latest ? 600 : 400 });
        if (tag) {
          ctx.font = `600 7.5px ${SANS}`;
          const w = ctx.measureText(tag).width + 10;
          ctx.strokeStyle = tag === "rewrite" ? COL.accent : COL.blueSoft;
          ctx.lineWidth = 1;
          roundRect(ctx, 344 - w, y - 6, w, 12, 6);
          ctx.stroke();
          text(ctx, tag, 344 - w / 2, y, {
            size: 7.5,
            align: "center",
            color: tag === "rewrite" ? COL.accent : COL.blue,
            weight: 600,
          });
        }
        ctx.globalAlpha = 1;
      });

      // The stack of the newest version, and the derived version string
      const [, , , stack] = VERSIONS[shown - 1];
      ctx.fillStyle = COL.faint;
      ctx.fillRect(16, 222, 328, 1);
      text(ctx, stack, 16, 238, { size: 9.5, color: COL.blue, weight: 600 });
      const commits = [2, 11, 18, 35, 46, 60, 72, 149][shown - 1];
      const n = shown === VERSIONS.length ? drawings() : [2, 3, 3, 14, 15, 17, 18, 18][shown - 1];
      text(
        ctx,
        `${VERSIONS[shown - 1][0]}.${String(commits).padStart(3, "0")}+${String(n).padStart(3, "0")}`,
        344,
        238,
        {
          size: 9.5,
          align: "right",
          font: MONO,
          color: COL.paper,
        },
      );
      text(ctx, "patch = commits · +n = drawings", 344, 254, { size: 7.5, align: "right", color: COL.dim });
    },
  };
}
