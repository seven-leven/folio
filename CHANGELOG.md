# Changelog

Versions are `vMAJOR.MINOR.PATCH`:

- `MAJOR.MINOR` is set by hand in `version.json`. Bump the minor for a notable release and give it a
  section here.
- `PATCH` is the commit count, worked out from git at build time, so it's never stored and can't
  drift. The live site shows the full version at the bottom of every page.

Print the current version with `deno task version`. To log new work, run `deno task changelog`: it
adds every commit made since this file was last changed under _Unreleased_, ready to tidy up and
commit.

---

## Unreleased

- Wildlife Illustrated page: why six birds went up in one day (0.4), and moving the interface into `Chrome.vue` (0.7)
- Wildlife Illustrated page: the deploy lesson (build first, publish only if it succeeds) added to versions 0.2 and 0.8; the icons, the design guide and the logo session added to 0.9; the size of `App.vue` over time and the search journey; the image pipeline, from an online converter to four steps; Tailwind in an afternoon; a week chasing a Lighthouse score; why the React version was abandoned for Vue; the size of the stylesheet over time
- The Wildlife Illustrated page retold as an ongoing project: nine stretches of work in order, each with what was new to learn and the drawing count at the end
- A page of its own for the first coding project: how the Wildlife Illustrated site was built, from its changelog, with screenshots of three versions (`code-wildlife.html`)
- An ink page context (`page-ink`) so a Personal project can use the project page kit; version lists, code blocks and big-number rows for it
- One design system for the whole site, written down in DESIGN.md (with the audit that led to it in docs/design-audit.md): `main.css` now holds every colour, the six font families and the type, space and corner scales; each project page's own palette moved there too, as a named voice
- Semesters 1 to 3 rebuilt on a shared project page kit: the same kicker, serif title, fact tiles, lead image, chapter nav and numbered chapters as the newer pages, on the site's paper and type. Their words and drawings are unchanged; Montserrat, Oswald, Lato and a dead request for Helvetica Neue are gone
- The book's progress bar on every project page and in the previous/next pager
- Each semester's bird from the book, large and faint behind the title of its project page
- A one-sheet design guide (`docs/design-guide.png`, redrawn with `deno task guide`)
- The design system written up as v1.0: grid, motion speeds, component states, accessibility checks, do / don't
- Grid and motion are named tokens; buttons have pressed and disabled states
- A separate guide for Personal work on the same foundations (`docs/design-personal.md`), including the shape of a future page per coding entry
- Fixes: script-made buttons no longer fall back to 13 px Arial; images no longer grow on hover

- Section cut is movable and turns: Plan, Section A or Section B, a slider to move it through the model, and Flip for the other half. The camera turns to face the cut and frames what's left, a thin outline in the semester colour marks the plane, and only the model is cut (the ground and shadows follow it)

- 3D models for Semesters 2 (Blue Canvas) and 3 (Urban Acupuncture), with the viewer now shared by every project page: a `model` entry in `site/_data/projects.json` plus `<!-- @include model -->`, and `deno task model semN file.3dm` makes the model and its poster (Rhino, then Blender, then a headless screenshot)
- Viewer: a Clay mode (a white card model with ink edges; the default for models with only layer colours), views framed to each model's actual silhouette, and Inside aimed at the building rather than its site

- The Reading Nook's SketchUp model on its page, in a three.js viewer: turn, zoom and move around it, jump to outside, inside and top views, cut a section through it, go full screen, or download the .glb. three.js (vendored) loads only on request. Models are converted with `tools/models/`

- A colour for each architecture semester, matching the book (Ink, Ember, Mauve, Olive, Lagoon, Red): a page edge on its homepage row and project page, its label and number, its reading-progress bar, a dot in the footer, and the accents inside each project page
- Professional map filled in from the project register: 156 projects across 19 atolls and 33 islands, with Greater Malé broken down by ward and Hulhumalé phase (`tools/data/professional.py`)
- Engineering and Architecture are separate sections again, Engineering first
- Coding shows three featured projects; the full story is behind "See the full story"
- Removed the phone tap test (`deno task tap-test` and its CI step)

## v1.5 (Tooling & versioning) · 2026-09-25

- Automatic version number at the bottom of every page, and this changelog
- One project list (`site/_data/projects.json`) drives the footer, the previous/next links and the
  checks; `sitemap.xml` is generated from the pages with dates from git
- Coding animations split into one file each, with their data in JSON and the scripts that produced
  it in `tools/data/`
- New checks: `deno task tap-test` (no invisible tappable links on phones), `deno task snapshot` and
  `deno task compare` (before/after comparison of every page), a placeholder report, WebP and image
  size rules, lint and formatting in CI, and a monthly broken-link check
- `deno task release` merges dev into main, pushes and waits for the deploy; `deno task images`
  converts images to WebP at most 2400 px
- Dated wording that would go stale ("this month", "today") replaced with fixed dates

## v1.4 (One academic timeline & a CSS rework) · 2026-09-25

- Academic is one timeline in date order: 2019 engineering start, Design 1, the engineering final
  semester, then Designs 2–6
- Design 6 is the final architecture semester: social housing for Malé, "To be known is to be loved"
- `main.css` rebuilt on semantic colour tokens; dark areas redefine the tokens instead of overriding
  each component; shared patterns defined once
- The Titanic animation shows how each model splits passengers before the scores
- Fixed: hidden mobile menu links could be tapped invisibly over the page
- Wildlife Illustrated told through its own changelog; ventilation checker described properly

## v1.3 (The coding story) · 2026-09-25

- Coding became an animated, narrative timeline: 19 entries from the 2021 manga archiver to this
  site, each with an animation drawn from real data where there is some
- Wikimedia Commons credit for the Maldives base map; study years on every project

## v1.2 (Academic, Professional, Personal) · 2026-09-25

- Homepage regrouped into Academic, Professional and Personal after lecturer feedback
- Professional work as a map of the Maldives with project counts per atoll (placeholder)
- Wildlife renamed Illustrations; the Personal group is one continuous dark band

## v1.1 (Build step & checks) · 2026-09-25

- Navbar and footer moved into shared partials, stamped in by a small Deno build
- Repo reorganised; CI builds and checks every push (links, images, anchors, metadata)

## v1.0 (Restored & redesigned) · 2026-09-24

- Restored the original static site after the abandoned rewrite, then redesigned it
- Added Design 4 (Measured Embrace) and Design 5 with a live Tumblr process journal
- Featured Wildlife Illustrated on the homepage with live drawing progress

## v0.4 (The rewrite that wasn't) · 2026-07-06

- Tried a Deno + Vite + Vue + Tailwind rewrite; abandoned before an MVP and archived as the
  `vue-rewrite-archive` tag

## v0.3 (Architecture projects) · 2025-06-13

- Pages for Designs 1–3, project cards on the homepage, and the CV

## v0.2 (Revamp) · 2025-03-14

- Major revamp of the first site, and housekeeping

## v0.1 (First site) · 2025-01-29

- First version: a placeholder homepage and a coding page with the ASCII sphere
- GitHub Pages deployment, after a lot of trial and error
