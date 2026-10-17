/**
 * External link check: requests every http(s) link and image on the built
 * pages and reports the broken ones. Runs monthly in CI (links.yml) and fails
 * if anything is broken, so GitHub emails you; run it yourself any time.
 *
 * Broken (fails): 404/410 and other 4xx/5xx, DNS or connection errors, timeouts.
 * Warned (passes): 401/403/429, which usually mean a site blocks bots rather
 * than a dead link.
 *
 * Run: npm run links
 */
import { readdir, readFile } from "node:fs/promises";

const DIST = new URL("../dist/", import.meta.url);
const TIMEOUT = 20_000;
const CONCURRENCY = 6;
const BOT_BLOCKED = new Set([401, 403, 429, 999]);

const pagesFor = new Map<string, Set<string>>();
for (const e of await readdir(DIST, { withFileTypes: true })) {
  if (!e.isFile() || !e.name.endsWith(".html")) continue;
  const html = await readFile(new URL(e.name, DIST), "utf8");
  for (const m of html.matchAll(/\s(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (/fonts\.(googleapis|gstatic)\.com/.test(url)) continue; // preconnect/stylesheet hosts
    if (!pagesFor.has(url)) pagesFor.set(url, new Set());
    pagesFor.get(url)!.add(e.name);
  }
}

async function status(url: string): Promise<number | string> {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT),
        headers: { "user-agent": "Mozilla/5.0 (link check for seven-leven.github.io/folio)" },
      });
      await res.body?.cancel();
      // Some servers reject HEAD; retry those with GET.
      if (method === "HEAD" && (res.status === 405 || res.status === 501 || res.status >= 400)) continue;
      return res.status;
    } catch (err) {
      if (method === "GET") return (err as Error).name === "TimeoutError" ? "timeout" : (err as Error).message;
    }
  }
  return "no response";
}

const urls = [...pagesFor.keys()];
const results = new Map<string, number | string>();
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await status(url));
    }
  }),
);

const broken: string[] = [];
const warned: string[] = [];
for (const [url, s] of results) {
  const where = [...pagesFor.get(url)!].join(", ");
  if (typeof s === "number" && s < 400) continue;
  const line = `${s}  ${url}  (${where})`;
  if (typeof s === "number" && BOT_BLOCKED.has(s)) warned.push(line);
  else broken.push(line);
}
console.log(`Checked ${urls.length} external links.`);
for (const w of warned) console.log(`  warn   ${w}`);
for (const b of broken) console.log(`  BROKEN ${b}`);
if (broken.length) process.exit(1);
console.log("No broken links.");
