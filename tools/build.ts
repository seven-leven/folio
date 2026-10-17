/**
 * Builds dist/ from site/, stamping shared partials into every page.
 *
 * In a page, an include comment is replaced by site/_partials/<name>.html:
 *   <!-- @include navbar -->
 *   <!-- @include navbar active="projects" -->   (highlights that nav link)
 *   <!-- @include footer -->
 *
 * Partials can use {{placeholders}} (see placeholders() below), including the
 * site version and the project list from site/_data/projects.json.
 *   <!-- @include model -->                      (the page's 3D model viewer, from its
 *                                                  "model" entry in projects.json)
 * Folders starting with "_" (partials, data) are build inputs, not published.
 * The build also writes dist/sitemap.xml from the pages it finds.
 *
 * Usage:
 *   npm run build            build once
 *   npm run dev              build, watch site/ and serve at http://localhost:8000/folio/
 */
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { serveDist } from "./serve.ts";
import { gitDate, siteVersion } from "./version.ts";

const SITE = new URL("../site/", import.meta.url);
const DIST = new URL("../dist/", import.meta.url);
const SITE_URL = "https://seven-leven.github.io/folio/";
const INCLUDE = /^([ \t]*)<!--\s*@include\s+([\w-]+)((?:\s+[\w-]+="[^"]*")*)\s*-->[ \t]*$/gm;

interface Project {
  page: string;
  title: string;
  label: string;
  semester: number;
  /** A 3D model for the viewer (the model partial); paths are relative to site/ */
  model?: { file: string; poster: string; alt: string; caption: string; clay?: boolean };
}

const megabytes = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

async function totalSize(dir: URL): Promise<number> {
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    if (entry.isDirectory()) bytes += await totalSize(url);
    else if (entry.name !== "LICENSE") bytes += (await stat(url)).size;
  }
  return bytes;
}

/** Placeholders for the model partial: the files, and what a visitor downloads (viewer + model). */
async function modelValues(project: Project | undefined, lenient: boolean): Promise<Record<string, string>> {
  if (!project?.model) return {};
  const { file, poster, alt, caption, clay = false } = project.model;
  const model = await stat(new URL(file, SITE)).then((s) => s.size, () => {
    const message = `${project.page}: no model at site/${file} (make it with npm run model)`;
    if (!lenient) throw new Error(message);
    console.warn(`  (skipping the viewer) ${message}`);
    return -1;
  });
  if (model < 0) return { modelSize: "missing" };
  const viewer = await totalSize(new URL("assets/vendor/three/", SITE)) +
    (await stat(new URL("assets/js/model-viewer.js", SITE))).size;
  return {
    modelFile: file,
    modelPoster: poster,
    modelAlt: escapeHtml(alt),
    modelCaption: escapeHtml(caption),
    modelLabel: escapeHtml(`3D model of ${project.title}`),
    modelClay: String(clay),
    modelSize: megabytes(model),
    viewerSize: megabytes(viewer + model),
  };
}

