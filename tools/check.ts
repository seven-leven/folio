/**
 * Static site checker for the built site in dist/ (run `deno task build` first;
 * `deno task check` does that automatically).
 *
 * Errors (fail CI): broken local links/images/scripts/styles, broken JS module
 * imports and data URLs, missing #anchors, <img> without alt, pages missing
 * <title>, meta description, lang or canonical, duplicate ids, raster images
 * that aren't WebP, and projects in site/_data/projects.json without a page or
 * a homepage entry.
 * Warnings: assets over the size budget, images over 2400 px, and assets
 * nothing references.
 * Also lists placeholders still on the site ("xx", "Coming soon", "In progress").
 *
 * Run: deno task check
 */

const SITE = new URL("../dist/", import.meta.url);
const PROJECTS = new URL("../site/_data/projects.json", import.meta.url);
const BASE_PATH = "/folio/"; // GitHub Pages project path, used by 404.html
const SIZE_BUDGET = 1.5 * 1024 * 1024;
const MAX_IMAGE_SIDE = 2400;

const errors: string[] = [];
const warnings: string[] = [];
const referenced = new Set<string>();

async function listFiles(dir: URL, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const rel = prefix + entry.name;
    if (entry.isDirectory) out.push(...await listFiles(new URL(entry.name + "/", dir), rel + "/"));
    else out.push(rel);
  }
  return out;
}

const files = await listFiles(SITE);
const fileSet = new Set(files);
const pages = files.filter((f) => f.endsWith(".html"));
const pageIds = new Map<string, Set<string>>();
const pageText = new Map<string, string>();

for (const page of pages) {
  const html = await Deno.readTextFile(new URL(page, SITE));
  pageText.set(page, html);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`${page}: duplicate id "${id}"`);
    seen.add(id);
  }
  pageIds.set(page, seen);
}

/** Resolve a URL found in `from` to a site-relative path, or null if external. */
function resolveLocal(value: string, from: string): { path: string; hash: string } | null {
  if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(value) || value.startsWith("//")) return null;
  const [raw, hash = ""] = value.split("#");
  let path = decodeURIComponent(raw.split("?")[0]);
  if (path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length);
  else if (path.startsWith("/")) path = path.slice(1);
  else {
    const dir = from.includes("/") ? from.slice(0, from.lastIndexOf("/") + 1) : "";
    path = new URL(path, "http://x/" + dir).pathname.slice(1);
  }
  if (path === "" || path.endsWith("/")) path += "index.html";
  return { path, hash };
}

for (const [page, html] of pageText) {
  // Page-level requirements
  if (!/<html[^>]*\slang="[^"]+"/.test(html)) errors.push(`${page}: <html> is missing lang`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${page}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${page}: missing meta description`);
  if (page !== "404.html" && !/<link rel="canonical"/.test(html)) errors.push(`${page}: missing canonical link`);

  // Images need alt text (empty alt is fine for decorative images)
  for (const m of html.matchAll(/<img\b[^>]*>/gs)) {
    if (!/\salt=/.test(m[0])) errors.push(`${page}: <img> without alt: ${m[0].slice(0, 80).replace(/\s+/g, " ")}`);
  }

  // Every local src/href must exist; every #anchor must exist
  for (const m of html.matchAll(/\s(src|href)="([^"]*)"/g)) {
    const value = m[2];
    if (value === "") {
      errors.push(`${page}: empty ${m[1]}`);
      continue;
    }
    if (value === "#") continue; // "back to top"
    const target = resolveLocal(value, page);
    if (!target) continue;
    const { path, hash } = target;
    const onPage = value.startsWith("#");
    const file = onPage ? page : path;
    if (!onPage) {
      if (!fileSet.has(file)) {
        errors.push(`${page}: broken ${m[1]} -> ${value}`);
        continue;
      }
      referenced.add(file);
    }
    if (hash && file.endsWith(".html") && !pageIds.get(file)?.has(hash)) {
      errors.push(`${page}: missing anchor -> ${value}`);
    }
  }
}

