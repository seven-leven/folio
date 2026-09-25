# Folio

Portfolio of **Gaahis Yaugoob**, architectural designer and civil engineer:
five architecture studio projects, engineering work, and an ongoing project to
draw every bird of the Maldives.

**Live:** https://seven-leven.github.io/folio/

## Structure

```
folio/
├── site/                     ← everything that gets published
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
├── tools/check.ts            site checker, run locally and in CI
├── .github/workflows/        check on every push, deploy from main
└── deno.json                 tasks
```

Page URLs (`/folio/sem1.html` etc.) are stable. Only assets live under
`assets/`.

## Working locally

Requires [Deno](https://deno.com) 2.x.

```sh
deno task serve   # http://localhost:8000
deno task check   # broken links/images/anchors, alt text, page metadata
```

## Deploying

1. Work on `dev`. Every push runs the checker.
2. Merge `dev` into `main` and push.
3. CI runs the checker, then publishes `site/` to the `gh-pages` branch as a
   fresh commit. GitHub Pages serves that branch.

`gh-pages` is a build artifact, so never commit to it directly. A failing check
blocks the deploy.

## Adding a project page

1. Put its images in `site/assets/projects/<name>/` as WebP, at most 2400 px on
   the long side, with lowercase-dashed file names.
2. Copy an existing page (such as `sem5.html`) for the navbar, footer and
   `<head>`; give it a `<title>`, meta description, canonical URL and
   `og:image`.
3. Put page-specific styles in `site/assets/css/pages/<name>.css`.
4. Add it to the homepage project list, the footer links on every page,
   `PROJECTS` in `main.js` (previous/next links), and `sitemap.xml`.
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
