/**
 * Renders the one-sheet design guides in docs/ to PNG: design-guide.html (the
 * map of DESIGN.md) and design-guide-personal.html (of docs/design-personal.md).
 * The sheets read their colours and sizes from public/assets/css/main.css, so run
 * this after changing a token.
 *
 * Run: npm run guide
 */
import { openBrowser } from "./browser.ts";
import { fileURLToPath } from "node:url";

const SHEETS = ["design-guide", "design-guide-personal"];

const { browser, close } = await openBrowser(8132);
try {
  for (const name of SHEETS) {
    const out = fileURLToPath(new URL(`../docs/${name}.png`, import.meta.url));
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(new URL(`../docs/${name}.html`, import.meta.url).href, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: out, fullPage: true });
    await page.close();
    console.log(`Wrote ${out}`);
  }
} finally {
  await close();
}
