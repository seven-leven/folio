/**
 * Renders src/partials/<name>.html for a page, the way tools/build.ts used to:
 * {{placeholders}} are filled per page (the version, the footer's project list,
 * the 3D model's files and sizes), and `active` highlights a navbar link.
 *
 * Used by the Navbar, Footer and Model components. A later step of
 * docs/MIGRATION.md replaces these string templates with Astro markup.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { sep } from "node:path";
import { pathToFileURL } from "node:url";
import { siteVersion } from "../../tools/version.ts";

// Astro bundles this file into dist/ while it builds, so paths start from the project root (where npm runs), not from here
const ROOT = pathToFileURL(`${process.cwd()}${sep}`);
const PUBLIC = new URL("public/", ROOT);
const PARTIALS = new URL("src/partials/", ROOT);

export interface Project {
  page: string;
  title: string;
  label: string;
  semester: number;
  /** A 3D model for the viewer (the Model component); paths are relative to public/ */
  model?: { file: string; poster: string; alt: string; caption: string; clay?: boolean };
}

/** With FOLIO_LENIENT=1 (npm run model), a page whose model isn't made yet builds without its viewer. */
const lenient = process.env.FOLIO_LENIENT === "1";

const megabytes = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function totalSize(dir: URL): Promise<number> {
  let bytes = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
    if (entry.isDirectory()) bytes += await totalSize(url);
    else if (entry.name !== "LICENSE") bytes += (await stat(url)).size;
  }
  return bytes;
}

let projectsCache: Promise<Project[]> | undefined;
export function projects(): Promise<Project[]> {
  projectsCache ??= readFile(new URL("src/data/projects.json", ROOT), "utf8").then(JSON.parse);
  return projectsCache;
}

let versionCache: Promise<string> | undefined;
const versionLabel = () => (versionCache ??= siteVersion().then((v) => v.label));

/** Placeholders for the model partial: the files, and what a visitor downloads (viewer + model). */
async function modelValues(project: Project | undefined): Promise<Record<string, string>> {
  if (!project?.model) return {};
  const { file, poster, alt, caption, clay = false } = project.model;
  const model = await stat(new URL(file, PUBLIC)).then(
    (s) => s.size,
    () => {
      const message = `${project.page}: no model at public/${file} (make it with npm run model)`;
      if (!lenient) throw new Error(message);
      console.warn(`  (skipping the viewer) ${message}`);
      return -1;
    },
  );
  if (model < 0) return { modelSize: "missing" };
  const viewer =
    (await totalSize(new URL("assets/vendor/three/", PUBLIC))) +
    (await stat(new URL("assets/js/model-viewer.js", PUBLIC))).size;
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

/** Per-page placeholder values: the homepage links to its own sections. */
async function placeholders(page: string): Promise<Record<string, string>> {
  const home = page === "index.html";
  const list = await projects();
  return {
    home: home ? "#home" : "index.html",
    index: home ? "" : "index.html",
    engineering: home ? "#engineering" : "engineering.html",
    version: await versionLabel(),
    projectLinks: list
      .map(
        (p) =>
          `<a href="${p.page}" data-label="${escapeHtml(p.label)}" data-sem="${p.semester}">${escapeHtml(p.title)}</a>`,
      )
      .join("\n        "),
    ...(await modelValues(list.find((p) => p.page === page))),
  };
}

/** The partial's HTML for `page`, or "" for a model viewer whose model isn't made yet (lenient builds only). */
export async function renderPartial(name: string, page: string, attrs: { active?: string } = {}): Promise<string> {
  const raw = await readFile(new URL(`${name}.html`, PARTIALS), "utf8");
  const body = raw.replace(/^\s*<!--[\s\S]*?-->\s*/, "").trimEnd(); // drop the documentation comment
  const values = await placeholders(page);
  if (name === "model" && values.modelSize === "missing") return "";

  let out = body.replace(/\{\{(\w+)\}\}/g, (token, key) => values[key] ?? token);
  const missing = out.match(/\{\{(\w+)\}\}/);
  if (missing) {
    const hint = name === "model" ? ` (give ${page} a "model" entry in src/data/projects.json)` : "";
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
