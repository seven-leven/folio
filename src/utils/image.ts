const FALLBACK = "./assets/placeholder.png";

/** Swap in the placeholder when a portfolio image is missing. */
export function onImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (img.src.endsWith(FALLBACK.replace("./", "/"))) return; // avoid loop
  img.src = FALLBACK;
}
