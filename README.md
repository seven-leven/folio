# Folio

Portfolio of **Gaahis Yaugoob**, architectural designer and civil engineer:
architecture studio projects, engineering work, professional work across the
Maldives, and personal projects in illustration and code.

**Live:** https://seven-leven.github.io/folio/ · **Changes:** [CHANGELOG.md](CHANGELOG.md)

## Structure

```
folio/
├── src/                       ← pages and components; Astro builds them into dist/
│   ├── pages/                 one .astro file per page (index, sem1 … sem5, engineering,
│   │                          the code-*.html entry pages, 404), each built to <name>.html
│   ├── layouts/BaseLayout.astro  every page's <head> and <body>: title, description, sharing tags, fonts
│   ├── components/            Navbar, Footer, Model (the 3D viewer); see "Shared navbar and footer"
│   ├── lib/site.ts            what they read at build time: projects, version, model sizes
│   ├── lib/live.ts            data fetched at build time: the Tumblr journal, Wildlife progress
│   ├── integrations/          after-build steps: responsive images, cache busting
│   └── data/projects.json     the architecture projects, in order
├── public/                    ← copied into dist/ as it is
│   ├── cv.pdf
│   └── assets/
│       ├── css/main.css       shared styles (see "Styles" below)
│       ├── css/pages/*.css    per-page styles (each project keeps its own look)
│       ├── js/main.js         shared behaviour (see below)
│       ├── js/coding/         the Coding timeline's animations, one module each
│       ├── data/              JSON data for those animations
│       ├── img/               favicon, homepage covers, Maldives map
│       └── projects/<page>/   images for each project page
├── tools/                     checks and helpers (see "Tasks")
│   └── data/                  scripts that regenerate public/assets/data/
├── astro.config.ts            base path /folio, file-style addresses, the sitemap, cache busting
├── version.json               major.minor of the site version
├── CHANGELOG.md
├── package.json               tasks (npm run …) and dependencies
└── biome.json                 formatting and lint settings
```

Page URLs (`/folio/sem1.html` etc.) are stable. `dist/` is build output and is
never committed.

## Tasks

