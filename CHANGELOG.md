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
