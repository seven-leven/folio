# Folio

Personal portfolio — architecture &amp; engineering work, coding projects, and art.

Built with **Deno · Vite · Vue 3 · Tailwind CSS**.

## Stack

| Concern        | Choice                                      |
| -------------- | ------------------------------------------- |
| Runtime / PM   | [Deno](https://deno.com) (`npm:` specifiers) |
| Build / dev    | [Vite](https://vite.dev)                    |
| UI             | [Vue 3](https://vuejs.org) (`<script setup>`) + Vue Router (hash mode) |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com) (`@tailwindcss/vite`) |
| Hosting        | GitHub Pages (`gh-pages` branch)            |

## Getting started

```sh
deno task dev       # start the dev server (Vite)
deno task build     # production build → dist/
deno task preview   # preview the production build
```

## Project structure

```
index.html            # Vite entry
vite.config.ts        # Vite + Vue + Tailwind config
deno.json             # tasks + npm imports
src/
  main.ts             # app bootstrap + router
  router.ts           # routes
  App.vue             # shell (navbar + view + footer)
  components/         # reusable UI (ImageCard, Navbar, ...)
  pages/             # Home / Architecture / Coding / Misc / NotFound
  data/              # single source of truth for all content
  styles/main.css     # Tailwind entry + design tokens
  utils/             # helpers
public/assets/        # PNG images (served as ./assets/*)
```

## Editing content

All content lives in `src/data/`. Add a project by adding an entry — no
component edits needed:

- `data/home.ts` — bio, work, education
- `data/architecture.ts` — designs, trips, precedents, thesis, …
- `data/coding.ts` — coding projects
- `data/misc.ts` — art / making / drawings
- `data/socials.ts` — contact & social links

Each item has a `status` (`done` | `wip` | `planned`); non-`done` items show a
badge, and items without a `link` render as non-clickable cards.

## Deployment

Work happens on **`dev`**. Pushing to **`main`** triggers the GitHub Actions
workflow, which builds and publishes `dist/` to the **`gh-pages`** branch.

## License

Content and code are licensed under **CC BY-NC 4.0** — see [LICENSE](./LICENSE).
