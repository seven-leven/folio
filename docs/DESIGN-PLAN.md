# From design system to manifesto: a plan

_Concept and roadmap, 25 October 2026. Model: bird_dash's
[`docs/DESIGN.md`](https://github.com/seven-leven/bird_dash/blob/main/docs/DESIGN.md)._

## Why

`DESIGN.md` is a good reference, but it's a reference: tables of tokens, spans and components.
It tells you **what** the values are, not **why**, so when a page needs something the tables
don't cover, there's nothing to reason from. "Choose the quieter option" is the only fallback.
The result is visible on the site:

- **Two guides.** Academic/professional (`DESIGN.md`) and Personal (`docs/design-personal.md`)
  each say "one language for all three is a later job".
- **Voices that override the shell.** Semesters 4, 5 and Engineering each have their own hero,
  fact tiles, chapter nav and captions, which `DESIGN.md` §08 says a voice may not change. The
  guide lists this under "Not yet in line" instead of deciding it.
- **Rules without a reason**, so they drift: 31 font sizes on the homepage, corners of 10 and
  12 px outside the scale, the coding animation blue a shade off `--blue-light`, title case
  on Semesters 1–3 and sentence case elsewhere.

bird_dash fixed the same problem by putting **five principles** first and deriving every rule
from them. Each section names the principles it serves, the guide ends with a review checklist
grouped by principle, and the exact values move to a Reference section that tests check
against the code. The folio should work the same way, and then every page should be redone
against it.

## The five principles (draft)

Drawn from what `DESIGN.md` already believes, so nothing on the site has to change its
character, only its consistency.

### P1: The work leads

**The drawings carry the colour. Everything around them stays quiet.**
Boards, drawings, renders and code animations are the most vivid things on any page. The
interface is paper, ink and one accent. Drawings are shown whole, on white, at their own ratio;
nothing sits over them. When two options work equally well, choose the one that draws less
attention to the interface.
_Gathers: 90% quiet / 10% colour, drawings on white, never cropped, one lead image, no
decoration, "choose the quieter option"._

### P2: Always say where you are

**A visitor should know which semester, which project and which chapter they're in, without
reading a word.**
Semester colour, the bird, the six-segment progress bar, the page edge and the chapter nav
are all one system for placing people. They are never decoration, so they're never used for
anything else.
_Gathers: semester colours, the birds as an index, the progress bar, the page edge, kicker,
sticky chapter nav, pager._

### P3: One shell, many voices

**The same person made every page: consistency is the default, difference is earned.**
The grid, hierarchy, states and navigation never change. A project may take the voice of its
own boards (typeface, paper tone, a few colours), and Personal work is the same shell "after
hours", on ink. Before inventing a pattern, use the one that exists; if a new one is needed,
it becomes the shared one. The book and the site are one work in two media.
_Gathers: the shell, voices, the Personal guide (folded in as a voice), the token scales,
book and site side by side._

### P4: Tell it straight

**Words, numbers and status say exactly what is true.**
Plain first-person sentences, sentence case everywhere, captions that say what a drawing
shows, live counts that never appear before they're known, and honest status: "Semester VI
in progress", "an experiment", "retired". No "Coming soon" without a date. Group work is
marked as group work.
_New: the guide has no language section today. bird_dash's "Say what is true" is the model._

### P5: For everyone, on every screen

**Access is part of the design, not a finishing pass.**
Phones first, with no sideways scroll at 375 px; 44 px touch targets; 4.5:1 text contrast on
its real ground; keyboard and visible focus; reduced motion; Dhivehi set properly. Nothing
essential depends on hover, colour alone or JavaScript.
_Gathers: the accessibility checklist, now a principle rather than a table at the end._

> When a rule and a principle disagree, change the rule. Don't quietly drop the principle.

### Tightened after the semester audit (v2.1)

The [semester audit](audit/semesters.md) showed the principles were right but too soft to stop
drift: every page "followed" them and still came out differently. v2.1 makes them sharper in
three ways.

**1. Rules that can be measured are numbers** (section 00 of the sheet). Phase 2 makes
`npm run check` enforce them.

| Rule | Limit | Serves | Worst today |
|---|---|---|---|
| Intro under the title | 40 words at most | P1 | Sem 1 · 106 |
| Font sizes on one page | 10 at most | P3 | Sem 4 · 22 |
| Figures on one page | 30 at most, the strongest | P1 | Sem 4 · 40 |
| Chapters | 5 to 9, in acts, ending by looking back | P4 | Sem 1–3 · no reflection |
| Figures with a caption | every one | P4 | Sem 1 · 13 of 17 |
| Alt text | describes what is shown, 6 words or more | P4 P5 | Sem 3 · 21 of 24 only name it |
| Title case in headings and captions | none | P4 | Sem 4 · 24 headings, 33 captions |
| Text contrast, voice labels included | 4.5:1 or more | P5 | Sem 6 · 2.7:1 |
| Link and button height | 44 px or more | P5 | Sem 1–4 · every one in the page |
| A drawing's width at 375 px | 300 px or more | P1 P5 | Sem 1, 6 · 160 px |

**2. P3 names the shared parts.** A voice changes typeface, paper tone and colour, and nothing
else. The hero, fact tiles, lead image shape (a rectangle), captions, heading case and numbering,
the chapter nav and the states are shared components. This answers decision 2 below the way the
plan assumed; Sem 4 and 5 keep their type and colour and move onto the shared parts.

**3. P4 covers the story, not just the words.** Every semester is told in five acts, whatever
its chapter titles: context → the idea → how it developed → the drawings → looking back. Each
act has a question to answer (in the audit, §3). Sem 5 and 6 already work this way; Sem 1–3
need the story written, which is the author's job, not a code change.

Smaller rules added: the kicker stays on one line on a phone; the bird ends above the intro;
the chapter nav fades at its edge when it overflows; a chapter number is its own label;
captions read "Ground floor plan, 1:20"; text is first person and about the design, never a
pitch to the reader.

## The new guide: shape

One `DESIGN.md` replaces `DESIGN.md` and `docs/design-personal.md`. Each section opens with
the principles it serves.

| # | Section | Serves | Comes from |
|---|---|---|---|
| | Manifesto: tagline and the five principles | all | new |
| 00 | Budgets: the rules as numbers | all | **new**, from the semester audit |
| 01 | Colour: quiet ground, one signal | P1 P2 P5 | DESIGN §01, Personal §02 |
| 02 | Type: hierarchy without shouting | P3 P5 | DESIGN §02 |
| 03 | Language: say what is true | P4 P3 | **new** (case, captions, status, counts, link text, alt text) |
| 04 | Grid and space | P3 P5 | DESIGN §03 |
| 05 | Form and motion: a quiet frame | P1 P3 | DESIGN §04, Personal §06 (play) |
| 06 | States and components | P3 P5 | DESIGN §05 |
| 07 | Place markers: bird, bar, edge | P2 | DESIGN §07 |
| 08 | Voices, Personal included | P3 P1 | DESIGN §08, Personal §01–04 |
| 09 | Page shapes: project, entry, homepage | P2 P3 | DESIGN §06, Personal §05 |
| 10 | Story: told, not listed (the five acts) | P4 P1 | **new**, from the semester audit |
| 11 | Empty, loading and failed: never pretend | P4 | **new** (journal and wildlife data when the fetch fails, placeholders, Sem VI) |
| 12 | Book and site | P3 | DESIGN §07 table, expanded |
| | Before a change ships: checklist by principle | all | **new**, replaces Do/Don't |
| | Reference: every token, checked against `main.css` | | DESIGN tables, moved |

**Writing rules for the guide itself:** say why before what; one example per rule; tables only
for values; a value appears once (in Reference) and is referred to by token everywhere else.

## Roadmap

Each phase is one or more pull requests. Visual changes are checked with
`npm run snapshot -- before` / `after` and `npm run compare`.

### Phase 0: Audit the site as it is now (1 PR)

`docs/design-audit.md` dates from 6 October, before the migration. Redo it per page against
the five principles: what each page breaks, counted (font sizes, radii, colours outside tokens,
touch targets under 44 px, title case, hover-only content).
**Output:** a page-by-page scorecard, which becomes Phase 3's order.

### Phase 1: Write the manifesto (1 PR)

- Rewrite `DESIGN.md` in the shape above; fold `design-personal.md` in as the "after hours"
  voice and delete it.
- Redraw the one-sheet (`npm run guide`): principles across the top, then colour, type, place
  markers and voices.
- Settle the open decisions below first.

### Phase 2: Make the rules checkable (2–3 PRs, no visual change)

- **Scales:** type down to about 8 sizes, the 4 radii (fold the stray 10 and 12 px in), space
  steps; the animation palette read from `main.css`.
- **Components:** turn the repeated markup into Astro components: `ProjectHero`, `Facts`,
  `ChapterNav`, `Figure`, `SemBar`, `SemBird`, `Pager`, `Quote`. A voice styles them; it
  doesn't replace them.
- **Checks in `npm run check`:** no hex colours or font names in page stylesheets, no font
  sizes outside the scale, Reference tables match `main.css` (as bird_dash's tests do),
  contrast of every text/ground pair, touch targets at 375 px from the snapshots.

### Phase 3: Redo the pages, one PR each

Order from the Phase 0 scorecard; a likely order:

| Page | Main work |
|---|---|
| Semesters 1–3 | Sentence-case headings, touch targets, shared components (they're already on the kit) |
| Semester 4 | Keep the research-book voice; move its hero, facts, chapter nav and captions onto the shared components |
| Semester 5 | Same, for the Design V voice |
| Engineering | Same, for the drafting-sheet voice |
| Semester 6 | Choose the bird; decide its voice from its boards; honest "in progress" state |
| Homepage | Type onto the scale; timeline as a content collection (also back-end item); Personal band as a voice; "Coming soon" with a date |
| Coding pages (mancala, Discord bot, wildlife, class book) | The entry-page shape, on ink, with the shared components |
| 404 | Says where you are and how to get back |

**Each page PR:** before/after snapshots at 375, 820 and 1280 px, the checklist by principle
filled in, and the page removed from "Not yet in line".

### Phase 4: Book alignment

Check the printed folio (`PP Folio v6.indd`, 6-column grid) against the same five principles
and record where print differs on purpose (Myriad Pro, white paper, bird at 100%).

## Decisions to make before Phase 1

1. **Tagline.** Keep "One shell. Six semesters. A few voices." or write a new one around the
   principles (bird_dash: "The drawings carry the colour. Everything around them makes room.").
2. **Voices:** may Semesters 4, 5 and Engineering keep their own hero layouts, or do they adopt
   the shared hero and keep only type, paper and colour? (The plan assumes the shared hero.)
3. **Personal on ink:** stay a dark band, or become paper with its own accent?
4. **Grid:** the site is 12 columns, the book is now 6. Align the site on 6 (spans of 3+3,
   2+4…) or record the difference in "Book and site"?
5. **Five principles:** are these the right five? A sixth candidate is "Book and site are one
   work", currently folded into P3.

## Done when

- One guide, principles first, every section tagged, with a checklist and a tested Reference.
- "Not yet in line with this document" is empty.
- Every page has passed its Phase 3 PR.
