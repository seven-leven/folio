/**
 * Static site checker for the built site in dist/ (run `deno task build` first;
 * `deno task check` does that automatically).
 *
 * Errors (fail CI): broken local links/images/scripts/styles, missing
 * #anchors, <img> without alt, pages missing <title>, meta description,
 * lang or canonical, and duplicate ids.
 * Warnings: assets over the size budget and assets nothing references.
 *
 * Run: deno task check
 */

const SITE = new URL("../dist/", import.meta.url);
const BASE_PATH = "/folio/"; // GitHub Pages project path, used by 404.html
const SIZE_BUDGET = 1.5 * 1024 * 1024;

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
    if (value === "" ) {
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
    const target = resolveLocal(m[1], css);
    if (!target) continue;
    if (!fileSet.has(target.path)) errors.push(`${css}: broken url() -> ${m[1]}`);
    else referenced.add(target.path);
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

const imgCount = [...pageText.values()].reduce((n, h) => n + [...h.matchAll(/<img\b/g)].length, 0);
console.log(`Checked ${pages.length} pages, ${imgCount} images, ${files.length} files.`);
for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
if (errors.length) {
  console.log(`\n${errors.length} error(s).`);
  Deno.exit(1);
}
console.log(`OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`);
