/**
 * Makes a project page's 3D model and its poster from a SketchUp (.skp) or Rhino (.3dm) file:
 *
 *   npm run model -- sem2 "C:\path\to\model.3dm"
 *   npm run model -- sem2 --poster          (only retake the poster, e.g. after changing the views)
 *
 * The page needs a "model" entry in src/data/projects.json (it says where the files go) and
 * a <Model page="semN.html" /> component where the viewer should be.
 *
 * 1. Rhino 8 imports the file and exports FBX (it opens, converts and quits). FBX, not glTF:
 *    Rhino's glTF writer fails on some Enscape materials, and FBX keeps the units and textures.
 * 2. Blender runs web-model.py: drops the ground plane, joins, centres, WebP textures, Draco.
 * 3. The site is built, headless Chrome opens the viewer, and its first view is saved as the poster.
 *
 * Rhino and Blender are found in their usual Windows install folders, or set RHINO_PATH / BLENDER_PATH.
 */
import sharp from "sharp";
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { capture, inherit } from "../proc.ts";
import { openBrowser } from "../browser.ts";

const SITE = new URL("../../public/", import.meta.url);
const PROJECTS = new URL("../../src/data/projects.json", import.meta.url);
const HERE = new URL("./", import.meta.url);
const POSTER = { width: 1600, height: 1000 }; // the model partial's <img> size

const [name, source] = process.argv.slice(2);
if (!name || !source) {
  console.error("Usage: npm run model -- <page, e.g. sem2> <model.skp|.3dm>   or   npm run model -- <page> --poster");
  process.exit(1);
}
const page = name.endsWith(".html") ? name : `${name}.html`;
const projects: { page: string; model?: { file: string; poster: string } }[] = JSON.parse(
  await readFile(PROJECTS, "utf8"),
);
const model = projects.find((p) => p.page === page)?.model;
if (!model) fail(`${page} has no "model" entry in src/data/projects.json; add one first.`);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

/** The newest install matching `dir/<version>/exe`, or the env override. */
function findApp(env: string, candidates: string[]): string {
  const fromEnv = process.env[env];
  if (fromEnv) return fromEnv;
  for (const c of candidates) {
    try {
      statSync(c);
      return c;
    } catch {
      /* not here */
    }
  }
  fail(`Couldn't find it at ${candidates.join(" or ")}. Set ${env} to its path.`);
}

function blenderPath(): string {
  const root = "C:/Program Files/Blender Foundation";
  let versions: string[] = [];
  try {
    versions = readdirSync(root)
      .filter((n) => /^Blender \d/.test(n))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  } catch {
    /* not installed there */
  }
  return findApp(
    "BLENDER_PATH",
    versions.map((v) => `${root}/${v}/blender.exe`),
  );
}

async function run(cmd: string, args: string[]) {
  const { success, stdout, stderr } = await capture(cmd, args);
  const text = stdout + stderr;
  if (!success) fail(`${cmd} failed:\n${text}`);
  return text;
}

if (source !== "--poster") {
  const tmp = await mkdtemp(join(tmpdir(), "folio-model-"));
  const input = join(tmp, "source" + source.slice(source.lastIndexOf(".")));
  await copyFile(source, input); // Rhino's command line doesn't take spaces in paths well
  const fbx = join(tmp, "rhino.fbx");

  console.log("1/3 Rhino: exporting FBX…");
  const script = join(tmp, "convert.txt");
  await writeFile(
    script,
    [`-_Import "${input}" _Enter`, "-_SelAll", `-_Export "${fbx}" _Enter _Enter`, "-_Exit _No", ""].join("\r\n"),
  );
  const rhino = findApp("RHINO_PATH", ["C:/Program Files/Rhino 8/System/Rhino.exe"]);
  // Rhino wants /runscript="…" quoted exactly like that, which Node's own argument quoting changes,
  // so it goes through a batch file (which also waits for Rhino to quit)
  const bat = join(tmp, "rhino.cmd");
  await writeFile(bat, `@"${rhino}" /nosplash /notemplate /runscript="-_ReadCommandFile ${script}"\r\n`);
  const proc = spawn("cmd", ["/c", bat], { stdio: "ignore" });
  const exited = new Promise((r) => proc.on("close", r));
  // A big model can take a while; a dialog waiting for an answer would take forever
  const timer = setTimeout(() => {
    console.error(
      "    Rhino is taking over 20 minutes; closing it. Open the file in Rhino to see if it asks something.",
    );
    spawn("taskkill", ["/T", "/F", "/PID", String(proc.pid)], { stdio: "ignore" });
  }, 20 * 60_000);
  await exited;
  clearTimeout(timer);
  try {
    await stat(fbx);
  } catch {
    fail("Rhino didn't write the FBX. Try the import and export by hand in Rhino to see what it asks.");
  }

  console.log("2/3 Blender: making it web-ready…");
  const out = fileURLToPath(new URL(model.file, SITE));
  await mkdir(join(out, ".."), { recursive: true });
  const log = await run(blenderPath(), [
    "-b",
    "--python",
    fileURLToPath(new URL("web-model.py", HERE)),
    "--",
    fbx,
    out,
  ]);
  for (const line of log.split("\n")) {
    if (/Dropped|Merged|Simplified|triangles/.test(line)) console.log("    " + line.trim());
  }
  console.log(`    ${model.file}: ${((await stat(out)).size / 1048576).toFixed(2)} MB`);
  await rm(tmp, { recursive: true, force: true });
}

console.log("3/3 Poster: opening the viewer…");
// FOLIO_LENIENT: other pages may still be waiting for their models
if (!(await inherit("npm", ["run", "build"], { env: { ...process.env, FOLIO_LENIENT: "1" } })))
  fail("The build failed.");
const { browser, url, close } = await openBrowser(8133);
try {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });
  await tab.goto(url(page), { waitUntil: "networkidle0" });
  // Shoot the canvas alone: no old poster, no frame
  await tab.addStyleTag({
    content:
      ".model-viewer__poster{display:none!important}.model-viewer__stage{border:0!important;border-radius:0!important}" +
      ".animate-on-scroll-target{opacity:1!important;transform:none!important}",
  });
  await tab.$eval(".model-viewer", (f) => f.scrollIntoView({ block: "center" }));
  await tab.$eval("[data-mv-load]", (b) => (b as HTMLElement).click());
  await tab.waitForSelector(".model-viewer.is-live, .model-viewer.is-failed", { timeout: 60000 });
  if (await tab.$(".model-viewer.is-failed")) fail("The viewer couldn't load the model (see the browser console).");
  await new Promise((r) => setTimeout(r, 1500));
  const shot = await (await tab.$(".model-viewer__stage"))!.screenshot({ type: "png" });
  await sharp(shot)
    .resize(POSTER.width, POSTER.height, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(fileURLToPath(new URL(model.poster, SITE)));
  console.log(`    ${model.poster}`);
} finally {
  await close();
}
console.log(`Done. Check it with npm run dev: http://localhost:8000/folio/${page}`);
