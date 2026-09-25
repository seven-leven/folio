/**
 * Shared setup for the browser-based tools (snapshot, tap-test): serve dist/
 * the way GitHub Pages does and launch a headless Chrome.
 *
 * Chrome is found at CHROME_PATH, or the usual install locations on Windows,
 * macOS and Linux (GitHub's Ubuntu runners have it at /usr/bin/google-chrome).
 */
import puppeteer, { type Browser } from "puppeteer-core";
import { serveDir } from "@std/http/file-server";
import { fromFileUrl } from "@std/path";

export const DIST = new URL("../dist/", import.meta.url);

const CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function chromePath(): string {
  const fromEnv = Deno.env.get("CHROME_PATH");
  if (fromEnv) return fromEnv;
  for (const p of CANDIDATES) {
    try {
      Deno.statSync(p);
      return p;
    } catch { /* not here */ }
  }
  throw new Error("Chrome not found. Install it or set CHROME_PATH.");
}

/** Pages in dist/, homepage first. */
export async function distPages(): Promise<string[]> {
  const pages: string[] = [];
  for await (const e of Deno.readDir(DIST)) if (e.isFile && e.name.endsWith(".html")) pages.push(e.name);
  return pages.sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
}

/** Serves dist/ under /folio/ and launches Chrome; call close() when done. */
export async function openBrowser(
  port = 8130,
): Promise<{ browser: Browser; url: (page: string) => string; close: () => Promise<void> }> {
  const server = Deno.serve(
    { port, onListen() {} },
    (req) => serveDir(req, { fsRoot: fromFileUrl(DIST), urlRoot: "folio", quiet: true }),
  );
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--hide-scrollbars", "--force-color-profile=srgb", "--no-sandbox"],
  });
  return {
    browser,
    url: (page) => `http://localhost:${port}/folio/${page}`,
    close: async () => {
      await browser.close();
      await server.shutdown();
    },
  };
}
