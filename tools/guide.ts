/**
 * Renders the one-sheet design guides in docs/ to PNG: design-manifesto.html (the
 * five principles and the system built on them, docs/DESIGN-PLAN.md), design-guide.html
 * (the map of DESIGN.md) and design-guide-personal.html (of docs/design-personal.md).
 * The manifesto is also written as a one-page PDF; tools/guide-svg.py turns that into
 * design-manifesto.svg. The sheets read their colours and sizes from
 * public/assets/css/main.css, so run this after changing a token.
 *
 * Run: npm run guide
 */
import { openBrowser } from "./browser.ts";
import { fileURLToPath } from "node:url";

const SHEETS = ["design-manifesto", "design-guide", "design-guide-personal"];
const PDF = new Set(["design-manifesto"]);

const { browser, close } = await openBrowser(8132);
try {
  for (const name of SHEETS) {
    const out = (ext: string) => fileURLToPath(new URL(`../docs/${name}.${ext}`, import.meta.url));
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(new URL(`../docs/${name}.html`, import.meta.url).href, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    // Chrome repeats the top of a full-page screenshot taller than 16,384 px, so scale long sheets down
    const tall = await page.evaluate(() => document.documentElement.scrollHeight);
    const scale = Math.min(2, Math.floor((16000 / tall) * 100) / 100);
    if (scale < 2) await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: scale });
    await page.screenshot({ path: out("png"), fullPage: true });
    console.log(`Wrote ${out("png")}`);
    if (PDF.has(name)) {
      // One page exactly the sheet's size, so the SVG made from it has no page breaks
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.emulateMediaType("screen");
      await page.pdf({ path: out("pdf"), width: "1440px", height: `${height + 1}px`, printBackground: true, pageRanges: "1" });
      console.log(`Wrote ${out("pdf")}`);
    }
    await page.close();
  }
} finally {
  await close();
}
