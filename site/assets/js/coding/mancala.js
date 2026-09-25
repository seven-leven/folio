// --- Mancala (ohvalhugondi) engine, ported from the webui version -------------
// 14 pits (0-6 bottom player, 7-13 top player), 7 seeds each, relay sowing.
export function newGame() {
  return { pits: Array(14).fill(7), stores: [0, 0], player: 0 };
}
export const cloneGame = (g) => ({ pits: g.pits.slice(), stores: g.stores.slice(), player: g.player });
export const validMoves = (g, p = g.player) => [0, 1, 2, 3, 4, 5, 6].map((i) => i + p * 7).filter((i) => g.pits[i] > 0);
export const isOver = (g) => g.pits.slice(0, 7).every((n) => !n) || g.pits.slice(7).every((n) => !n);

/** Plays a move in place; returns true if the player moves again. */
export function sow(g, start, trace) {
  let hand = g.pits[start];
  g.pits[start] = 0;
  let pit = start;
  let again = false;
  trace?.push({ at: start, hand, g: cloneGame(g) });
  for (let guard = 0; hand > 0 && guard < 2000; guard++) {
    pit = (pit + 1) % 14;
    if (pit === (7 + g.player * 7) % 14) {
      g.stores[g.player]++;
      hand--;
      trace?.push({ at: "store", hand, g: cloneGame(g) });
      if (hand === 0) {
        again = true;
        break;
      }
    }
    if (hand === 1 && g.pits[pit] > 0) {
      hand += g.pits[pit];
      g.pits[pit] = 0;
    } else {
      g.pits[pit]++;
      hand--;
    }
    trace?.push({ at: pit, hand, g: cloneGame(g) });
  }
  if (!again) {
    const opp = 13 - pit;
    if (g.pits[opp]) {
      g.stores[g.player] += g.pits[opp];
      g.pits[opp] = 0;
      trace?.push({ at: opp, hand: 0, capture: true, g: cloneGame(g) });
    }
  }
  return again;
}

export function play(g, move, trace) {
  const again = sow(g, move, trace);
  if (!again) g.player = 1 - g.player;
  return again;
}

/** The depth-limited DFS bot: best store difference `depth` moves ahead. */
export function dfsMove(game, depth) {
  const score = (g, me) => g.stores[me] - g.stores[1 - me];
  const search = (g, d, me) => {
    if (d === 0 || isOver(g)) return score(g, me);
    const mine = g.player === me;
    let best = mine ? -Infinity : Infinity;
    for (const m of validMoves(g)) {
      const c = cloneGame(g);
      play(c, m);
      const s = search(c, d - 1, me);
      best = mine ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  };
  let bestMove = null;
  let best = -Infinity;
  for (const m of validMoves(game)) {
    const c = cloneGame(game);
    play(c, m);
    const s = search(c, depth - 1, game.player);
    if (s > best) {
      best = s;
      bestMove = m;
    }
  }
  return bestMove;
}
