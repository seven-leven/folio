/**
 * Records every page at phone, tablet and desktop widths: each element's box
 * and computed styles (JSON), plus a full-page screenshot. Take one before a
 * change and one after, then diff them with `deno task compare`.
 *
 * Run: deno task snapshot <name>          writes .snapshots/<name>/
 *      deno task snapshot <name> --no-shots   skip the screenshots
 *
 * Animations are switched off (reduced motion), external requests are blocked
 * and everything waiting to fade in is shown, so runs are repeatable.
 */
import { distPages, openBrowser } from "./browser.ts";

const name = Deno.args.find((a) => !a.startsWith("--"));
if (!name) {
  console.error("Usage: deno task snapshot <name> [--no-shots]");
  Deno.exit(1);
}
const shots = !Deno.args.includes("--no-shots");
const OUT = new URL(`../.snapshots/${name}/`, import.meta.url);
const WIDTHS = [375, 820, 1280];
const PROPS = [
  "display",
  "position",
  "color",
  "background-color",
  "background-image",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-transform",
  "text-align",
  "text-decoration-line",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-top-color",
  "border-bottom-width",
  "border-bottom-color",
  "border-left-width",
  "border-left-color",
  "border-right-width",
  "border-right-color",
  "border-top-left-radius",
  "box-shadow",
  "gap",
  "grid-template-columns",
  "order",
  "max-width",
  "visibility",
  "pointer-events",
];

await Deno.mkdir(OUT, { recursive: true });
const { browser, url, close } = await openBrowser(8132);
const port = new URL(url("")).origin;

for (const page of await distPages()) {
  for (const width of WIDTHS) {
    const tab = await browser.newPage();
    await tab.setViewport({ width, height: 900 });
    await tab.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await tab.setRequestInterception(true);
    tab.on("request", (r) => (r.url().startsWith(port) || r.url().startsWith("data:") ? r.continue() : r.abort()));
    await tab.goto(url(page), { waitUntil: "networkidle0" });
    await tab.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    await tab.evaluate(async () => {
      document.querySelectorAll(".reveal,.animate-on-scroll-target,#project-showcase-hero")
        .forEach((e) => e.classList.add("is-visible"));
      await document.fonts.ready;
    });
    const data = await tab.evaluate((props: string[]) => {
      const out: Record<string, Record<string, string>> = {};
      const path = (el: Element) => {
        const parts: string[] = [];
        for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
          const idx = e.parentElement ? [...e.parentElement.children].indexOf(e) : 0;
          const cls = e.getAttribute("class")?.split(/\s+/).filter((c) => c && !c.startsWith("is-"))[0];
          parts.unshift(`${e.tagName.toLowerCase()}${e.id ? "#" + e.id : cls ? "." + cls : ""}:${idx}`);
        }
        return parts.join(">");
      };
      for (const el of [document.body, ...document.body.querySelectorAll("*")]) {
        if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
        const r = el.getBoundingClientRect();
        const rec: Record<string, string> = {
          box: [r.x, r.y + scrollY, r.width, r.height].map((v) => Math.round(v)).join(","),
        };
        const cs = getComputedStyle(el);
        for (const p of props) rec[p] = cs.getPropertyValue(p);
        for (const pseudo of ["::before", "::after"]) {
          const ps = getComputedStyle(el, pseudo);
          if (ps.content && ps.content !== "none" && ps.content !== "normal") {
            for (
              const p of ["content", "width", "height", "background-color", "background-image", "color", "top", "left"]
            ) {
              rec[pseudo + p] = ps.getPropertyValue(p);
            }
          }
        }
        out[el === document.body ? "body" : path(el)] = rec;
      }
      return out;
    }, PROPS);
    const file = `${page.replace(".html", "")}-${width}`;
    await Deno.writeTextFile(new URL(`${file}.json`, OUT), JSON.stringify(data));
    if (shots) {
      await tab.screenshot({
        path: new URL(`${file}.jpg`, OUT).pathname.replace(/^\/(\w:)/, "$1"),
        fullPage: true,
        type: "jpeg",
        quality: 60,
      });
    }
    await tab.close();
    console.log(`${file}: ${Object.keys(data).length} elements`);
  }
}
await close();
console.log(`Saved to .snapshots/${name}/`);
