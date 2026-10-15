import { COL, MONO, rng, roundRect, surface, text } from "../core.js";
import { cloneGame, isOver, newGame, play, validMoves } from "../mancala.js";

// --- Dec 2022: the command-line game loop ------------------------------------
export default function mancalaCli(canvas) {
  const rand = rng(12);
  const states = [];
  const g = newGame();
  for (let i = 0; i < 14 && !isOver(g); i++) {
    const moves = validMoves(g);
    const move = moves[Math.floor(rand() * moves.length)];
    states.push({ g: cloneGame(g), move });
    play(g, move);
  }
  states.push({ g: cloneGame(g), move: null });
  const STEP = 2.4;
  const PERIOD = states.length * STEP;
  const pad = (n) => String(n).padStart(2, " ");

  return {
    still: STEP * 3 + 2,
    draw(time) {
      const t = time % PERIOD;
      const i = Math.floor(t / STEP);
      const local = t - i * STEP;
      const { g: s, move } = states[i];
      const ctx = surface(canvas);
      ctx.fillStyle = COL.panel;
      roundRect(ctx, 10, 10, 340, 250, 8);
      ctx.fill();
      const line = (str, row, color = COL.paper) => text(ctx, str, 24, 34 + row * 17, { size: 11, font: MONO, color });
      line("$ python mancala.py", 0, COL.dim);
      const top = [13, 12, 11, 10, 9, 8, 7].map((p) => `[${pad(s.pits[p])}]`).join("");
      const bottom = [0, 1, 2, 3, 4, 5, 6].map((p) => `[${pad(s.pits[p])}]`).join("");
      line("       7   6   5   4   3   2   1", 2, COL.dim);
      line(`     ${top}`, 3);
      line(`(${pad(s.stores[1])})                            (${pad(s.stores[0])})`, 4, COL.accent);
      line(`     ${bottom}`, 5);
      line("       1   2   3   4   5   6   7", 6, COL.dim);
      if (move === null) {
        line(`Game over: ${s.stores[0]} - ${s.stores[1]}`, 8, COL.accent);
        return;
      }
      const who = s.player === 0 ? "Player 1" : "Player 2";
      const choice = String(s.player === 0 ? move + 1 : move - 6);
      const prompt = `${who}, pick a pit (1-7): `;
      line(prompt + (local > 0.8 ? choice : ""), 8);
      if (local <= 0.8 && Math.floor(local * 3) % 2 === 0) {
        ctx.font = `400 11px ${MONO}`;
        ctx.fillStyle = COL.paper;
        ctx.fillRect(24 + ctx.measureText(prompt).width, 34 + 8 * 17 - 6, 7, 12);
      }
      if (local > 1.2) line(`sowing ${s.pits[move]} seeds from pit ${choice}...`, 9, COL.dim);
    },
  };
}
