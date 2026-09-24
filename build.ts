import * as esbuild from "https://deno.land/x/esbuild@v0.25.0/mod.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.11.1";
import { copy, ensureDir } from "jsr:@std/fs";
import { dirname, fromFileUrl, resolve } from "jsr:@std/path";

// The Deno loader can't parse CSS, so intercept .css imports and hand them to
// esbuild's native CSS / CSS-modules loaders instead.
// Safety net: if any dependency still references a `node:` builtin, stub it so
// it never reaches the browser (nothing here needs a real Node runtime).
const nodeStubPlugin: esbuild.Plugin = {
  name: "node-stub",
  setup(build) {
    build.onResolve({ filter: /^node:/ }, (args) => ({
      path: args.path,
      namespace: "node-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "node-stub" }, () => ({
      contents: "export default {}; export const env = {};",
      loader: "js",
    }));
  },
};

const cssPlugin: esbuild.Plugin = {
  name: "css-modules",
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, (args) => {
      let base = args.resolveDir;
      if ((!base || base.length === 0) && args.importer) {
        base = args.importer.startsWith("file://")
          ? dirname(fromFileUrl(args.importer))
          : dirname(args.importer);
      }
      return { path: resolve(base, args.path), namespace: "css-file" };
    });
    build.onLoad({ filter: /.*/, namespace: "css-file" }, async (args) => {
      return {
        contents: await Deno.readTextFile(args.path),
        loader: args.path.endsWith(".module.css") ? "local-css" : "css",
        resolveDir: dirname(args.path),
      };
    });
  },
};

await ensureDir("build");

await esbuild.build({
  // Resolve react/react-dom/etc. through deno.json and BUNDLE them into the
  // output — a single, self-contained React instance. This replaces the old
  // runtime esm.sh import map, which broke when esm.sh silently changed the
  // module it served (blank page, "useRef of null").
  plugins: [nodeStubPlugin, cssPlugin, ...denoPlugins({ configPath: resolve("deno.json") })],
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "build/bundle.js",
  jsx: "automatic",
  jsxImportSource: "react",
  sourcemap: true,
  target: "esnext",
  format: "esm",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
});

await copy("public", "build", { overwrite: true });

console.log("Build completed. Files moved to 'build/'.");
esbuild.stop();