// CSS url(...) references
for (const css of files.filter((f) => f.endsWith(".css"))) {
  const text = await Deno.readTextFile(new URL(css, SITE));
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (m[1].startsWith("#")) continue; // in-document reference, e.g. an SVG marker
    const target = resolveLocal(m[1], css);
    if (!target) continue;
    if (!fileSet.has(target.path)) errors.push(`${css}: broken url() -> ${m[1]}`);
    else referenced.add(target.path);
  }
}

// JS module imports and module-relative URLs (new URL("…", import.meta.url))
for (const js of files.filter((f) => f.endsWith(".js"))) {
  const text = await Deno.readTextFile(new URL(js, SITE));
  const specs = [
    ...text.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...text.matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g),
    ...text.matchAll(/new URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url\s*\)/g),
  ].map((m) => m[1]);
  for (const spec of specs) {
    const target = resolveLocal(spec, js);
    if (!target) continue;
    if (!fileSet.has(target.path)) errors.push(`${js}: broken import/URL -> ${spec}`);
    else referenced.add(target.path);
  }
}

// Images: rasters must be WebP, at most MAX_IMAGE_SIDE on the long side
function webpSize(bytes: Uint8Array): [number, number] | null {
  const tag = String.fromCharCode(...bytes.subarray(12, 16));
  const v = new DataView(bytes.buffer, bytes.byteOffset);
  if (tag === "VP8 ") return [v.getUint16(26, true) & 0x3fff, v.getUint16(28, true) & 0x3fff];
  if (tag === "VP8L") {
    const b = v.getUint32(21, true);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  if (tag === "VP8X") {
    const w = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const h = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    return [w, h];
  }
  return null;
}
for (const f of files.filter((f) => f.startsWith("assets/"))) {
  if (/\.(png|jpe?g|gif|bmp|tiff?)$/i.test(f)) {
    errors.push(`${f}: raster images must be WebP (run \`deno task images\`)`);
  } else if (f.endsWith(".webp")) {
    const size = webpSize(await Deno.readFile(new URL(f, SITE)));
    if (size && Math.max(...size) > MAX_IMAGE_SIDE) {
      warnings.push(`${f} is ${size[0]}×${size[1]} px (limit ${MAX_IMAGE_SIDE} on the long side)`);
    }
  }
}

// Projects: every entry needs its page and a homepage row
const projects: { page: string; title: string }[] = JSON.parse(await Deno.readTextFile(PROJECTS));
const home = pageText.get("index.html") ?? "";
for (const p of projects) {
  if (!fileSet.has(p.page)) errors.push(`projects.json: "${p.title}" has no page ${p.page}`);
  if (!home.includes(`class="project-row__media" href="${p.page}"`)) {
    errors.push(`projects.json: "${p.title}" has no homepage row linking ${p.page}`);
  }
}

// Warnings: size budget and unreferenced assets
for (const f of files) {
  const { size } = await Deno.stat(new URL(f, SITE));
  if (f.startsWith("assets/") && size > SIZE_BUDGET) {
    warnings.push(`${f} is ${(size / 1048576).toFixed(1)} MB (budget ${SIZE_BUDGET / 1048576} MB)`);
  }
  if (f.startsWith("assets/") && !referenced.has(f)) warnings.push(`unreferenced asset: ${f}`);
}

// Placeholders still on the site: a reminder, not a failure
const PLACEHOLDERS: [string, RegExp][] = [
  ['"xx" counts', />\s*xx\s*</g],
  ['"Coming soon"', /coming soon/gi],
  ['"In progress"', />\s*in progress\s*</gi],
];
const todo: string[] = [];
for (const [page, html] of pageText) {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  for (const [label, re] of PLACEHOLDERS) {
    const n = body.match(re)?.length ?? 0;
    if (n) todo.push(`${page}: ${n}× ${label}`);
  }
}

const imgCount = [...pageText.values()].reduce((n, h) => n + [...h.matchAll(/<img\b/g)].length, 0);
console.log(`Checked ${pages.length} pages, ${imgCount} images, ${files.length} files.`);
if (todo.length) console.log(`Placeholders to fill in:\n${todo.map((t) => `  todo  ${t}`).join("\n")}`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s).`);
  Deno.exit(1);
}
console.log(`OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`);
