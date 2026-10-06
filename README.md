# Folio

Portfolio of **Gaahis Yaugoob**, architectural designer and civil engineer:
architecture studio projects, engineering work, professional work across the
Maldives, and personal projects in illustration and code.

**Live:** https://seven-leven.github.io/folio/ · **Changes:** [CHANGELOG.md](CHANGELOG.md)

## Structure

```
folio/
├── site/                      ← source; built into dist/ and published
│   ├── _partials/             shared navbar.html and footer.html (not published)
│   ├── _data/projects.json    the architecture projects, in order (not published)
│   ├── index.html             homepage
│   ├── sem1.html … sem5.html  architecture studio projects
│   ├── engineering.html       capstone, wind-load thesis, coastal study
│   ├── 404.html               served by GitHub Pages for missing paths
│   ├── cv.pdf
│   └── assets/
│       ├── css/main.css       shared styles (see "Styles" below)
│       ├── css/pages/*.css    per-page styles (each project keeps its own look)
│       ├── js/main.js         shared behaviour (see below)
│       ├── js/coding/         the Coding timeline's animations, one module each
│       ├── data/              JSON data for those animations
│       ├── img/               favicon, homepage covers, Maldives map
│       └── projects/<page>/   images for each project page
├── tools/                     build, checks and helpers (see "Tasks")
│   └── data/                  scripts that regenerate site/assets/data/
├── version.json               major.minor of the site version
├── CHANGELOG.md
└── deno.json                  tasks, formatting and lint settings
```

Page URLs (`/folio/sem1.html` etc.) are stable. `dist/` is build output and is
never committed.

## Tasks

Requires [Deno](https://deno.com) 2.x. The browser-based tasks need Chrome
(or set `CHROME_PATH`).

| Task | What it does |
|---|---|
| `deno task dev` | build, watch `site/`, serve at http://localhost:8000/folio/ |
| `deno task build` | build `dist/` once |
| `deno task check` | build, then check links, images, anchors, alt text, metadata, image rules and the project list; lists remaining placeholders |
| `deno task snapshot <name>` | record every page at 375/820/1280 px (styles, boxes, screenshots) into `.snapshots/<name>/` |
| `deno task compare <a> <b>` | diff two snapshots: take one before a change and one after |
| `deno task images <path>…` | convert images to WebP, at most 2400 px on the long side |
| `deno task links` | check every external link on the site |
| `deno task version` | print the current version |
| `deno task changelog` | add commits since the last changelog edit under _Unreleased_ |
| `deno task release` | check, merge dev into main, push, and wait for the deploy |

`deno fmt` and `deno lint` cover `tools/` and `site/assets/js/`.

## Working on the site

1. Work on `dev`. Before a big visual change, `deno task snapshot before`; afterwards,
   `deno task snapshot after` and `deno task compare before after`.
2. Commit. Every push runs formatting, lint and the check in CI.
3. `deno task release` when it's ready. CI builds `main`, checks it again and
   publishes `dist/` to the `gh-pages` branch as a fresh commit, which GitHub
   Pages serves. `gh-pages` is a build artifact: never commit to it.

A monthly workflow (`links.yml`) checks external links and emails you if one
breaks.

### Versioning

The version at the bottom of every page is `vMAJOR.MINOR.PATCH`. Major and
minor are set by hand in `version.json`; the patch is the commit count, worked
out at build time (CI fetches the full history for this). For a notable
release, bump the minor and add a section to `CHANGELOG.md`; `deno task
changelog` collects the commits since the last entry to start from.

## Shared navbar and footer

The navbar and footer live once, in `site/_partials/`. Pages include them with
a comment on its own line:

```html
<!-- @include navbar active="architecture" -->   <!-- highlights Academic › Architecture -->
<!-- @include footer -->
```

`active` takes a nav link name (`home`, `architecture`, `engineering`,
`professional`, `illustrations`, `coding`, `about`, `contact`) or can be left
off. Links inside a dropdown group (Academic: architecture, engineering;
Personal: illustrations, coding) also highlight the group. On the homepage the
navbar links to its own sections; on other pages it links to `index.html#…`.

Partials can use placeholders: `{{version}}`, and `{{projectLinks}}` (the
footer's list of architecture projects, from `site/_data/projects.json`). The
previous/next links on project pages read that footer list. The build also
writes `sitemap.xml`, with each page's last-changed date from git.

`404.html` keeps its own minimal navbar and footer because GitHub Pages serves
it at any URL. The build fails on an unknown partial, an unknown `active` name,
an unfilled placeholder, or an include that isn't alone on its line.

## The homepage

It's organised as **01 Academic** (`#engineering`, then `#architecture` with
the studio projects in date order), **02 Professional** (map
of projects per atoll) and **03 Personal** (Illustrations, Coding). Old anchors
(`#projects`, `#wildlife`, `#engineering-work`) still work as aliases.

The Professional map counts projects per atoll from the work project register.
`tools/data/professional.py` writes the counts, the Greater Malé breakdown (by
ward and Hulhumalé phase) and the stats into `index.html`; see
`tools/data/README.md`. The base map, `site/assets/img/maldives-map.svg`, is
[Maldives location map](https://commons.wikimedia.org/wiki/File:Maldives_location_map.svg)
by Ziansh (Wikimedia Commons, CC BY-SA 3.0), credited under the map on the page.

### The Coding timeline

Three featured entries (`<ol class="code-tl">`), then the full story, oldest
first and split by `tl-chapter` headings, inside `<details class="code-more">`
(closed by default). Add an entry as another `<li class="tl-item">` in date
order, and update the count in its summary. Each entry's animation is a
`<canvas data-vis="name">`:

1. Write `site/assets/js/coding/visuals/<name>.js`, whose default export is
   `factory(canvas, data) => { draw(t), still }` (see the others, and the
   helpers in `core.js`).
2. Register it in `site/assets/js/coding/index.js`.
3. If it needs data, export `data` (a URL to `site/assets/data/<name>.json`) and
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
  behind the page title (`.sem-bird`, from `assets/img/birds/`). `deno task guide` redraws
  the one-sheet guide, `docs/design-guide.png`.

Page stylesheets in `assets/css/pages/` hold layout particular to that page and
nothing else: no colour values, font names or pixel radii.

## Adding a project page

1. Put its images in `site/assets/projects/<name>/`; `deno task images` makes
   them WebP at most 2400 px, and the check rejects anything else.
2. Copy `sem3.html`, which is built from the project page kit alone; give it a
   `<title>`, meta description, canonical URL and `og:image`, a body class
   (`project-<name>`), and map that class to its semester colour at the top of
   `main.css`. DESIGN.md shows the kit's markup.
3. Put anything particular to the page in `site/assets/css/pages/<name>.css`, and
   the semester's bird in `site/assets/img/birds/semN.webp`.
4. Add it to `site/_data/projects.json` (footer, previous/next links and the
   sitemap follow) and give it a row on the homepage; the check fails if the
   row is missing.
5. Run `deno task check`.

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
