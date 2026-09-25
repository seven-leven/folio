# Folio

Portfolio of **Gaahis Yaugoob**, architectural designer and civil engineer:
five architecture studio projects, engineering work, and an ongoing project to
draw every bird of the Maldives.

**Live:** https://seven-leven.github.io/folio/

## Structure

```
folio/
├── site/                     ← source; built into dist/ and published
│   ├── _partials/            shared navbar.html and footer.html (not published)
│   ├── index.html            homepage
│   ├── sem1.html … sem5.html architecture studio projects
│   ├── engineering.html      capstone, wind-load thesis, coastal study
│   ├── 404.html              served by GitHub Pages for missing paths
│   ├── sitemap.xml
│   ├── cv.pdf
│   └── assets/
│       ├── css/main.css      shared styles (nav, footer, homepage, viewer)
│       ├── css/pages/*.css   per-page styles (each project keeps its own look)
│       ├── js/main.js        shared behaviour (see below)
│       ├── img/              favicon and homepage covers
│       └── projects/<page>/  images for each project page
├── tools/build.ts            site/ → dist/, stamping in the partials
├── tools/check.ts            checker for dist/, run locally and in CI
├── .github/workflows/        check on every push, deploy from main
└── deno.json                 tasks
```

Page URLs (`/folio/sem1.html` etc.) are stable. Only assets live under
`assets/`. `dist/` is build output and is not committed.

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

The homepage is organised as **01 Academic** (Architecture, Engineering),
**02 Professional** (map of projects per atoll) and **03 Personal**
(Illustrations, Coding). Old anchors (`#projects`, `#wildlife`,
`#engineering-work`) still work as aliases.

The Professional map is a placeholder. The base map,
`site/assets/img/maldives-map.svg`, is
[Maldives location map](https://commons.wikimedia.org/wiki/File:Maldives_location_map.svg)
by Ziansh (Wikimedia Commons, CC BY-SA 3.0), credited under the map on the page.
The arrows and `xx` counts are inline SVG in `index.html` (each
`<g class="pm-marker" data-atoll="…">`). Replace `xx` in both the map markers
and the list beside it.

The Coding section is a timeline (`<ol class="code-tl">`, oldest first). Add an
entry as another `<li class="tl-item">` in date order; the dashed
`tl-item--gap` entry marks the 2022–2024 stretch still to be written up.
`404.html` keeps its own minimal navbar and footer because GitHub Pages serves
it at any URL. The build fails on an unknown partial, an unknown `active` name,
or an include that isn't alone on its line.

## Working locally

Requires [Deno](https://deno.com) 2.x.

```sh
deno task dev     # build, watch site/, serve at http://localhost:8000/folio/
deno task build   # build dist/ once
deno task check   # build, then check links/images/anchors, alt text, metadata
```

`deno task dev` mirrors GitHub Pages: the site lives under `/folio/` and
missing paths get `404.html`.

## Deploying

1. Work on `dev`. Every push runs the build and checker.
2. Merge `dev` into `main` and push.
3. CI builds and checks, then publishes `dist/` to the `gh-pages` branch as a
   fresh commit. GitHub Pages serves that branch.

`gh-pages` is a build artifact, so never commit to it directly. A failing check
blocks the deploy.

## Adding a project page

1. Put its images in `site/assets/projects/<name>/` as WebP, at most 2400 px on
   the long side, with lowercase-dashed file names.
2. Copy an existing page (such as `sem5.html`) for the `<head>` and the
   `@include` lines; give it a `<title>`, meta description, canonical URL and
   `og:image`.
3. Put page-specific styles in `site/assets/css/pages/<name>.css`.
4. Add it to the homepage project list, the footer's project list in
   `site/_partials/footer.html` (once, for every page), `PROJECTS` in
   `main.js` (previous/next links), and `sitemap.xml`.
5. Run `deno task check`.

## What `main.js` does

- Navbar: shadow on scroll, mobile menu, section highlighting.
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
