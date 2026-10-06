# Folio design system: Personal

v1.0 · 2026 · for the Personal band of the site (Illustrations and Coding).

The one-sheet map of this document is [design-guide-personal.png](design-guide-personal.png)
(`deno task guide` redraws it).

Academic and professional work follow [DESIGN.md](../DESIGN.md). Personal work is not
held to that document's page shape, signature devices or motion rules. It **is** held to
its foundations. Bringing the three under one language is a later job; until then this
file says what Personal shares and where it is allowed to differ.

## 00. Principle

> **Same shell. After hours.**
> The paper turns to ink, and the work is allowed to play.

Personal is the part of the site that isn't assessed: drawing every bird of the
Maldives, and code written to scratch an itch. It looks like the same person made it,
on a different evening.

## 01. Same foundations

Everything in DESIGN.md sections 01 to 05 applies unless the table below says otherwise.

| Inherited as it is | |
|---|---|
| Type | The six families and the eight sizes. Serif titles at regular weight, one word in italic and colour |
| Labels | `--fs-label`, uppercase, tracked. Never for titles |
| Grid | 1180 px, `--gutter`, `--margin`, 68-character lines |
| Space and radius | `--space-1` to `--space-6`; the four corners |
| States | Hover, current, focus, pressed, disabled. The focus ring is still 2 px terracotta |
| Accessibility | All eight checks, measured against the ink ground |
| Navbar and footer | Unchanged |

| What differs | Academic and professional | Personal |
|---|---|---|
| Ground | Paper | Ink (`--ink`), in one continuous band |
| Text | Ink on paper | Paper on ink, by redefining the roles |
| Accent | Terracotta, or the semester colour | `--accent-light` for code, `--blue-light` for illustration |
| Marker of place | Semester colour, bird, progress bar | None. Personal has no semesters |
| Signature | The birds as an index | A live count and a timeline |
| Motion | Quiet: 1 to 4 px | May play (section 06) |
| Decoration | None | Two soft glows behind the band, nothing else |

## 02. Colour on ink

The band redefines the roles, so shared components turn dark without overrides.

| Role | On ink |
|---|---|
| `--text` | Paper `#f6f4ef` |
| `--text-2` | Paper at 75% |
| `--text-muted` | Paper at 62% |
| `--text-faint` | Paper at 48%: small labels only, never sentences |
| `--rule` / `--rule-strong` | Paper at 14% / 30% |
| `--surface` | Paper at 4% |
| `--accent-text` | `--accent-light` `#e39a86` |

Two accents, one per subject, never mixed in one block:

| Accent | Token | Used for |
|---|---|---|
| Sky | `--blue-light` `#9cc3e6`, with `--blue` `#5b9bd5` | Illustration: the accented title word, the count bar |
| Terracotta light | `--accent-light` `#e39a86` | Code: labels, the timeline's dots and rail ends, links |

- **The glows:** one sky glow top-left and one terracotta glow on the right, both under
  16% strength, behind everything. They are the only gradients on the site. Do not add
  a third or strengthen them.
- **Drawings stay on white.** A drawing is never placed straight on ink or tinted to
  suit it; it sits on a white card.
- **Animation palette:** the coding animations draw with five colours only, defined in
  `site/assets/js/coding/core.js`: paper `#f6f4ef`, accent `#e39a86`, blue `#8fbde6`,
  red `#d9695f`, sand `#d8bd8c`. Red is for "wrong" or "before"; sand is a neutral third.

## 03. Illustration

The Wildlife Illustrated block. Its job is to show progress and send people to the
collection, which has its own site and its own guide.

| Part | Rule |
|---|---|
| Title | Serif; the last phrase italic in `--blue-light` |
| Count | The number drawn, in large serif, with the total beside it. Read live from the collection |
| Count bar | A rounded 10 px bar in sky. This is not the semester progress bar; never use that one here |
| Other counts | Label-style, with tabular figures |
| Drawing card | White card, 12 px corners; the drawing whole, with 6% clear space; then its number, English name and Dhivehi name |
| Dhivehi name | `--font-thaana`, right-aligned, one size up from the Latin beside it |
| Grid | Three cards across, six at most |
| Link out | One light pill: "Explore the collection" |

The semester birds (DESIGN.md section 07) are a different use of the same drawings and
follow that document. They never appear in this band as markers.

## 04. Code

A timeline, oldest first: date, rail, then the story with a small animation.