async function loadPartials(): Promise<Map<string, string>> {
  const partials = new Map<string, string>();
  for (const entry of await readdir(new URL("_partials/", SITE), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const raw = await readFile(new URL(`_partials/${entry.name}`, SITE), "utf8");
    // Drop the leading documentation comment.
    partials.set(entry.name.slice(0, -5), raw.replace(/^\s*<!--[\s\S]*?-->\s*/, "").trimEnd());
  }
  return partials;
}

async function loadProjects(): Promise<Project[]> {
  return JSON.parse(await readFile(new URL("_data/projects.json", SITE), "utf8"));
}

function parseAttrs(src: string): Record<string, string> {
  return Object.fromEntries([...src.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Per-page placeholder values: the homepage links to its own sections. */
function placeholders(page: string, projects: Project[], version: string): Record<string, string> {
  const home = page === "index.html";
  return {
    home: home ? "#home" : "index.html",
    index: home ? "" : "index.html",
    engineering: home ? "#engineering" : "engineering.html",
    version,
    // One link per line; the partial supplies the first line's indent.
    projectLinks: projects
      .map((p) =>
        `<a href="${p.page}" data-label="${escapeHtml(p.label)}" data-sem="${p.semester}">${escapeHtml(p.title)}</a>`
      )
      .join("\n        "),
  };
}

function renderPartial(
  name: string,
  body: string,
  page: string,
  attrs: Record<string, string>,
  values: Record<string, string>,
): string {
  let out = body.replace(/\{\{(\w+)\}\}/g, (token, key) => values[key] ?? token);
  const missing = out.match(/\{\{(\w+)\}\}/);
  if (missing) {
    const hint = name === "model" ? ` (give ${page} a "model" entry in site/_data/projects.json)` : "";
    throw new Error(`${page}: unfilled placeholder {{${missing[1]}}} in partial "${name}"${hint}`);
  }

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
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue; // build inputs, not published
    const src = new URL(entry.name + (entry.isDirectory() ? "/" : ""), from);
    const dest = new URL(entry.name + (entry.isDirectory() ? "/" : ""), to);
    if (entry.isDirectory()) await copyDir(src, dest);
    else await copyFile(src, dest);
  }
}

async function writeSitemap(pages: string[]) {
  const urls = await Promise.all(
    pages
      .filter((p) => p !== "404.html")
      .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)))
      .map(async (p) => {
        const loc = SITE_URL + (p === "index.html" ? "" : p);
        const lastmod = await gitDate(`site/${p}`);
        return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
      }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    urls.join("\n")
  }\n</urlset>\n`;
  await writeFile(new URL("sitemap.xml", DIST), xml);
}

/** `lenient`: leave out viewers whose model isn't made yet, instead of failing (for npm run model). */
export async function build({ lenient = false } = {}): Promise<number> {
  const started = performance.now();
  const [partials, projects, version] = await Promise.all([loadPartials(), loadProjects(), siteVersion()]);
  await rm(DIST, { recursive: true, force: true }).catch(() => {});
  await copyDir(SITE, DIST);

  let includes = 0;
  const pages: string[] = [];
  for (const entry of await readdir(SITE, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const page = entry.name;
    pages.push(page);
    const values = {
      ...placeholders(page, projects, version.label),
      ...await modelValues(projects.find((p) => p.page === page), lenient),
    };
    const html = await readFile(new URL(page, SITE), "utf8");
    const out = html.replace(INCLUDE, (_all, indent: string, name: string, attrSrc: string) => {
      const body = partials.get(name);
      if (body === undefined) throw new Error(`${page}: unknown partial "${name}"`);
      if (name === "model" && values.modelSize === "missing") return "";
      includes++;
      return renderPartial(name, body, page, parseAttrs(attrSrc), values)
        .split("\n")
        .map((line) => (line ? indent + line : line))
        .join("\n");
    });
    if (/<!--\s*@include/.test(out)) throw new Error(`${page}: malformed @include (must be alone on its line)`);
    await writeFile(new URL(page, DIST), out);
  }
  await writeSitemap(pages);
  console.log(
    `Built dist/ (${version.label}) with ${includes} includes in ${Math.round(performance.now() - started)} ms.`,
  );
  return includes;
}

if (import.meta.main) {
  const args = new Set(process.argv.slice(2));
  try {
    await build();
  } catch (err) {
    console.error(`Build failed: ${(err as Error).message}`);
    if (!args.has("--watch")) process.exit(1);
  }

  if (args.has("--serve")) {
    // Mirror GitHub Pages: site under /folio/, 404.html for missing paths.
    const port = 8000;
    try {
      await serveDist(port);
      console.log(`Serving http://localhost:${port}/folio/`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Is another \`npm run dev\` still running?`);
        process.exit(1);
      }
      throw err;
    }
  }

  if (args.has("--watch")) {
    console.log("Watching site/ for changes...");
    let timer: ReturnType<typeof setTimeout> | undefined;
    watch(fileURLToPath(SITE), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((err) => console.error(`Build failed: ${err.message}`)), 150);
    });
  }
}
