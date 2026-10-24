/**
 * Cache busting for the site's own CSS and JavaScript.
 *
 * GitHub Pages lets browsers keep files for 10 minutes, and the pages load their stylesheets
 * and scripts by plain path, so right after a deploy a fresh page could run with the old
 * main.css or main.js. After the build, every local .css/.js reference in the pages gets
 * ?v=<hash of the file's contents>, so a changed file has a new address and an unchanged
 * one keeps its cache.
 *
 * Scripts that load other scripts (the coding animations, the 3D viewer and three.js) do so
 * by path from inside the JavaScript, which this doesn't rewrite. Instead, each page that
 * runs modules gets an import map from every module's plain address to its stamped one, so
 * those imports pick up the new versions too.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

const BASE = "/folio/";

async function filesIn(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries.filter((e) => e.isFile()).map((e) => relative(dir, join(e.parentPath, e.name)).replaceAll("\\", "/"));
}

const hashOf = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex").slice(0, 10);

export function cacheBust(): AstroIntegration {
  return {
    name: "folio-cache-bust",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await filesIn(root);

        // "assets/js/main.js" -> "a1b2c3d4e5"
        const hashes = new Map<string, string>();
        for (const f of files.filter((f) => /^assets\/.+\.(css|js)$/.test(f))) {
          hashes.set(f, hashOf(await readFile(join(root, f))));
        }
        const stamped = (path: string) => `${BASE}${path}?v=${hashes.get(path)}`;

        // Every module: plain address -> stamped address, for the import maps
        const modules = Object.fromEntries(
          [...hashes.keys()].filter((f) => f.endsWith(".js")).map((f) => [BASE + f, stamped(f)]),
        );

        let pages = 0;
        let references = 0;
        for (const page of files.filter((f) => f.endsWith(".html"))) {
          const path = join(root, page);
          let html = await readFile(path, "utf8");

          // src="assets/…js", href="assets/…css", and the 404 page's /folio/assets/… forms
          html = html.replace(
            /\s(src|href)="((?:\/folio\/)?(assets\/[^"?#]+\.(?:css|js)))"/g,
            (all, attr, value, file) => {
              if (!hashes.has(file)) return all;
              references++;
              return ` ${attr}="${value}?v=${hashes.get(file)}"`;
            },
          );

          if (/<script type="module"/.test(html)) {
            const existing = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
            if (existing) {
              // The page's own map (three.js for the 3D viewer): stamp its entries and add the modules
              const map = JSON.parse(existing[1]);
              const imports: Record<string, string> = {};
              for (const [key, value] of Object.entries<string>(map.imports ?? {})) {
                const file = value.replace(/^\.\//, "").replace(BASE, "");
                imports[key] = hashes.has(file) ? stamped(file) : value;
                // A prefix entry ("three/addons/"): also map each file under it by name, so
                // `import … from "three/addons/…"` gets the stamped address
                if (key.endsWith("/") && !hashes.has(file)) {
                  for (const f of hashes.keys()) {
                    if (f.startsWith(file) && f.endsWith(".js")) imports[key + f.slice(file.length)] = stamped(f);
                  }
                }
              }
              const merged = JSON.stringify({ imports: { ...imports, ...modules } });
              html = html.replace(existing[0], `<script type="importmap">${merged}</script>`);
            } else {
              // A new map, before the first module script runs
              const map = `<script type="importmap">${JSON.stringify({ imports: modules })}</script>\n    `;
              html = html.replace(/<script type="module"/, `${map}$&`);
            }
          }
          await writeFile(path, html);
          pages++;
        }
        logger.info(`stamped ${references} CSS/JS references in ${pages} pages (${hashes.size} files)`);
      },
    },
  };
}
