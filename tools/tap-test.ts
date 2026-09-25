/**
 * Phone tap test: fails if anything invisible can be tapped.
 *
 * 1. With the mobile menu closed, no nav link may be tappable (it once was:
 *    the hidden dropdown links sat invisibly over the top of every page).
 * 2. With it open, every nav link must be tappable.
 * 3. Scrolling through each page, no link or button may be tappable while it
 *    is (nearly) invisible, e.g. content still waiting to fade in.
 *
 * Run: deno task tap-test   (builds first; needs Chrome)
 */
import { distPages, openBrowser } from "./browser.ts";

const { browser, url, close } = await openBrowser(8131);
const failures: string[] = [];

for (const page of await distPages()) {
  if (page === "404.html") continue;
  const tab = await browser.newPage();
  await tab.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await tab.goto(url(page), { waitUntil: "networkidle0" });

  const tappableNav = () =>
    tab.evaluate(() =>
      [...document.querySelectorAll("#navbar .nav-links a")]
        .filter((a) => {
          const r = a.getBoundingClientRect();
          if (!r.width) return false;
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return !!hit && a.contains(hit);
        })
        .map((a) => a.textContent!.trim())
    );
  const allNav = await tab.evaluate(() => document.querySelectorAll("#navbar .nav-links a").length);
  const closed = await tappableNav();
  if (closed.length) failures.push(`${page}: menu closed but tappable: ${closed.join(", ")}`);
  if (await tab.$("#navbar .nav-toggle")) {
    await tab.tap("#navbar .nav-toggle");
    await new Promise((r) => setTimeout(r, 400));
    const open = await tappableNav();
    if (open.length !== allNav) failures.push(`${page}: menu open but only ${open.length}/${allNav} links tappable`);
    await tab.tap("#navbar .nav-toggle");
    await new Promise((r) => setTimeout(r, 400));
  }

  const ghosts = new Set<string>();
  const height = await tab.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 300) {
    await tab.evaluate((yy) => scrollTo(0, yy), y);
    await new Promise((r) => setTimeout(r, 120)); // mid-fade, like a real scroll
    const found = await tab.evaluate(() => {
      const out: string[] = [];
      for (let x = 20; x < innerWidth; x += 40) {
        for (let yy = 80; yy < innerHeight; yy += 40) {
          const el = document.elementFromPoint(x, yy);
          const link = el?.closest("a, button");
          if (!el || !link) continue;
          let opacity = 1;
          for (let e: Element | null = el; e; e = e.parentElement) opacity *= Number(getComputedStyle(e).opacity);
          if (opacity < 0.15) {
            out.push((link.textContent || link.getAttribute("aria-label") || link.tagName).trim().slice(0, 40));
          }
        }
      }
      return out;
    });
    found.forEach((g) => ghosts.add(g));
  }
  if (ghosts.size) failures.push(`${page}: invisible but tappable: ${[...ghosts].join(" | ")}`);
  console.log(`${page}: ${closed.length || ghosts.size ? "FAIL" : "ok"}`);
  await tab.close();
}
await close();

if (failures.length) {
  console.log(`\n${failures.join("\n")}`);
  Deno.exit(1);
}
console.log("No invisible tappable links.");
