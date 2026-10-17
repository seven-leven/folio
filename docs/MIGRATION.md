# Moving the folio from Deno to Node and Astro

Plan, 17 October 2026. The site is `seven-leven/folio`, live at https://seven-leven.github.io/folio/.
The class book's web edition made the Node half of this move on 16 October
(`Desktop/Book/guides/WEB_MIGRATION_NODE.md`); this plan follows the same method.

Progress is recorded in part 7 as each pull request merges. Problems found on the way go to the
folio checklist (`Base1/Code/Folio Website/contents.md`, "Migration follow-ups"), not into the pull
requests, so each one stays the size it was planned at.

## 1. Where it starts and where it ends

**Today.** `site/` holds twelve hand-written HTML pages (375 kB), shared CSS and browser JavaScript,
and 27 MB of assets. `tools/build.ts` (Deno, 250 lines) copies `site/` into `dist/`, replaces
`<!-- @include navbar|footer|model -->` comments with `site/_partials/*.html`, fills `{{placeholders}}`
(the version, the footer's project list from `site/_data/projects.json`, the 3D model's file sizes),
and writes `sitemap.xml` with each page's last-changed date from git. Eleven more Deno tools check,
snapshot, compare, convert images, make 3D models and release. CI runs `deno fmt`, `deno lint` and
`deno task check`, then deploys `dist/` to GitHub Pages.

**At the end.** Node 24 and npm run everything. Astro builds the site: pages are `.astro` files in
`src/pages/`, the navbar, footer and model viewer are Astro components, and the static files are in
`public/`. Every address stays the same (`/folio/sem1.html` and so on), and the pages look and work
exactly as before. The checks, snapshots and release flow keep working on `dist/`.

**Why Astro.** The custom build is a small template engine (includes, placeholders, an `active`
attribute that rewrites links). Astro is that, maintained by someone else, with components, typed
data and a dev server that reloads. It is also what the class book uses, so one way of working
covers both sites.

What does **not** change: the page designs and text, `site/assets/js/` (still plain browser modules,
loaded as files, not bundled), the three.js vendor files, the Python in `tools/data/` and
`tools/models/`, the page addresses, and GitHub Pages as the host.

## 2. Decisions

| Question | Decision | Why |
|---|---|---|
| Which Node | **Node 24**, in `.nvmrc` and `package.json` `engines` | Current LTS; this computer has 24.18 with npm 11.16; same as the class book |
| Package manager | **npm** | Ships with Node; one line to cache in CI |
| Tools in TypeScript? | **Yes, run with plain `node`** | Node 24 strips types itself. Tested here: type imports, top-level await and `import.meta.main` run with no flags. The tools use no enums, namespaces or parameter properties, the one thing Node can't strip |
| Static server | **`tools/serve.ts`**, about 50 lines on `node:http` | Replaces `@std/http`'s `serveDir` for the snapshots (and the dev server until Astro takes over): `dist/` under `/folio/`, `404.html` for anything missing |
| Formatter and linter | **Biome** | One tool for what `deno fmt` and `deno lint` did. Its formatting differs a little, so it gets a formatting-only pull request |
| Astro version | **Astro 5**, latest 5.x | The version the class book runs |
| Page addresses | **`build.format: "file"`**, `base: "/folio"` | Astro then writes `sem1.html`, not `sem1/index.html`, so no address changes |
| Page scripts and styles | **`is:inline` on every `<script>` and `<style>`** | Astro would otherwise bundle and rename them. The site's scripts are plain modules that load each other by path, and should stay that way |
| HTML output | **`compressHTML: false`** | Keeps the output close to today's, so the two builds can be compared |
| Static files | **`public/`** (from `site/assets/`, `site/cv.pdf`) | Astro copies them as they are |
| Braces in page text | **Written as `&#123;` / `&#125;`** | In `.astro` files `{` starts an expression. Code samples on the Coding pages contain braces; the entity shows the same character |
| Same package versions | **`puppeteer-core` 23, `sharp` 0.33** for the switch | So the Node build can be compared with the Deno build file by file; upgrades come afterwards |

## 3. The pull requests

Five pull requests into `main`, one at a time: each is checked (part 4), merged, and the live site
looked at before the next one starts. Merging to `main` deploys.

| # | Pull request | What changes | The site |
|---|---|---|---|
| 1 | **Migration plan** | This file | Unchanged |
| 2 | **Tools on Node** | `package.json`, `package-lock.json`, `.nvmrc`; `deno.json` and `deno.lock` removed; the eleven tools and `models/model.ts` ported (part 5); `tools/serve.ts`; `tools/distdiff.ts`; the three workflows on `setup-node`; Biome for linting; `.claude/launch.json`; README, DESIGN and docs say `npm run` | Byte-identical `dist/` |
| 3 | **Format with Biome** | Every file in `tools/` and `site/assets/js/` reformatted, nothing else; CI checks formatting again | Same pages; the scripts differ in whitespace only |
| 4 | **Build with Astro** | `site/assets` and `site/cv.pdf` to `public/`; each page to `src/pages/<page>.astro` (part 6); the include comments become `<Navbar>`, `<Footer>`, `<Model>` components, which for now render the old partials with the old rules; `site/_data/projects.json` to `src/data/`; version and sitemap from an Astro integration; `tools/build.ts` removed; `npm run dev` is `astro dev`; paths in `check.ts`, `model.ts` and the Python data scripts updated | Same pages (part 4, HTML compared after normalising) |
| 5 | **Astro components** | The navbar, footer and model viewer written as Astro markup with props, replacing the string templates and the `_partials/` files; README structure and CHANGELOG | Same pages |

