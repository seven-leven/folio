# Design guide

How the portfolio looks and why, for the website and the printed book together.
Everything here is implemented in `site/assets/css/main.css`; the guide explains the
decisions so new pages follow them. The state of the site before this guide was written
is recorded in [docs/design-audit.md](docs/design-audit.md).

## 1. The idea

**One shell, six semesters, a few voices.**

- The **shell** never changes: paper ground, ink text, terracotta accent, Inter and
  Instrument Serif, the navbar, the footer, the pager.
- Each **semester** has one colour and one bird. The colour marks where you are, on the
  page edge of the book and of every project page; the bird opens the semester.
- A project page may speak in the **voice** of its own boards (a typeface and a small
  palette), but only inside the shell and only using what this guide lists.

If something isn't covered here, choose the quieter option.

## 2. Colour

### Palette

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f6f4ef` | Page ground |
| `--paper-2` | `#eeebe4` | Second ground: tinted bands and chapters |
| `--card` | `#fffdf9` | Cards and tiles |
| `--ink` | `#161514` | Headings, primary text, dark bands |
| `--ink-2` | `#34322f` | Body text |
| `--muted` | `#6b6760` | Captions, labels, secondary text |
| `--line` / `--line-strong` | `#dfdad0` / `#cbc4b6` | Rules and borders |
| `--accent` | `#a8483f` | Terracotta as text on paper |
| `--accent-fill` | `#b85450` | Terracotta as a fill, and focus rings |
| `--accent-light` | `#e39a86` | Terracotta on dark |

Components never use these directly. They use the **roles** (`--text`, `--text-2`,
`--text-muted`, `--rule`, `--rule-strong`, `--accent-text`, `--surface`), which a dark
band redefines. That is how the Personal band, the footer and the CV card turn dark
without a single override.

### Semester colours

Each is taken from that semester's own work. The same six are used in the book.

| | Name | Fill `--sem-N` | Text `--sem-N-text` | Print (CMYK) | From |
|---|---|---|---|---|---|
| I | Ink | `#3e4c8a` | `#3e4c8a` | 80 65 10 5 | Ink in water |
| II | Ember | `#d9772b` | `#a6591e` | 10 60 90 0 | The flame painting |
| III | Mauve | `#b06a8e` | `#a1557c` | 30 70 20 5 | Henveiru's pink wash |
| IV | Olive | `#7a8b3c` | `#667432` | 55 30 95 10 | The mangrove island |
| V | Lagoon | `#2f8c8c` | `#297979` | 80 25 45 5 | The floating lagoon |
| VI | Red | `#a63d40` | `#a63d40` | 25 85 70 15 | Reserved for the final semester |

