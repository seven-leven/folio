/**
 * Converts images to WebP, at most 2400 px on the long side (the site's image rule).
 *
 * Run: deno task images <file or folder>...
 *   - PNG/JPG/GIF/TIFF: writes <name>.webp next to the original (delete the
 *     original once you've updated the HTML to point at the .webp).
 *   - WebP larger than the limit: shrinks it in place.
 * Options: --max=<px> (default 2400), --quality=<1-100> (default 82).
 */
import sharp from "sharp";

sharp.cache(false); // don't hold files open (Windows can't replace them otherwise)

const opts = Object.fromEntries(
  Deno.args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=") as [string, string]),
);
const MAX = Number(opts.max ?? 2400);
const QUALITY = Number(opts.quality ?? 82);
const inputs = Deno.args.filter((a) => !a.startsWith("--"));
if (!inputs.length) {
  console.error("Usage: deno task images <file or folder>... [--max=2400] [--quality=82]");
  Deno.exit(1);
}

const IMAGE = /\.(png|jpe?g|gif|tiff?|webp)$/i;

async function* walk(path: string): AsyncGenerator<string> {
  const info = await Deno.stat(path);
  if (info.isFile) {
    if (IMAGE.test(path)) yield path;
    return;
  }
  for await (const e of Deno.readDir(path)) yield* walk(`${path}/${e.name}`);
}

let changed = 0;
for (const input of inputs) {
  for await (const file of walk(input)) {
    const isWebp = /\.webp$/i.test(file);
    const bytes = await Deno.readFile(file); // work from memory, so the file itself stays closed
    const meta = await sharp(bytes).metadata();
    const long = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (isWebp && long <= MAX) continue;
    const target = isWebp ? file : file.replace(IMAGE, ".webp");
    const webp = await sharp(bytes)
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    await Deno.writeFile(target, webp);
    const after = await sharp(webp).metadata();
    console.log(`${target}: ${meta.width}×${meta.height} → ${after.width}×${after.height}`);
    changed++;
  }
}
console.log(changed ? `Converted ${changed} image(s).` : `Nothing to do: all images are WebP within ${MAX} px.`);
