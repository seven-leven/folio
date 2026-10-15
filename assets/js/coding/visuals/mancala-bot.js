import { COL, MONO, roundRect, surface, text } from "../core.js";
import { dfsMove, isOver, newGame, play } from "../mancala.js";

// --- Aug 2024: the DFS bot playing the real rules ----------------------------
export default function mancalaBot(canvas) {
  const DEPTHS = [4, 1]; // bottom player looks 4 moves ahead, top player 1
  let game, frames, fi, pause;
  const reset = () => {
    game = newGame();
    frames = [];
    fi = 0;
    pause = 0;
  };
  reset();
  const nextMove = () => {
    if (isOver(game)) return false;
    const trace = [];
    const move = dfsMove(game, DEPTHS[game.player]);
    const mover = game.player;
    play(game, move, trace);
    trace.forEach((f) => (f.mover = mover));
    frames = trace;
    fi = 0;
    return true;
  };

  const pitX = (i) => 70 + i * 36.5;
  const pos = (p) => (p < 7 ? [pitX(p), 176] : [pitX(13 - p), 94]);

  function drawBoard(ctx, g, at, mover, hand, capture) {
    ctx.fillStyle = "rgba(120, 82, 50, 0.35)";
    roundRect(ctx, 12, 56, 336, 158, 40);
    ctx.fill();
    // Stores: bottom player's on the right, top player's on the left
    [[1, 34], [0, 326]].forEach(([p, x]) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      roundRect(ctx, x - 16, 76, 32, 118, 16);
      ctx.fill();
      text(ctx, String(g.stores[p]), x, 135, {
        size: 14,
        align: "center",
        color: p === 0 ? COL.accent : COL.blue,
        weight: 600,
      });
    });
    for (let p = 0; p < 14; p++) {
      const [x, y] = pos(p);
      const active = p === at;
      ctx.fillStyle = active
        ? (capture ? "rgba(217, 105, 95, 0.55)" : "rgba(227, 154, 134, 0.4)")
        : "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, String(g.pits[p]), x, y, { size: 11, align: "center", color: g.pits[p] ? COL.paper : COL.faint });
    }
    if (at === "store") {
      const x = mover === 0 ? 326 : 34;
      ctx.strokeStyle = COL.accent;
      ctx.lineWidth = 1.5;
      roundRect(ctx, x - 16, 76, 32, 118, 16);
      ctx.stroke();
    }
    text(ctx, `Bot · looks ${DEPTHS[0]} moves ahead`, 180, 236, { size: 10, align: "center", color: COL.accent });
    text(ctx, `Bot · looks ${DEPTHS[1]} move ahead`, 180, 34, { size: 10, align: "center", color: COL.blue });
    if (hand > 0) text(ctx, `in hand: ${hand}`, 344, 256, { size: 9, align: "right", color: COL.dim, font: MONO });
  }

  let lastTime = 0;
  let acc = 0;
  return {
    still: null,
    draw(time) {
      const ctx = surface(canvas);
      if (time === null) {
        // Reduced motion: show the position a few moves into a real game.
        reset();
        for (let i = 0; i < 6; i++) nextMove();
        const f = frames[frames.length - 1];
        drawBoard(ctx, f.g, null, f.mover, 0, false);
        return;
      }
      acc += Math.max(0, time - lastTime);
      lastTime = time;
      // Advance the animation: one sowing step per tick, faster for long relays.
      const tick = frames.length > 40 ? 0.05 : 0.11;
      while (acc > tick) {
        acc -= tick;
        if (pause > 0) {
          pause -= tick;
          if (pause <= 0 && isOver(game)) reset();
          continue;
        }
        if (fi < frames.length - 1) fi++;
        else if (!nextMove()) pause = 3;
        else if (frames.length) fi = 0;
        if (fi === frames.length - 1) pause = 0.5;
      }
      const f = frames[fi];
      const g = f ? f.g : game;
      drawBoard(ctx, g, f ? f.at : null, f ? f.mover : 0, f ? f.hand : 0, f?.capture);
      if (isOver(game) && fi === frames.length - 1) {
        const [s0, s1] = game.stores;
        const verdict = s0 === s1
          ? `Draw, ${s0}-${s1}`
          : `${s0 > s1 ? "4-move" : "1-move"} bot wins ${Math.max(s0, s1)}-${Math.min(s0, s1)}`;
        ctx.fillStyle = "rgba(22, 21, 20, 0.75)";
        roundRect(ctx, 90, 118, 180, 34, 8);
        ctx.fill();
        text(ctx, verdict, 180, 135, { size: 12, align: "center", color: COL.paper, weight: 600 });
      }
    },
  };
}