Requires [Node.js](https://nodejs.org) 24 (see `.nvmrc`); run `npm install` once. The browser-based
tasks need Chrome (or set `CHROME_PATH`). Arguments go after `--`, as in `npm run snapshot -- before`.

| Task | What it does |
|---|---|
| `npm run dev` | Astro's dev server at http://localhost:8000/folio/, reloading on every save |
| `npm run build` | build `dist/` once |
| `npm run check` | build, then check links, images, anchors, alt text, metadata, image rules and the project list; lists remaining placeholders |
| `npm run snapshot -- <name>` | record every page at 375/820/1280 px (styles, boxes, screenshots) into `.snapshots/<name>/` |
| `npm run compare -- <a> <b>` | diff two snapshots: take one before a change and one after |
| `npm run fonts` | download the site's fonts from Google Fonts into `public/assets/fonts/` and rewrite `fonts.css` (after adding a family or weight) |
| `npm run images -- <path>…` | convert images to WebP, at most 2400 px on the long side |
| `npm run links` | check every external link on the site |
| `npm run version` | print the current version |
| `npm run changelog` | add commits since the last changelog edit under _Unreleased_ |
| `npm run distdiff -- <a> <b>` | compare two builds file by file (`--html` compares pages after normalising them) |
| `npm run release` | check, merge dev into main, push, and wait for the deploy |

`npm run lint` and `npm run fmt` (Biome) cover `tools/`, `src/**/*.ts`, `astro.config.ts` and
`public/assets/js/`.

## Working on the site

1. Work on `dev`. Before a big visual change, `npm run snapshot -- before`; afterwards,
   `npm run snapshot -- after` and `npm run compare -- before after`.
2. Commit. Every push runs formatting, lint and the check in CI.
3. `npm run release` when it's ready. CI builds `main`, checks it again and
   hands `dist/` to GitHub Pages as an artifact (Pages source: GitHub Actions).
   Nothing is committed to a branch for the site.

A monthly workflow (`links.yml`) checks external links and emails you if one
breaks.

### Versioning

The version at the bottom of every page is `vMAJOR.MINOR.PATCH`. Major and
minor are set by hand in `version.json`; the patch is the commit count, worked
out at build time (CI fetches the full history for this). For a notable
release, bump the minor and add a section to `CHANGELOG.md`; `npm run
changelog` collects the commits since the last entry to start from.

## Shared navbar and footer

The navbar, footer and 3D model viewer are Astro components in `src/components/`.
A page passes its own file name to the ones that need it:

```astro
<Navbar page="sem1.html" active="architecture" />   <!-- highlights Academic › Architecture -->
<Model page="sem1.html" />                          <!-- the page's "model" from projects.json -->
<Footer />
```

`active` takes a nav link name (`home`, `architecture`, `engineering`,
`professional`, `illustrations`, `coding`, `about`, `contact`) or can be left
off. Links inside a dropdown group (Academic: architecture, engineering;
Personal: illustrations, coding) also highlight the group. On the homepage the
navbar links to its own sections; on other pages it links to `index.html#…`.

The footer shows the site version and lists the architecture projects from
`src/data/projects.json`; the previous/next links on project pages read that list.
The build also writes `sitemap.xml`, with each page's last-changed date from git
(`astro.config.ts`).

After the build, every local CSS and JS reference gets `?v=<hash of the file>`
(`src/integrations/cache-bust.ts`), so a deploy is seen at once instead of after
GitHub Pages' 10-minute browser cache. Scripts that import other scripts get an
import map from each module's plain address to its stamped one. Write plain paths
in pages and scripts; the build adds the stamps.

Images: every local `.webp` wider than 640 px gets 640/1024/1600 px copies at build
time and a `srcset` (`src/integrations/responsive-images.ts`), so phones download a
smaller file. The copies are cached in `.cache/`. Keep adding images as single WebP
files at up to 2400 px; the lightbox still opens the full-size file.

Fonts are served from the site (`public/assets/fonts/`, written by `npm run fonts`
from Google Fonts' own files), not from Google.

Live data is read when the site is built, and the site is rebuilt every day:
the process journal on the Semester 5 and 6 pages (`<TumblrFeed blog="gaahis" />`,
from the blog's RSS feed) and the Wildlife Illustrated numbers and latest drawings
on the homepage (from bird_dash's JSON). If the journal can't be read the page says
so and links to the blog; if bird_dash can't be read the build fails, and the live
site keeps yesterday's numbers.

`404.html` keeps its own minimal navbar and footer because GitHub Pages serves
it at any URL. The build fails on an unknown `active` name, a `<Model>` on a page
without a "model" entry, or a model file that isn't there yet.

Pages are the site's original HTML in `.astro` files: scripts carry `is:inline`
so Astro leaves them alone, and a `{` or `}` in text is written `&#123;` or `&#125;`
(Astro reads braces as code).

## The homepage

It's organised as **01 Academic** (`#engineering`, then `#architecture` with
the studio projects in date order), **02 Professional** (map
of projects per atoll) and **03 Personal** (Illustrations, Coding). Old anchors
(`#projects`, `#wildlife`, `#engineering-work`) still work as aliases.

The Professional map counts projects per atoll from the work project register.
`tools/data/professional.py` writes the counts, the Greater Malé breakdown (by
ward and Hulhumalé phase) and the stats into `index.html`; see
`tools/data/README.md`. The base map, `public/assets/img/maldives-map.svg`, is
[Maldives location map](https://commons.wikimedia.org/wiki/File:Maldives_location_map.svg)
by Ziansh (Wikimedia Commons, CC BY-SA 3.0), credited under the map on the page.

### The Coding timeline

Three featured entries (`<ol class="code-tl">`), then the full story, oldest
first and split by `tl-chapter` headings, inside `<details class="code-more">`
(closed by default). Add an entry as another `<li class="tl-item">` in date
order, and update the count in its summary. Each entry's animation is a
`<canvas data-vis="name">`:

1. Write `public/assets/js/coding/visuals/<name>.js`, whose default export is
   `factory(canvas, data) => { draw(t), still }` (see the others, and the
   helpers in `core.js`).
2. Register it in `public/assets/js/coding/index.js`.
3. If it needs data, export `data` (a URL to `public/assets/data/<name>.json`) and
   add a script in `tools/data/` that produces it; see `tools/data/README.md`.

Animations are only created near the screen, only animate while on screen, and
show a single still frame when the viewer prefers reduced motion.

## Styles

The design rules, for the site and the printed book, are in [DESIGN.md](DESIGN.md).

`main.css` is the single source for colour, type and scales, and starts with a
numbered contents list:

- **Tokens**: a palette (`--ink`, `--paper`, `--accent`…), semantic roles
  (`--text`, `--text-muted`, `--rule`, `--accent-text`…) that components use, the
  six semester colours, six font families, and the type, space and corner scales.
  Dark areas (the Personal band, footer, CV card) just redefine the roles.
- **Voices**: the small palette and typeface each project page adds (Semester 4,
  Semester 5, Engineering), all declared in one block.
- **The project page kit (`.pk`)**: the shared hero, chapter nav, numbered chapters,
  figures, grids, tiles and quote. Semesters 1 to 3 are built from it alone.
- **Shared devices**: the six-segment progress bar (`.sem-bar`) and the semester's bird
  behind the page title (`.sem-bird`, from `assets/img/birds/`). `npm run guide` redraws
  the one-sheet guide, `docs/design-guide.png`.

Page stylesheets in `assets/css/pages/` hold layout particular to that page and
nothing else: no colour values, font names or pixel radii.

## Adding a project page

1. Put its images in `public/assets/projects/<name>/`; `npm run images` makes
   them WebP at most 2400 px, and the check rejects anything else.
2. Copy `src/pages/sem3.astro`, which is built from the project page kit alone. In its
   `<BaseLayout>` give it the page name, title, description, preview `image`, its
   `styles` and a body class (`project-<name>`); the layout writes the `<head>`
   (canonical address, sharing tags, fonts) and the build fails without a title or
   description. Map the body class to its semester colour at the top of `main.css`.
   DESIGN.md shows the kit's markup.
3. Put anything particular to the page in `public/assets/css/pages/<name>.css`, and
   the semester's bird in `public/assets/img/birds/semN.webp`.
4. Add it to `src/data/projects.json` (footer, previous/next links and the
   sitemap follow) and give it a row on the homepage; the check fails if the
   row is missing.
5. Run `npm run check`.

## What `main.js` does

- Navbar: shadow on scroll, mobile menu, dropdowns, section highlighting.
- Reveal-on-scroll animations (respects reduced motion).
- Project pages: full-screen image viewer (keys, swipe, zoom), reading
  progress bar, previous/next project links, missing images hidden.
- Contact form: opens the visitor's mail app with the message filled in.
- Live data, with the latest known values built into the HTML as a fallback:
  - **Tumblr process journal** on `sem5.html`, from the public Tumblr API.
    Only text and image URLs are used; no Tumblr HTML is inserted.
  - **Wildlife Illustrated** progress on the homepage, from
    [bird_dash](https://github.com/seven-leven/bird_dash)'s own JSON files.

## History

- `vue-rewrite-archive` tag: an abandoned Deno + Vite + Vue rewrite, kept for
  reference.
- The original hand-built site's history is merged into `main`.

## License

All rights reserved. See [LICENSE](LICENSE).
