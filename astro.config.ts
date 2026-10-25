import { readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig, type AstroIntegration } from "astro/config";
import { cacheBust } from "./src/integrations/cache-bust.ts";
import { responsiveImages } from "./src/integrations/responsive-images.ts";
import { gitDate } from "./tools/version.ts";

const SITE_URL = "https://seven-leven.github.io/folio/";

/** npm run dev: send http://localhost:8000/ to /folio/, where the site lives (as on GitHub Pages). */
function devRootRedirect(): AstroIntegration {
  return {
    name: "folio-dev-root",
    hooks: {
      "astro:config:setup": ({ command, updateConfig }) => {
        if (command !== "dev") return;
        updateConfig({
          vite: {
            plugins: [
              {
                name: "folio-dev-root",
                // The returned hook runs after Astro's, which puts its base-path check (a 404 for "/")
                // at the front of the stack; putting ours in front of that lets "/" through to here
                configureServer: (server) => () => {
                  server.middlewares.stack.unshift({
                    route: "",
                    handle: (req, res, next) => {
                      if (req.url === "/" || req.url === "/index.html") {
                        res.writeHead(302, { location: "/folio/" }).end();
                        return;
                      }
                      next();
                    },
                  });
                },
              },
            ],
          },
        });
      },
    },
  };
}

/** Writes dist/sitemap.xml: every page but 404, homepage first, each with the date its source last changed in git. */
function sitemap(): AstroIntegration {
  return {
    name: "folio-sitemap",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const pages = (await readdir(dir))
          .filter((p) => p.endsWith(".html") && p !== "404.html")
          .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
        const urls = await Promise.all(
          pages.map(async (p) => {
            const loc = SITE_URL + (p === "index.html" ? "" : p);
            const lastmod = await gitDate(`src/pages/${p.replace(/\.html$/, ".astro")}`);
            return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
          }),
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
        await writeFile(new URL("sitemap.xml", dir), xml);
      },
    },
  };
}

export default defineConfig({
  site: "https://seven-leven.github.io",
  base: "/folio",
  // sem1.html, not sem1/index.html: the addresses the site has always had
  build: { format: "file" },
  trailingSlash: "ignore",
  // Keep the pages' own formatting; the HTML is small and GitHub Pages compresses it anyway
  compressHTML: false,
  outDir: fileURLToPath(new URL("./dist/", import.meta.url)),
  server: { port: 8000 },
  devToolbar: { enabled: false },
  integrations: [devRootRedirect(), sitemap(), responsiveImages(), cacheBust()],
});