- Inside a semester context (`data-sem="N"` or the page's body class) use `--sem` for
  fills, edges and dots, and `--sem-text` for anything that is read. The fills of II to V
  are too light to be text on paper.
- Engineering uses `--eng-blue` (`#1f5fa8`) in the same way.

### Rules

- One accent per view. On a project page the accent is the semester colour, not terracotta.
- Colour marks position (which semester) or state (active, hover). It is never decoration.
- Text on paper must reach 4.5:1. Check any new colour pair before using it.
- No colour values in page stylesheets. A voice's palette is declared in the Voices
  block of `main.css` (section 8 below).

## 3. Type

### Families

Six families. No page loads any other.

| Token | Family | Role |
|---|---|---|
| `--font-sans` | Inter | Text, labels and controls everywhere |
| `--font-serif` | Instrument Serif | Display: titles, numerals, pull quotes |
| `--font-book` | Source Sans 3 | The printed book's voice (Myriad Pro in print), for Semesters 4 and 5 |
| `--font-book-serif` | EB Garamond italic | The resit book's standfirsts (Semester 4) |
| `--font-data` | IBM Plex Mono | Labels, figures, tables and code on drafted pages |
| `--font-thaana` | Noto Sans Thaana | Dhivehi names |

### Scale

| Token | Size | Use |
|---|---|---|
| `--fs-label` | 0.76 rem, 600, uppercase, `--track-label` (0.14 em) | Kickers, chapter numbers, tile headings, nav chips |
| `--fs-caption` | 0.82 rem | Captions |
| `--fs-small` | 0.9 rem | Secondary text |
| `--fs-body` | 1 rem / 1.7 | Body |
| `--fs-lead` | 1.08 rem | Standfirst |
| `--fs-h3` | 1.05 rem, 600 | Sub-headings (sans) |
| `--fs-h2` | 2 to 2.9 rem | Chapter titles (serif) |
| `--fs-h1` | 2.9 to 5.4 rem | Page titles (serif) |

### Rules

- Display type is serif at weight 400, never bold. Emphasis in a title is one word in
  italic and the semester colour (`<em>`), as in "Urban _Acupuncture_".
- Sub-headings and labels are sans. A heading is never both serif and uppercase.
- Lines of text run no longer than `--measure` (68 characters).
- Captions are plain: muted, upright, left-aligned, under the drawing.
- In the book: Myriad Pro throughout; 11 pt minimum on the profile, contents and
  reflections spreads; running heads and folios 6.5 pt capitals tracked +100.

## 4. Space, shape and depth

| Token | Value | Use |
|---|---|---|
| `--wrap` | 1180 px | Widest content column |
| `--measure` | 68 ch | Longest line of text |
| `--space-1` … `--space-6` | 0.25, 0.5, 0.75, 1, 1.5, 2.25 rem | Gaps inside and between components |
| `--space-section` | 2.5 to 4.25 rem | Above and below each chapter |
| `--radius-xs` | 4 px | Drawings, and everything on drafted pages |
| `--radius-sm` | 8 px | Photographs, lead images, tiles |
| `--radius` | 14 px | Cards |
| `--radius-pill` | 999 px | Buttons, tags, nav chips |
| `--shadow` | one soft shadow | Lead images and hovered cards only |

- Chapters are separated by a rule and space, not by cards. A card means "this is a
  separate object you can act on".
- Drawings sit on white with a 1 px rule, because they were drawn on white. Photographs
  and renders get the small radius and no border.

## 5. Signature devices

These four things make the book and the site recognisably the same work.

### The progress bar

Six segments, one per semester, filled up to the current one, each in its own colour,
inside a single 1 px outline. It has run across the cover of every studio portfolio
since Semester 1.

- **Web:** `<span class="sem-bar" data-at="3">` with six `<i>` inside. It appears under
  the title of every project page and in the pager at the foot.
- **Book:** under the title on each semester opener and on the cover. One fixed length
  everywhere; the interim cover is filled to five, the final to six.
- Never restyle it, round it, animate it or use it for anything but semester progress.

### The page edge

A strip of the semester's colour on the outer edge.

- **Web:** a 6 px edge down the right of every project page, plus the reading-progress
  bar along the top, both in `--sem`.
- **Book:** six tabs stacked down the outer edge of every page, the current semester's
  at full strength and the rest faded, so the closed book shows six bands. The contents
  and reflections rows sit level with the tabs they describe; the cover's ribbons end
  level with them.

### The bird

Each semester's bird, large: at full strength on the book's opener, and faint behind the
title of that project's page. Section 6 has the rules.

### Figure numbers (book)

`FIG 3.4` takes the semester colour; the rest of the caption stays black.

## 6. The birds

Each semester has one bird from the _Wildlife Illustrated_ drawings. They began on the
covers of the Semester 4 and 5 portfolios and now mark every semester.

| Semester | Drawing | File (Art Studio / Birds / 0 Completed) | On the site |
|---|---|---|---|
| I | Lesser Whistling-Duck, pen | `001.png` | `assets/img/birds/sem1.webp` |
| II | Grey waterbird, watercolour | `032.png` | `assets/img/birds/sem2.webp` |
| III | Flamingo, digital | `011.png` | `assets/img/birds/sem3.webp` |
| IV | House Crow, ink wash | `177.png` | `assets/img/birds/sem4.webp` |
| V | Grey Heron, digital | `133.png` | `assets/img/birds/sem5.webp` |
| VI | To be chosen with the final project | | |

A one-sheet picture of this whole guide, with the birds and their placement drawn out, is
[docs/design-guide.png](docs/design-guide.png) (`deno task guide` redraws it).

### Always

- One bird per semester, used once in the book and once on the site.
- As drawn: its own colours, facing its own way. Never mirrored, recoloured, outlined,
  boxed or cropped into. Crop only empty paper.
- Never two birds in one view.

### In the book

| | Rule |
|---|---|
| Where | The semester opener only, on the outer half of the page beside the numeral |
| Not on | Project pages, the cover (that is the six ribbons), profile, contents, reflections |
| Strength | 100%. It is the picture on that page |
| Size | Large; it may run to the page edge and bleed |
| Clear space | At least 5 mm from the title, the progress bar and the quote. It never touches text |
| Facing | Into the page, toward the title, where the drawing allows |
| File | Remove any old cover lettering first |

### On the site

`<img class="sem-bird">`, the last child of the hero's text column on a project page.

| | Rule | Token |
|---|---|---|
| Where | Behind the title: top-right of the text column, its top level with the kicker | |
| Not on | The homepage, navbar, footer, pager, or anywhere below the hero | |
| Layer | Last. Text, fact tiles and the lead image sit over it; it covers nothing | |
| Strength | 26% | `--bird-opacity` |
| Size | 13 to 25 rem tall, and never taller than the text column | `--bird-h` |
| Offset | Its right edge 2 rem into the gutter; flush with the column on a phone | |
| Behaviour | Decorative (`alt=""`). Not a link, not zoomable, not animated | |
| File | White paper removed (transparent ground), WebP, 760 px at most | |

A page may lower `--bird-opacity` if its title is hard to read over a dark drawing; it
may not raise it. The _Illustrations_ section of the homepage is the collection itself
and follows its own layout; these rules are for the semester birds only.

### Adding one

Trim the drawing to its edges, turn its white paper transparent, save it as WebP no
larger than 760 px, name it `semN.webp`, and add it to the table above.

## 7. Components

| Component | Rule |
|---|---|
| Navbar | Sticky, 68 px, translucent paper. Active link is a pill. One dark pill: Download CV |
| Buttons | Pills. Primary is ink on paper; ghost is outlined; light is for dark bands. Hover turns primary terracotta |
| Text links | `link-arrow`: underlined, with an arrow that moves 4 px on hover |
| Labels | `--fs-label` style. Used for kickers, chapter numbers and tile headings, never for sentences |
| Outlined numerals | Serif numerals in a 1 px outline, for the homepage's group and project numbers |
| Tags | Outlined pills listing what a project contains |
| Cards | `--surface`, 1 px rule, `--radius`. Lift 2 px with the shadow on hover if they are links |
| Fact tiles | Up to four under a project's standfirst: a label and one short value each |
| Chapter nav | Sticky under the navbar on project pages; label-style chips; the active one filled with `--sem-text` |
| Figure | Image, then a plain caption. Click opens the lightbox; images do not grow on hover |
| Quote | Serif italic with a 3 px semester-colour rule on the left. For the project's own words |
| Tile | Paired boxes (problem and remedy, strengths and threats) with a label-style heading |
| Pager | Previous and next project either side of the progress bar and "All architecture" |
| Lightbox, 3D viewer | Shared; never restyled per page |

## 8. Pages

### The project page kit (`.pk`)

The standard shape for a studio project. Semesters 1 to 3 use it unchanged.

```html
<body class="project-page project-<name> pk">
  <main>
    <header class="pk-hero">
      <div class="pk-wrap pk-hero__grid">
        <div class="pk-hero__text">
          <p class="pk-kicker">Semester 3 · Architectural Design III · 2025</p>
          <h1 class="pk-title">Urban <em>Acupuncture</em></h1>
          <p class="sem-mark">…progress bar…</p>
          <p class="pk-sub">One line in the project's own words</p>
          <p class="pk-standfirst">Optional short introduction.</p>
          <dl class="pk-facts">…up to four facts…</dl>
          <img class="sem-bird" src="assets/img/birds/sem3.webp" alt="" …>
        </div>
        <figure class="pk-hero__media"><img …></figure>
      </div>
    </header>
    <nav class="pk-subnav" data-spy>…one link per chapter…</nav>
    <div class="pk-wrap pk-body">
      <section id="…"><h2>Chapter title</h2> … </section>
    </div>
  </main>
```

- Chapters number themselves. Give each an `id` and a link in the chapter nav.
- Lay drawings out with `pk-grid` and `pk-grid--2`, `--3` or `--split` (text beside a
  drawing). `pk-figure--narrow` keeps a tall drawing to a readable width.
- `pk-section--tint` puts one chapter on the second ground, edge to edge. Use it once
  per page at most.
- The page's own stylesheet holds only what no other page needs.

### Voices

A voice changes the typeface and adds a few colours. It does not change the shell, the
scales, the semester colour or the page shape (kicker, title with one accented word,
progress bar, standfirst, facts, bird, lead image, chapter nav, chapters).

| Page | Voice | Typeface | Its own colours |
|---|---|---|---|
| Semester 4 | The resit book | `--font-book`, with `--font-book-serif` standfirsts and `--font-data` labels | Slate, steel, navy |
| Semester 5 | The Design V boards | `--font-book`, italic text | White ground, cool foam and line |
| Engineering | A drafting sheet | `--font-sans` with `--font-data` | Cool paper with a grid, graphite |

Voices are declared together in the Voices block of `main.css`. A new voice needs a
reason from the project's own boards; otherwise use the kit as it is.

### The homepage

Three numbered groups (Academic, Professional, Personal), then Skills, About and
Contact. Project rows alternate image and text, carry the semester colour down the image
edge, and are grouped by year.

## 9. Motion

- One curve: `--ease`. Content rises 26 px and fades in over 0.8 s as it enters, 80 ms
  apart within a group.
- Hover moves things 1 to 4 px at most. Nothing scales, spins or bounces.
- Everything is visible without JavaScript, and motion is only ever an entrance.

## 10. Images

- WebP, at most 2400 px on the long side (`deno task images`); width and height always set.
- The lead image loads eagerly; everything else is lazy.
- Alt text says what the drawing shows, not what it is called.
- Remove lettering baked into a drawing in another typeface; set it again as a caption.

## 11. Book and site, side by side

| | Book | Site |
|---|---|---|
| Ground | White paper | Warm paper `--paper` |
| Typeface | Myriad Pro | Inter and Instrument Serif; Source Sans 3 where a page takes the book's voice |
| Semester colour | Edge tabs, progress bar, figure numbers | Page edge, reading bar, progress bar, kicker, chapter numbers |
| Progress bar | Cover and openers | Every project page and its pager |
| Bird | Opener, large, full strength | Behind the page title, large, 26% |
| Navigation | Contents rows level with the tabs | Navbar, chapter nav, pager |
| Group work | A `GROUP WORK` tag on the drawing | Said in the text or caption beside the drawing |

## 12. Keeping it this way

- **Colour, type and scales live in `main.css` only.** A page stylesheet that contains a
  hex colour, a font name or a pixel radius is a bug.
- Before a visual change run `deno task snapshot before`; afterwards
  `deno task snapshot after` and `deno task compare before after`. The comparison lists
  every style that changed on every page at three widths.
- `deno task check` must pass before a release.
- When a rule here stops being true, change the rule or the code in the same commit.

### Not yet brought into line

- The homepage still sets many font sizes directly rather than from the scale.
- Chapter headings on Semesters 1 to 3 are in title case; the rest of the site uses
  sentence case.
- Each page links its own Google Fonts; a shared partial would keep the list in one place.
- Semester VI has a colour but no page, bird or voice yet.
