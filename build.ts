import { build, stop } from "https://deno.land/x/esbuild@v0.25.0/mod.js";
import { copy, ensureDir } from "jsr:@std/fs";

await ensureDir("build");

await build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "build/bundle.js",
  jsx: "automatic",
  sourcemap: true,
  target: "es2020",
  format: "esm",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  external: ["react", "react-dom", "react-router-dom", "react-icons/fi"],
});

await copy("public", "build", { overwrite: true });

console.log("Build completed. Files moved to 'build/'.");
stop();
