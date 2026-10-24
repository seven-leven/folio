/**
 * Responsive images. The site's pictures are up to 2400 px wide, and without srcset every
 * phone downloads them at full size. After the build, each local .webp wider than the
 * smallest step below gets smaller copies next to it (name-640w.webp, name-1024w.webp, …)
 * and its <img> a srcset listing them. The src stays the full-size file, which is also what
 * the lightbox opens.
 *
 * sizes: "auto" for lazy images, so browsers that support it pick by the image's real width
 * on the page; otherwise "100vw", which never picks a smaller file than the screen needs.
 *
 * The copies are cached in .cache/responsive-images/ (ignored by git) by the source file's
 * hash, so only new or changed images are resized on the next build.
 */
import { createHash } from "node:crypto";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import sharp from "sharp";

const WIDTHS = [640, 1024, 1600];
const QUALITY = 80;
const CACHE = join(process.cwd(), ".cache", "responsive-images");

export function responsiveImages(): AstroIntegration {
  return {
    name: "folio-responsive-images",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        sharp.cache(false);
        const root = fileURLToPath(dir);
        await mkdir(CACHE, { recursive: true });
        const pages = (await readdir(root)).filter((f) => f.endsWith(".html"));

        // "assets/…/x.webp" -> its srcset, worked out once per file
        const srcsets = new Map<string, string | null>();
        let made = 0;
        let cached = 0;
        async function srcsetFor(file: string): Promise<string | null> {
          if (srcsets.has(file)) return srcsets.get(file) ?? null;
          const path = join(root, file);
          let result: string | null = null;
          if (existsSync(path)) {
            const bytes = await readFile(path);
            const { width = 0 } = await sharp(bytes).metadata();
            const steps = WIDTHS.filter((w) => w < width);
            if (steps.length) {
              const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
              const parts: string[] = [];
              for (const w of steps) {
                const name = file.replace(/\.webp$/, `-${w}w.webp`);
                const cache = join(CACHE, `${hash}-${w}.webp`);
                if (existsSync(cache)) cached++;
                else {
                  await writeFile(cache, await sharp(bytes).resize({ width: w }).webp({ quality: QUALITY }).toBuffer());
                  made++;
                }
                await copyFile(cache, join(root, name));
                parts.push(`${name.split("/").pop()} ${w}w`);
              }
              parts.push(`${file.split("/").pop()} ${width}w`);
              result = parts.join(", ");
            }
          }
          srcsets.set(file, result);
          return result;
        }

        let images = 0;
        for (const page of pages) {
          const path = join(root, page);
          const html = await readFile(path, "utf8");
          const tags = [...html.matchAll(/<img\b[^>]*>/g)];
          let out = html;
          for (const [tag] of tags) {
            if (/\ssrcset=/.test(tag)) continue;
            const src = tag.match(/\ssrc="((?:\/folio\/)?(assets\/[^"?#]+\.webp))"/);
            if (!src) continue;
            const set = await srcsetFor(src[2]);
            if (!set) continue;
            // srcset entries are relative to the image's own folder, written like its src
            const folder = src[1].slice(0, src[1].lastIndexOf("/") + 1);
            const srcset = set
              .split(", ")
              .map((s) => folder + s)
              .join(", ");
            const sizes = /\sloading="lazy"/.test(tag) ? "auto, 100vw" : "100vw";
            out = out.replace(tag, tag.replace(/\ssrc="/, ` srcset="${srcset}" sizes="${sizes}" src="`));
            images++;
          }
          if (out !== html) await writeFile(path, out);
        }
        const files = [...srcsets.values()].filter(Boolean).length;
        logger.info(
          `srcset on ${images} images (${files} files; ${made} copies made, ${cached} from the cache) in ${relative(process.cwd(), root) || "."}`,
        );
      },
    },
  };
}
