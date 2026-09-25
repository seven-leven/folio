// Shared helpers for the Coding timeline animations: palette, fonts, the
// 360 x 270 design space every canvas is drawn in, and small drawing utilities.

export const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const COL = {
  paper: "#f6f4ef",
  dim: "rgba(246, 244, 239, 0.55)",
  faint: "rgba(246, 244, 239, 0.16)",
  ghost: "rgba(246, 244, 239, 0.07)",
  accent: "#e39a86",
  accentSoft: "rgba(227, 154, 134, 0.35)",
  blue: "#8fbde6",
  blueSoft: "rgba(143, 189, 230, 0.35)",
  red: "#d9695f",
  sand: "#d8bd8c",
  panel: "rgba(0, 0, 0, 0.32)",
};
export const SANS = '"Inter", system-ui, sans-serif';
export const MONO = 'ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace';

// Every canvas scene is drawn in a 360 x 270 design space, scaled to fit.
export const W = 360;
export const H = 270;

export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
export const lerp = (a, b, k) => a + (b - a) * k;

export function surface(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  let s = canvas._surface;
  if (!s || s.w !== w || s.h !== h || s.dpr !== dpr) {
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    s = canvas._surface = { ctx: canvas.getContext("2d"), w, h, dpr };
  }
  const { ctx } = s;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform((dpr * w) / W, 0, 0, (dpr * h) / H, 0, 0);
  ctx.textBaseline = "middle";
  return ctx;
}

export function text(ctx, str, x, y, { size = 11, color = COL.dim, font = SANS, align = "left", weight = 400 } = {}) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Deterministic pseudo-random numbers, so loops replay identically. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
