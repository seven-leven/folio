import { COL, ease, MONO, roundRect, surface, text } from "../core.js";

// --- May 2021: Archiver.bat -------------------------------------------------
// Type the menu choices, make numbered volume folders, then zip them to .cbz.
export default function archiver(canvas) {
  const lines = [
    { at: 0.2, str: "Enter your selection (1-4): 1" },
    { at: 1.4, str: "No.of volumes: 8" },
    { at: 5.0, str: "Enter your selection (1-4): 2" },
  ];
  const PERIOD = 11;
  const typed = (line, t) => {
    const prompt = line.str.lastIndexOf(":") + 2;
    const n = Math.floor((t - line.at) * 22);
    return n <= 0 ? "" : line.str.slice(0, Math.min(line.str.length, prompt + Math.max(0, n - prompt)));
  };

  function folder(ctx, x, y, label, zip, alpha) {
    ctx.globalAlpha = alpha;
    if (!zip) {
      ctx.fillStyle = COL.accent;
      roundRect(ctx, x, y + 4, 30, 22, 3);
      ctx.fill();
      roundRect(ctx, x, y, 13, 8, 2);
      ctx.fill();
    } else {
      ctx.fillStyle = COL.blue;
      roundRect(ctx, x + 4, y, 22, 26, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (let i = 0; i < 5; i++) ctx.fillRect(x + 13, y + 3 + i * 4, 4, 2);
    }
    text(ctx, zip ? label + ".cbz" : label, x + 15, y + 36, { size: 9, color: COL.dim, align: "center", font: MONO });
    ctx.globalAlpha = 1;
  }

  return {
    still: 9,
    draw(time) {
      const t = time % PERIOD;
      const ctx = surface(canvas);
      const fade = t > PERIOD - 0.6 ? (PERIOD - t) / 0.6 : 1;
      ctx.globalAlpha = fade;

      // Terminal
      ctx.fillStyle = COL.panel;
      roundRect(ctx, 10, 10, 340, 104, 8);
      ctx.fill();
      ["1. Create Folders", "2. Folders to cbr", "3. Misc", "4. Exit"].forEach((s, i) =>
        text(ctx, s, 22, 26 + i * 13, { size: 10, font: MONO, color: COL.dim })
      );
      lines.forEach((line, i) => {
        if (t < line.at) return;
        const y = 26 + (4 + i) * 13;
        text(ctx, typed(line, t), 22, y, { size: 10, font: MONO, color: COL.paper });
      });
      // Blinking cursor on the active line
      const active = [...lines].reverse().find((l) => t >= l.at) || lines[0];
      if (Math.floor(t * 2) % 2 === 0 && t < 7) {
        const idx = lines.indexOf(active);
        const y = 26 + (4 + idx) * 13;
        ctx.font = `400 10px ${MONO}`;
        const x = 22 + ctx.measureText(typed(active, t)).width + 2;
        ctx.fillStyle = COL.paper;
        ctx.fillRect(x, y - 5, 6, 10);
      }
      ctx.globalAlpha = fade;

      // Folders appear one by one (MD "Title v1" ...), then turn into archives.
      for (let i = 0; i < 8; i++) {
        const appear = 2.2 + i * 0.3;
        if (t < appear) continue;
        const zipped = t > 5.9 + i * 0.3;
        const x = 26 + (i % 4) * 82;
        const y = 130 + Math.floor(i / 4) * 64;
        const pop = ease((t - appear) / 0.3);
        folder(ctx, x + 14, y + (1 - pop) * 8, `Title v${i + 1}`, zipped, pop * fade);
      }
      ctx.globalAlpha = 1;
    },
  };
}