## 4. How each pull request is checked

1. **A reference build** from `main` before the branch starts: `dist/` copied to `dist-ref/` (ignored
   by git). Before pull request 2 that is `deno task build`; after it, `npm run build`.
2. **Compare the builds** with `npm run distdiff -- dist-ref dist`. It reports files added, removed and
   changed; with `--html` it compares pages after normalising them (whitespace collapsed, attributes
   sorted, comments and character references resolved), so only real differences show.
   - Pull requests 2 and 3: no differences at all, apart from the formatting of the JavaScript in 3.
   - Pull requests 4 and 5: no differences with `--html`, and every other file identical.
   - The version (commit count) and sitemap dates come from git: build both at the same commit, or
     expect those two to differ.
3. **`npm run check`** passes with the same counts as before.
4. **Snapshots** for 4 and 5: `npm run snapshot -- before` on the reference, `npm run snapshot -- after`
   on the branch, `npm run compare -- before after`: every page at three widths, computed styles and
   boxes. No differences expected.
5. **By hand** for 4 and 5: `npm run dev`, then the homepage (map, coding timeline animations), one
   semester page with a 3D model (load it), the engineering page and one Coding page.
6. **CI** passes on the pull request before it is merged.
7. **After merging:** the deploy succeeds and the live homepage and one project page look right.

## 5. Deno to Node, call by call (pull request 2)

| Deno | Node |
|---|---|
| `Deno.readTextFile` (14), `Deno.writeTextFile` (6), `readFile`, `writeFile` | `node:fs/promises` (with `"utf8"` for text); they take `URL`s, so `new URL("…", SITE)` keeps working |
| `Deno.readDir` (9), `readDirSync` | `readdir(dir, { withFileTypes: true })`: `isFile()` and `isDirectory()` are methods |
| `Deno.stat` (7), `statSync` | `stat`, `statSync` |
| `mkdir`, `remove`, `copyFile`, `makeTempDir` | `mkdir`, `rm(…, { recursive: true, force: true })`, `copyFile`, `mkdtemp(join(tmpdir(), …))` |
| `Deno.exit` (13), `Deno.args` (8), `Deno.env.get` | `process.exit`, `process.argv.slice(2)`, `process.env` |
| `new Deno.Command(…).output()` (6) | `spawn` from `node:child_process`, collecting stdout, or `stdio: "inherit"` |
| `Deno.serve` + `serveDir` (2) | `tools/serve.ts` |
| `Deno.listen` probe, `Deno.errors.AddrInUse` | The server's `error` event with `EADDRINUSE` |
| `Deno.watchFs` | `watch(dir, { recursive: true })` from `node:fs` |
| `fromFileUrl`, `join` (`@std/path`) | `fileURLToPath` (`node:url`), `join` (`node:path`) |
| `import.meta.main` | Unchanged (Node 24) |

`package.json` scripts keep today's task names: `dev`, `build`, `check`, `snapshot`, `compare`,
`version`, `changelog`, `guide`, `images`, `model`, `links`, `release`, plus `lint`, `fmt`,
`fmt:check` and `distdiff`. Arguments go after `--` (`npm run snapshot -- before`).

## 6. A page in Astro (pull request 4)

Each `site/<page>.html` becomes `src/pages/<page>.astro`, converted once by a script and then edited
by hand from there on:

- A frontmatter block importing the components it uses.
- `<!-- @include navbar active="coding" -->` becomes `<Navbar page="code-mancala.html" active="coding" />`;
  `footer` and `model` likewise.
- `is:inline` added to every `<script>` and `<style>`.
- `{` and `}` in text written as `&#123;` and `&#125;`.
- Everything else is the page as it was.

`astro.config.mjs`: `site: "https://seven-leven.github.io"`, `base: "/folio"`,
`build: { format: "file" }`, `compressHTML: false`, `outDir: "dist"`, `trailingSlash: "ignore"`, and a
small integration that writes `sitemap.xml` with git dates after the build (as `build.ts` did).
The 3D model's download sizes are measured when the component renders, and a page whose model file
doesn't exist yet fails the build unless `FOLIO_LENIENT=1` is set (what `npm run model` does).

## 7. Progress

| # | Pull request | State |
|---|---|---|
| 1 | Migration plan | Merged 17 Oct (#26) |
| 2 | Tools on Node | Merged 17 Oct (#27) |
| 3 | Format with Biome | This pull request |
| 4 | Build with Astro | |
| 5 | Astro components | |

## 8. If it goes wrong

- **Before merging:** nothing has changed on the live site; fix the branch or close it.
- **After merging:** revert that pull request on GitHub; the next deploy publishes the previous
  build. No address changes in any of the five, so no link can break.

## 9. After the move (separate work)

- Upgrade `puppeteer-core` and `sharp`, and run `npm audit`.
- Add a type check (`tsc --noEmit` or `astro check`) to CI: Node runs TypeScript without checking it.
- Use Astro for what the old build couldn't do: page data in typed collections, shared page
  heads, the coding timeline entries from data.
- Uninstall Deno once nothing else uses it.
