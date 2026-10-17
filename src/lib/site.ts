/**
 * Site data the components read at build time: the project list, the version, and the
 * 3D model download sizes.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { sep } from "node:path";
import { pathToFileURL } from "node:url";
import { siteVersion } from "../../tools/version.ts";

// Astro bundles this file into dist/ while it builds, so paths start from the project root (where npm runs), not from here
const ROOT = pathToFileURL(`${process.cwd()}${sep}`);
const PUBLIC = new URL("public/", ROOT);

export interface Project {
  page: string;
  title: string;
  label: string;
  semester: number;
  /** A 3D model for the viewer (the Model component); paths are relative to public/ */
  model?: { file: string; poster: string; alt: string; caption: string; clay?: boolean };
}

let projectsCache: Promise<Project[]> | undefined;
/** The architecture projects, in order (src/data/projects.json). */
export function projects(): Promise<Project[]> {
  projectsCache ??= readFile(new URL("src/data/projects.json", ROOT), "utf8").then(JSON.parse);
  return projectsCache;
}

let versionCache: Promise<string> | undefined;
/** vMAJOR.MINOR.PATCH (tools/version.ts). */
export function versionLabel(): Promise<string> {
  versionCache ??= siteVersion().then((v) => v.label);
  return versionCache;
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

/**
 * What a visitor downloads for a project's model: the model alone, and the viewer (three.js and
 * model-viewer.js) with the model. Null if the model isn't made yet and FOLIO_LENIENT=1; an error otherwise.
 */
export async function modelSizes(project: Project): Promise<{ model: string; viewer: string } | null> {
  const file = project.model?.file ?? "";
  const model = await stat(new URL(file, PUBLIC)).then(
    (s) => s.size,
    () => null,
  );
  if (model === null) {
    const message = `${project.page}: no model at public/${file} (make it with npm run model)`;
    if (process.env.FOLIO_LENIENT !== "1") throw new Error(message);
    console.warn(`  (skipping the viewer) ${message}`);
    return null;
  }
  const viewer =
    (await totalSize(new URL("assets/vendor/three/", PUBLIC))) +
    (await stat(new URL("assets/js/model-viewer.js", PUBLIC))).size;
  return { model: megabytes(model), viewer: megabytes(viewer + model) };
}
