# Design audit — the site as found

_Recorded 6 October 2026 from v1.5 (`dev` = `main` = live), using `deno task snapshot before`
(every page at 375 / 820 / 1280 px) and the stylesheets. This is the first pass: what the
site's design system **is** today, and where it breaks its own rules. The rules themselves
are in [DESIGN.md](../DESIGN.md). Items 1 to 4 of section 5 were carried out straight after it._

## 1. What is consistent (the shell)

These are the same on every page and already form a system.

| Part | As found |
|---|---|
| Ground | Warm paper `#f6f4ef`, cards `#fffdf9`, second ground `#eeebe4` |
| Ink | `#161514` text, `#34322f` secondary, `#6b6760` muted, rules `#dfdad0` / `#cbc4b6` |
| Accent | Terracotta: `#a8483f` as text, `#b85450` as fill, `#e39a86` on dark |
| Semester colours | Six, shared with the printed book: Ink, Ember, Mauve, Olive, Lagoon, Red, each with a darker text shade |
| Type | Inter for text, Instrument Serif for display, a mono for data |
| Navbar | Sticky, 68 px, translucent paper with blur; pill-shaped active state; dark pill CTA |
| Footer | Dark band, serif name, three link columns, semester dot before each project |
| Project chrome | 3 px reading-progress bar and 6 px page edge in the semester colour, lightbox, 3D model viewer, previous/next pager |
| Motion | One easing curve, reveal-on-scroll (26 px rise, 0.8 s), staggered by 80 ms |
| Small labels | 0.76 rem, 600, uppercase, 0.14 em tracking |
| Shapes | Pills (999 px) for buttons and tags; 14 px cards |

The homepage uses all of it and is the most resolved page on the site.

## 2. What varies on purpose (project voices)

Each project page borrows the look of its own boards, on top of the shared shell.

| Page | Voice | Type | Ground |
|---|---|---|---|
| Engineering | Drafting sheet: grid paper, title blocks, mono labels, square corners | Inter + IBM Plex Mono | `#fbfbf9` with a grid |
| Semester 4 | The resit book: heavy uppercase titles, italic serif standfirsts, numbered sections | Source Sans 3 + EB Garamond + IBM Plex Mono | `#faf8f4` |
| Semester 5 | The Design V boards: bold-and-italic humanist sans, pale lagoon bands | Source Sans 3 | `#ffffff` / `#f1f3f3` |

These three are deliberate, internally consistent, and share one page shape: kicker, large
title with one accented word, standfirst, fact tiles, a sticky chapter nav, then chapters.

## 3. Where it breaks

### 3.1 Semesters 1–3 are a different, older site

They predate the redesign and were never brought across.

| | Sem 1 | Sem 2 | Sem 3 | Rest of the site |
|---|---|---|---|---|
| Body font | Montserrat | Lato | "Helvetica Neue" | Inter / Source Sans 3 |
| Heading font | Oswald, uppercase | Montserrat | "Helvetica Neue" | Instrument Serif / the page's voice |
| Ground | `#fdfaf3` | `#f4f4f4` (cool grey) | `#fefefe` | warm paper |
| Text | `#333` / `#555` / `#777` | `#333` / `#666` / `#2c3e50` | `#2c2c2c` / `#555` / `#444` | ink tokens |
| Page shape | centred title, no kicker, no chapter nav | centred title in a white band | left title in one big card | kicker · title · standfirst · facts · chapter nav |

- Sem 3 asks Google Fonts for "Helvetica Neue", which Google does not serve: a dead request on every load.
- Sem 1 and 2 load Montserrat, Oswald and Lato for these pages alone (three extra families).
- Images scale up 3% on hover (Sem 1, Sem 2), which reads as a link when the click opens a lightbox.
- Sem 1 has inline styles and Bootstrap-era SWOT colours (`#5cb85c`, `#d9534f`, `#f0ad4e`, `#5bc0de`).
- None of the three says which semester or year it is; only the homepage and the pager do.

### 3.2 Counted across the site

| | Count | Should be |
|---|---|---|
| Font families | 10 (Inter, Instrument Serif, IBM Plex Mono, Source Sans 3, EB Garamond, Noto Sans Thaana, Montserrat, Oswald, Lato, Helvetica Neue) | 6 |
| Page grounds | 7 near-whites | 1 warm paper, plus each voice's own where it earns it |
| Body text colours | 6 near-blacks | the ink tokens |
| Corner radii | 2, 3, 4, 5, 6, 8, 10, 12, 14 px and 999 | a named scale |
| Font sizes on the homepage | 31 | a scale of about 10 |

### 3.3 Smaller things

- Buttons created by script (lightbox controls, model viewer) render in the browser's default
  13.33 px Arial on every project page: `button` never inherits the page font.
- The base layer still carries the old site's values: body `#fefefe` / `#2c2c2c`, paragraphs
  `#555`, links `#5b9bd5` blue, an alternating grey gradient on even sections.
- Link blue `#5b9bd5` on paper is 2.7:1, below the 4.5:1 needed for text.
- Captions are styled five different ways (size 0.9–0.95 em, three greys, italic or not, centred or right).
- The book's progress bar, its strongest device, does not appear on the site at all.

## 4. Print and web

The book and the site already share the six semester colours and the idea of a coloured
page edge. They do not yet share the progress bar, the figure-number colouring, or a type
relationship (the book is Myriad Pro; only Semesters 4–5 on the site use its web
equivalent, Source Sans 3).

## 5. What to do

1. Rebuild Semesters 1–3 on the shared tokens and the shared page shape.
2. Fix the base layer: buttons inherit type; links, text and ground come from tokens.
3. Bring the book's six-segment progress bar onto every project page.
4. Name the scales (type, radius, space) so new work has something to follow.
