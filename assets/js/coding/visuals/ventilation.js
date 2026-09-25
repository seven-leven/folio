import { COL, ease, MONO, roundRect, SANS, surface, text } from "../core.js";

// --- Dec 2024: natural ventilation check (illustration) --------------------------
// Opening types are set up once; each room is a name, a floor area and its
// openings as one line of text. The line is parsed, the open area summed, and
// the room passes if openings are at least 10% of the floor area.
export default function ventilation(canvas) {
  const OPENINGS = { W1: 1.2, W2: 0.8, V1: 0.3 }; // opening area, m²
  const rooms = [
    ["Bedroom 1", 14.0, "W1 x2"],
    ["Kitchen", 9.5, "W2, V1"],
    ["Store", 6.0, "V1"],
  ];
  const parse = (str) =>
    str.split(",").map((part) => {
      const [code, times] = part.trim().split(/\s*x\s*/i);
      return [code, Number(times || 1)];
    });
  const openArea = (str) => parse(str).reduce((sum, [code, n]) => sum + OPENINGS[code] * n, 0);
  const STEP = 3.6;
  const DONE = STEP * rooms.length;
  const PERIOD = DONE + 3;
  const colX = [16, 118, 176, 236, 300];

  return {
    still: PERIOD - 0.5,
    draw(time) {
      const t = time % PERIOD;
      const idx = Math.min(rooms.length - 1, Math.floor(t / STEP));
      const local = t - idx * STEP;
      const finished = t >= DONE;
      const [name, area, str] = rooms[idx];
      const ctx = surface(canvas);

      // Opening types, entered once
      text(ctx, "Opening types", 16, 16, { size: 9, color: COL.dim, weight: 600 });
      Object.entries(OPENINGS).forEach(([code, a], i) => {
        const x = 16 + i * 78;
        ctx.fillStyle = COL.ghost;
        roundRect(ctx, x, 26, 70, 22, 4);
        ctx.fill();
        const used = !finished && parse(str).some(([c]) => c === code) && local > 1.9;
        text(ctx, code, x + 8, 37, { size: 9, font: MONO, color: used ? COL.accent : COL.paper, weight: 700 });
        text(ctx, `${a.toFixed(1)} m²`, x + 30, 37, { size: 8.5, font: MONO, color: COL.dim });
      });

      // The room being entered: name, area, openings as text
      const typed = (s, from) => s.slice(0, Math.max(0, Math.floor((local - from) * 18)));
      const fields = finished
        ? ["", "", ""]
        : [typed(name, 0.1), local > 0.7 ? `${area.toFixed(1)}` : "", typed(str, 1.0)];
      [["Room", 16, 96], ["Area m²", 116, 56], ["Openings", 176, 168]].forEach(([label, x, w], i) => {
        text(ctx, label, x, 62, { size: 8, color: COL.dim });
        ctx.fillStyle = COL.ghost;
        roundRect(ctx, x, 70, w, 22, 4);
        ctx.fill();
        text(ctx, fields[i], x + 7, 81, { size: 9, font: i === 1 || i === 2 ? MONO : SANS, color: COL.paper });
      });
      if (!finished && local > 1.9 && local < 2.7) {
        const sum = parse(str).map(([c, n]) => (n > 1 ? `${c}×${n}` : c)).join(" + ");
        text(ctx, `${sum} = ${openArea(str).toFixed(1)} m²`, 344, 104, {
          size: 8.5,
          align: "right",
          color: COL.accent,
          font: MONO,
        });
      }

      // Results
      const head = ["Room", "Area", "Open", "%", ""];
      head.forEach((h, i) => text(ctx, h, colX[i], 124, { size: 8, color: COL.dim }));
      ctx.fillStyle = COL.faint;
      ctx.fillRect(16, 132, 328, 1);
      const shown = finished ? rooms.length : idx + (local > 2.7 ? 1 : 0);
      rooms.slice(0, shown).forEach(([n, a, s], r) => {
        const y = 146 + r * 20;
        const open = openArea(s);
        const pct = (open / a) * 100;
        const ok = pct >= 10;
        text(ctx, n, colX[0], y, { size: 9, color: COL.paper });
        text(ctx, a.toFixed(1), colX[1], y, { size: 9, font: MONO, color: COL.paper });
        text(ctx, open.toFixed(1), colX[2], y, { size: 9, font: MONO, color: COL.paper });
        text(ctx, `${pct.toFixed(1)}%`, colX[3], y, { size: 9, font: MONO, color: ok ? COL.paper : COL.red });
        text(ctx, ok ? "OK" : "below 10%", colX[4], y, { size: 8.5, color: ok ? "#9fd4a8" : COL.red, weight: 600 });
      });

      // Export
      const k = ease((t - DONE - 0.4) / 0.5);
      ctx.globalAlpha = 0.35 + 0.65 * k;
      ctx.strokeStyle = COL.accent;
      ctx.lineWidth = 1;
      roundRect(ctx, 236, 222, 108, 24, 5);
      ctx.stroke();
      text(ctx, "Export to Excel ↓", 290, 234, { size: 9, align: "center", color: COL.accent, weight: 600 });
      ctx.globalAlpha = 1;
      text(ctx, "illustration · openings ≥ 10% of floor area", 16, 234, { size: 8, color: COL.dim });
    },
  };
}
