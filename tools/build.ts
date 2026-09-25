/**
 * Builds dist/ from site/, stamping shared partials into every page.
 *
 * In a page, an include comment is replaced by site/_partials/<name>.html:
 *   <!-- @include navbar -->
 *   <!-- @include navbar active="projects" -->   (highlights that nav link)
 *   <!-- @include footer -->
 *
 * Usage:
 *   deno task build          build once
 *   deno task dev            build, watch site/ and serve at http://localhost:8000/folio/
 */
import { serveDir } from "jsr:@std/http@^1/file-server";
import { fromFileUrl } from "jsr:@std/path@^1";

const SITE = new URL("../site/", import.meta.url);
const DIST = new URL("../dist/", import.meta.url);
const PARTIALS_DIR = "_partials";
const INCLUDE = /^([ \t]*)<!--\s*@include\s+([\w-]+)((?:\s+[\w-]+="[^"]*")*)\s*-->[ \t]*$/gm;

async function loadPartials(): Promise<Map<string, string>> {
  const partials = new Map<string, string>();
  for await (const entry of Deno.readDir(new URL(PARTIALS_DIR + "/", SITE))) {
    if (!entry.isFile || !entry.name.endsWith(".html")) continue;
    const raw = await Deno.readTextFile(new URL(`${PARTIALS_DIR}/${entry.name}`, SITE));
    // Drop the leading documentation comment.
    partials.set(entry.name.slice(0, -5), raw.replace(/^\s*<!--[\s\S]*?-->\s*/, "").trimEnd());
  }
  return partials;
}

function parseAttrs(src: string): Record<string, string> {
  return Object.fromEntries([...src.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

/** Per-page placeholder values: the homepage links to its own sections. */
function placeholders(page: string): Record<string, string> {
  const home = page === "index.html";
  return {
    home: home ? "#home" : "index.html",
    index: home ? "" : "index.html",
    engineering: home ? "#engineering" : "engineering.html",
  };
}

function renderPartial(name: string, body: string, page: string, attrs: Record<string, string>): string {
  let out = body.replace(/\{\{(\w+)\}\}/g, (token, key) => placeholders(page)[key] ?? token);
  if (/\{\{\w+\}\}/.test(out)) throw new Error(`${page}: unfilled placeholder in partial "${name}"`);

  if (attrs.active) {
    const link = new RegExp(`<a href="([^"]*)" data-nav="${attrs.active}"(?: data-group="([^"]*)")?>`);
    const m = out.match(link);
    if (!m) throw new Error(`${page}: no nav link "${attrs.active}" in partial "${name}"`);
    const current = m[1] === page ? "page" : "true";
    out = out.replace(link, `<a href="${m[1]}" class="is-active" aria-current="${current}">`);
    // A link inside a dropdown group also highlights the group's button.
    const group = m[2];
    if (group) {
      const button = new RegExp(`(<button[^>]*class="nav-group__btn)("[^>]*data-nav="${group}")`);
      if (!button.test(out)) throw new Error(`${page}: no nav group "${group}" in partial "${name}"`);
      out = out.replace(button, "$1 is-active$2");
    }
  }
  return out.replace(/ data-(?:nav|group)="[^"]*"/g, "");
}

async function copyDir(from: URL, to: URL) {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    if (entry.name === PARTIALS_DIR) continue;
    const src = new URL(entry.name + (entry.isDirectory ? "/" : ""), from);
    const dest = new URL(entry.name + (entry.isDirectory ? "/" : ""), to);
    if (entry.isDirectory) await copyDir(src, dest);
    else await Deno.copyFile(src, dest);
  }
}

export async function build(): Promise<number> {
  const started = performance.now();
  const partials = await loadPartials();
  await Deno.remove(DIST, { recursive: true }).catch(() => {});
  await copyDir(SITE, DIST);

  let includes = 0;
  for await (const entry of Deno.readDir(SITE)) {
    if (!entry.isFile || !entry.name.endsWith(".html")) continue;
    const page = entry.name;
    const html = await Deno.readTextFile(new URL(page, SITE));
    const out = html.replace(INCLUDE, (_all, indent: string, name: string, attrSrc: string) => {
      const body = partials.get(name);
      if (body === undefined) throw new Error(`${page}: unknown partial "${name}"`);
      includes++;
      return renderPartial(name, body, page, parseAttrs(attrSrc))
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n");
    });
    if (/<!--\s*@include/.test(out)) throw new Error(`${page}: malformed @include (must be alone on its line)`);
    await Deno.writeTextFile(new URL(page, DIST), out);
  }
  console.log(`Built dist/ with ${includes} includes in ${Math.round(performance.now() - started)} ms.`);
  return includes;
}

if (import.meta.main) {
  const args = new Set(Deno.args);
  try {
    await build();
  } catch (err) {
    console.error(`Build failed: ${(err as Error).message}`);
    if (!args.has("--watch")) Deno.exit(1);
  }

  if (args.has("--serve")) {
    // Mirror GitHub Pages: site under /folio/, 404.html for missing paths.
    const notFound = () => Deno.readTextFile(new URL("404.html", DIST));
    const port = 8000;
    try {
      const probe = Deno.listen({ port });
      probe.close();
    } catch (err) {
      if (err instanceof Deno.errors.AddrInUse) {
        console.error(`Port ${port} is already in use. Is another \`deno task dev\` still running?`);
        Deno.exit(1);
      }
      throw err;
    }
    Deno.serve({ port, onListen: () => console.log(`Serving http://localhost:${port}/folio/`) }, async (req) => {
      const { pathname } = new URL(req.url);
      if (!pathname.startsWith("/folio")) return Response.redirect(new URL("/folio/", req.url), 302);
      const res = await serveDir(req, { fsRoot: fromFileUrl(DIST), urlRoot: "folio", quiet: true });
      if (res.status !== 404) return res;
      return new Response(await notFound(), { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
    });
  }

  if (args.has("--watch")) {
    console.log("Watching site/ for changes...");
    let timer: number | undefined;
    for await (const _event of Deno.watchFs(fromFileUrl(SITE))) {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((err) => console.error(`Build failed: ${err.message}`)), 150);
    }
  }
}
