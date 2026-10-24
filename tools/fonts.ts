/**
 * Self-hosts the site's fonts: downloads the files Google Fonts serves for the families below
 * into public/assets/fonts/, and writes public/assets/css/fonts.css with the same @font-face
 * rules pointing at them. The text renders exactly as it did from Google, without a request
 * to Google on every page. Only the Latin, Latin Extended and Thaana parts are kept.
 *
 * Run: npm run fonts      (again when a family or weight is added; commit what it writes)
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

const FAMILIES = [
  "Inter:wght@400;500;600;700", // body text
  "Instrument+Serif:ital@0;1", // headings
  "IBM+Plex+Mono:wght@400;500;600", // labels and data: Coding pages, engineering, Semester 4
  "Noto+Sans+Thaana:wght@400;500", // Dhivehi bird names on the homepage
  "Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400;1,600", // the Semester 4 and 5 boards
  "EB+Garamond:ital@1", // Semester 4 taglines
];
const SUBSETS = new Set(["latin", "latin-ext", "thaana"]);
// Google picks the font format by browser; this asks as a current Chrome, which gets WOFF2
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const FONTS = new URL("../public/assets/fonts/", import.meta.url);
const CSS = new URL("../public/assets/css/fonts.css", import.meta.url);

const api = `https://fonts.googleapis.com/css2?${FAMILIES.map((f) => `family=${f}`).join("&")}&display=swap`;
const res = await fetch(api, { headers: { "user-agent": UA } });
if (!res.ok) throw new Error(`Google Fonts answered ${res.status}`);
const css = await res.text();

// Google's CSS is a run of blocks, each "/* subset */ @font-face { … }"
const blocks = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face \{[\s\S]*?\})/g)];
await rm(FONTS, { recursive: true, force: true });
await mkdir(FONTS, { recursive: true });
const kept: string[] = [];
const files = new Map<string, string>(); // Google URL -> our file name
for (const [, subset, rule] of blocks) {
  if (!SUBSETS.has(subset)) continue;
  const family = rule.match(/font-family: '([^']+)'/)?.[1] ?? "";
  const src = rule.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!src) throw new Error(`No WOFF2 for ${family} (${subset})`);
  if (!files.has(src)) {
    // The file name keeps Google's own id, which changes when the font does
    const name = `${family.toLowerCase().replace(/ /g, "-")}-${subset}-${src.split("/").pop()}`;
    const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
    await writeFile(new URL(name, FONTS), bytes);
    files.set(src, name);
  }
  kept.push(`/* ${family}, ${subset} */\n${rule.replace(src, `../fonts/${files.get(src)}`)}`);
}

const header = `/* The site's fonts, served from the site. Written by tools/fonts.ts (npm run fonts) from\n   Google Fonts' own files and rules; edit that script, not this file. */\n\n`;
await writeFile(CSS, header + kept.join("\n\n") + "\n");
const total = (await readdir(FONTS)).length;
console.log(`Wrote ${kept.length} @font-face rules and ${total} font files.`);
