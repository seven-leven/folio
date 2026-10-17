/**
 * Serves dist/ the way GitHub Pages does: the site under /folio/, a folder's
 * index.html for a path ending in "/", and 404.html (status 404) for anything
 * missing. Used by the dev server and the browser-based tools.
 */
import { createServer, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const DIST = new URL("../dist/", import.meta.url);
const ROOT = fileURLToPath(DIST);
const BASE = "/folio";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
};

/** The file in dist/ for a request path, or null if it would leave dist/ or doesn't exist. */
async function fileFor(pathname: string): Promise<string | null> {
  let rel = decodeURIComponent(pathname.slice(BASE.length)) || "/";
  if (rel.endsWith("/")) rel += "index.html";
  const file = normalize(join(ROOT, rel));
  if (!file.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) return null;
  try {
    return (await stat(file)).isFile() ? file : null;
  } catch {
    return null;
  }
}

/** Starts the server; resolves once it's listening, rejects if the port is taken. */
export function serveDist(port: number): Promise<Server> {
  const server = createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (pathname !== BASE && !pathname.startsWith(BASE + "/")) {
      res.writeHead(302, { location: BASE + "/" }).end();
      return;
    }
    if (pathname === BASE) {
      res.writeHead(301, { location: BASE + "/" }).end();
      return;
    }
    const file = await fileFor(pathname);
    if (file) {
      res.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" });
      res.end(req.method === "HEAD" ? undefined : await readFile(file));
      return;
    }
    const notFound = await readFile(join(ROOT, "404.html")).catch(() => "Not found");
    res.writeHead(404, { "content-type": TYPES[".html"] }).end(notFound);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => resolve(server));
  });
}
