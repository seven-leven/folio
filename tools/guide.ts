/**
 * Renders docs/design-guide.html, the one-sheet version of DESIGN.md, to
 * docs/design-guide.png. The sheet reads its colours and sizes from
 * site/assets/css/main.css, so run this after changing a token.
 *
 * Run: deno task guide
 */
import { openBrowser } from "./browser.ts";
import { fromFileUrl } from "@std/path";

const SRC = new URL("../docs/design-guide.html", import.meta.url);
const OUT = fromFileUrl(new URL("../docs/design-guide.png", import.meta.url));

const { browser, close } = await openBrowser(8132);
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(SRC.href, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: OUT, fullPage: true });
  console.log(`Wrote ${OUT}`);
} finally {
  await close();
}