| Part | Rule |
|---|---|
| Date | Serif, right-aligned, in its own 7.5 rem column |
| Rail | 1 px, with a 13 px ring per entry in `--accent-light`. The current entry is filled; a milestone is larger, filled, and its body sits in a faint terracotta box |
| Chapter | Serif italic in `--text-faint`, for a year or a turn in the story |
| Meta | Label style in `--accent-light`: what kind of thing, and what it was written in |
| Title | Serif, sentence case. What it does, not what it is called |
| Text | First person, plain, 62 characters a line at most. Say the problem, then what the code did about it |
| Visual | A canvas in a 4:3 frame, 10 px corners, on black at 28%, with a label-style caption |
| Code in text | `--font-mono`, for file names and commands only |
| More | Three entries are shown; the rest are behind one outlined pill |

A visual explains the project. If it only decorates, leave it out.

## 05. Entry page (planned)

A timeline entry may be opened out into a page of its own, so there is room to tell the
whole story. The timeline keeps its short version and gains a "Read the full story"
link. None of these pages exists yet; this is the shape they take when they do.

It is the project page of DESIGN.md section 06, on ink, so the two can be merged later.

| # | Part | Rule |
|---|---|---|
| 1 | Kicker | `Date · kind · language`, label style, in `--accent-light` |
| 2 | Title and summary | The timeline's title, serif, the last phrase italic in the accent; then one line saying what it does |
| 3 | Facts | Two to four tiles: year, language, status (in use, retired, an experiment), where the code is |
| 4 | Lead visual | The entry's own animation, large, in its 4:3 frame. It takes the lead image's place |
| 5 | Chapter nav | The same sticky chips; the current one filled with the accent |
| 6 | Chapters | Numbered, a rule between. Default order: the itch · what it does · how it works · what I learned |
| 7 | Code block | `--font-mono` on the dark panel (black at 32%), `--radius-sm`, 12 lines at most. Longer code is linked, not pasted |
| 8 | Pager | Previous and next entry by date, either side of "All code" |

- **No semester, no bird, no progress bar, no page edge.** Those belong to the semesters.
- **Ground:** the whole page is ink, not a band, with the same two glows behind the hero only.
- **Which entries get a page:** one with enough to say for three chapters. The rest stay
  as timeline entries; a page that repeats the timeline text is not worth making.
- **Screenshots and diagrams** sit on the dark panel with a 1 px rule and a plain caption.
  A screenshot of a light interface keeps its own white ground; it is not inverted.
- **Voice:** first person and plain, as in the timeline. Explain the problem before the
  code, and say what went wrong as well as what worked.
- **Build:** use the `.pk` kit's markup with a dark context on the body, so the shared
  roles do the work. It needs one addition to `main.css` (an ink page context) and no
  new components.

## 06. Play

Personal may move more than the rest of the site. These are the limits.

| Allowed | Not allowed |
|---|---|
| A drawing card lifts 4 px and tilts up to 1° on hover | Tilt or scaling on anything that isn't a drawing card |
| The drawing inside grows up to 6% | Bounce or elastic easing |
| Canvas animations that loop quietly | Sound, or anything that flashes |
| A glow on a milestone dot | Glows on text or buttons |
| The ASCII donut, in mono | Any of this on an academic or professional page |

Every animation stops when the viewer prefers reduced motion, and none runs until it
scrolls into view.

## 07. Do / Don't

| Do | Don't |
|---|---|
| One dark band, start to finish | Alternating dark and light blocks |
| Sky for illustration, terracotta for code | Both accents in one block, or a third |
| Drawings on white cards | Drawings straight on ink |
| An animation that explains | An animation that decorates |
| First-person, plain sentences | Headlines in capitals |
| The same type, grid and states as the rest | A new font or a new corner radius |

## 08. Source of truth

| Where | What |
|---|---|
| `DESIGN.md` | The foundations this guide builds on |
| `docs/design-personal.md` | These rules |
| `site/assets/css/main.css` | The dark roles (top of the file) and the Personal band's components (section 7) |
| `site/assets/js/coding/core.js` | The animation palette and fonts |
| `site/assets/js/coding/visuals/` | One file per animation |
| `seven-leven/bird_dash` | The collection itself, with its own guide |
| `site/sem1.html` | The page template an entry page starts from |

### Not yet in line with this document

- The animation palette is written in `core.js`, not read from `main.css`; its blue
  (`#8fbde6`) is a shade off `--blue-light` (`#9cc3e6`).
- The drawing card's 12 px and the visual's 10 px corners are not on the corner scale.
- Several sizes in this band are set directly, not from the type scale.
- The band's glows and a few rgba values are written out where they are used.
