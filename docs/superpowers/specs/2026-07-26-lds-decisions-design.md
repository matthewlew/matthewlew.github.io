# LDS Decision Record — Design Spec

**Date:** 2026-07-26
**Status:** Built — see `decisions.md` / `decisions.html`
**Owner:** Matthew Lew

---

## Problem

LDS's best reasoning is unreadable. It lives in three places, none of which
anyone consults:

- **Commit bodies.** `9d48813` explains why npm-from-GitHub beat jsDelivr.
  `8b47a4a` explains why the translucent fill was the relic and the hairline was
  earning its keep. `c7f9ade` explains why APCA beat WCAG. This is the densest
  rationale in the project and it is only reachable by `git log`.
- **CSS comments.** Why `--dur-slow` exists, why `--target-min` is 44px, why
  `theme-palette` ships no brand hue.
- **Point-in-time docs.** `adoption-audit.md` and `palette-adoption-delta.md`
  are snapshots that will read as stale within weeks.

Each doc explains only its own corner. Nothing explains the *system*. A reader
— including Matthew in six months, or any future agent session — cannot answer
"why is LDS shaped this way?" without archaeology.

The failure mode this prevents: re-litigating a settled decision because the
reasoning was lost, or reversing one without knowing what it ruled out.

## Non-goals

- **Not a changelog.** No version history, no exhaustive per-commit log.
- **Not a migration tracker.** `adoption-audit.md` and
  `palette-adoption-delta.md` keep that job.
- **Not a backfill of all history.** Only decisions meeting the entry bar.

---

## Architecture

Two artifacts, one source of truth.

| File | Role |
|---|---|
| `docs/lew-design-system/decisions.md` | **Canonical.** The only file edited by hand. |
| `docs/lew-design-system/decisions.html` | Timeline view. Fetches the `.md` at runtime, parses and renders client-side. |

Markdown is canonical because it is greppable, diffable, readable in a terminal,
and cheap to load as agent context. The HTML fetches it at runtime rather than
being generated, so there is **no build step to forget and no drift possible** —
consistent with LDS's "plain CSS, no build step" philosophy.

Two supporting edits:

| File | Change |
|---|---|
| `design-system/README.md` | The entry rule, under "Adding to LDS". |
| `.claude/static-server.mjs` | Add `'.md': 'text/markdown; charset=utf-8'` to `TYPES`. |

The MIME addition is correctness, not necessity: the current fallback of
`application/octet-stream` still parses via `fetch().text()`.

### Ownership of the "why"

The rationale doc becomes the single home for reasoning. Existing docs keep
their jobs and link into it:

- `apca-palette.md` keeps the construction — the Lc curve table, the OKLCH
  binary search, the light/dark polarity guidance. That is *how*.
- `lds-dos-and-donts.md` keeps the rules. That is *what*.
- `decisions.md` owns *why*, and is the only place the reasoning is written out.

`apca-palette.md` and `lds-dos-and-donts.md` each gain a pointer block to
`decisions.md`. Their existing "Why" prose is **kept, not deleted** — a
deliberate deviation from the original plan, which called for replacing it.
Deleting published writing to remove a duplication risk is the author's call to
make, not a side effect of adding a doc. The pointers frame the split (`how`,
`what`, `why`) so the redundancy is at least signposted.

Revisit if the two ever actually contradict each other.

---

## Entry format

Each entry is a claim, its reasoning, and — critically — what it ruled out. The
rejected alternative is the part that actually gets lost, and it is what stops a
settled debate from recurring.

```markdown
### APCA, not WCAG 2.x

`2026-07-26` · `color` · `measured` · `structural` · `c7f9ade`

WCAG's ratio is a symmetric luminance quotient: it ignores polarity, so it
scores light-on-dark and dark-on-light identically, and it misjudges the
mid-tones — exactly where photographic and gradient backdrops sit, the surfaces
`emph-media` exists to serve. APCA models perceived lightness difference and
polarity, so a step that passes actually reads.

**Ruled out:** WCAG 2.x. Retained as a sanity floor in `theme-palette` (every
emphasis pair clears AA 4.5:1, tightest is `emph-strong` at 5.73:1), but it is
not the system's standard.

**Cost:** APCA is polarity-asymmetric, so contrast does not mirror between
modes. Step 600-on-white is Lc +72; its complement step 400-on-black is about
Lc −63. Dark mode needs its text one notch lighter than the light-mode
complement. Never assume symmetry — verify.
```

Fields:

- **Heading** (`###`) — the decision as a claim, not a topic. "APCA, not WCAG
  2.x", never "Contrast standard".
- **Metadata line** — required, immediately after the heading.
- **Body** — the reasoning. One to three paragraphs.
- **`**Ruled out:**`** — required. What was rejected and why. If a decision
  genuinely ruled nothing out, it is a fact, not a decision, and belongs in the
  README.
- **`**Cost:**`** — optional. The live gotcha a reader must know. This is what
  makes the doc worth consulting rather than merely worth writing.
- **`quality`** — optional in the grammar, defaulting to `notable` when absent,
  so an entry is never rejected for omitting it. Always written in practice.

### Metadata line grammar

```
`YYYY-MM-DD` · `area` · `who` · `quality` · `commit`
```

Backtick-wrapped, separated by ` · `. Commit is optional; all other fields
required. It renders as mono chips in markdown, which dogfoods the existing rule
that dates, tokens and system info always use `--th-mono`.

Parser contract:

```js
/^`(\d{4}-\d{2}(?:-\d{2})?)`\s*·\s*`([a-z-]+)`\s*·\s*`(human|measured|ai)`(?:\s*·\s*`(minor|notable|structural|reversal)`)?(?:\s*·\s*`([0-9a-f]{7,40})`)?$/
```

- `^## ` opens a section. `^### ` opens an entry. Body runs to the next `##` or
  `###`.
- `**Ruled out:**` and `**Cost:**` are extracted as labelled fields; remaining
  paragraphs are the body.
- A commit hash renders as a link to
  `https://github.com/matthewlew/matthewlew.github.io/commit/<sha>`.

---

## Who decided

Three values, because a human/AI binary would tag nearly every entry "AI" — the
commits and measurements were authored by Claude — while the judgment calls in
LDS are Matthew's. A binary would credit the wrong party on a portfolio site.

The values are named for what they say rather than for how they were reached:
`judgment`/`derived`/`proposed` was the first draft and did not read as
human-vs-machine to anyone but its author.

| Value | Meaning | Rendered as |
|---|---|---|
| `human` | Matthew's call — taste, product, or scope. | Solid dark badge |
| `measured` | The measurement decided it; neither person nor AI had latitude. | Outlined badge |
| `ai` | AI-proposed, human-approved. | Dashed badge |

Measured split across the 31 decisions: **18 human · 13 measured · 2 ai**. The
system's spine is human; its verification is machine.

**The word always carries the meaning.** Fill and border style only reinforce
it, so the distinction survives greyscale and colour-blindness — mandatory in a
system whose entire thesis is measured contrast.

## Timeline

Deliberately **footnote-scale, not a dashboard**. An earlier draft carried a
horizontal density spine with per-day ticks; it was cut. The page exists to show
that LDS keeps moving and has reasons for having moved, not to be a data
visualisation of itself.

### Metadata is words, not marks

Each entry states its section, area, quality and who decided — all as plain text,
capitalised in the markup.

An earlier version encoded quality as a dot: size for weight, a ring for
reversal. It read well and it was wrong for this page. A dot copies as nothing,
so selecting a row and pasting it elsewhere silently dropped the weight of the
change — on a document whose entire purpose is that the reasoning survives being
moved around. Words survive the clipboard.

| Value | Shown as |
|---|---|
| `minor` | Minor |
| `notable` | Notable |
| `structural` | Structural |
| `reversal` | **Reversal** — brand colour and semibold on the word itself |

Capitalisation lives in the markup rather than in `text-transform`, because a
copy takes the source text and a CSS-only capital pastes back lowercase.

`reversal` is still the load-bearing value. It is emphasised by weight and colour
on the word, not by a mark beside it.

### Order and focus

**Newest first.** The page is about what is changing now. Day 0 is still the
earliest date, so the `+N` offsets read identically either way.

The most recent day renders expanded; every earlier day sits behind one
`+ show N earlier decisions` control. The backfill is kept — it is the reasoning
that would otherwise be lost to `git log` — but it does not greet the reader as a
wall.

Turning on any filter auto-reveals the earlier block, so a match can never be
silently hidden behind that control.

### Axis

Day-grouped with ordinal spacing: each date with entries is one row, equally
spaced regardless of the real interval. LDS is 12 days old with ~80% of its
decisions in the last 48 hours, so a proportional axis would be a blob against
ten days of dead space. Gaps over one day get a `N days quiet` marker.

### Milestones vs. decisions

The axis needs anchors that are not decisions. "Spec written" and "first code
lands" ruled nothing out, so by the entry bar they are not decisions — yet day 0
is one of them.

So the doc carries a `## Milestones` section. Its entries use area `milestone`,
are exempt from the `**Ruled out:**` requirement, and render as a bare labelled
row with no dot and no expansion.

### Pre-history

A third category: decisions LDS *inherited* rather than made — APCA's
construction from the Oct 2025 rebrand, One Token predating LDS. Area
`prehistory`, rendered in a cluster at the foot of the page, and **excluded from
day-0 arithmetic** so a nine-month gap does not swamp the axis.

Dates may be month-precision (`YYYY-MM`) here, because One Token's origin date is
not recorded anywhere in this repo and inventing a day would be worse than
admitting the imprecision.

| Kind | Area | Ruled out required | On the page |
|---|---|---|---|
| Decision | any | yes | Dot + expandable row |
| Milestone | `milestone` | no | Bare row, anchors day 0 |
| Pre-history | `prehistory` | yes | Cluster at the foot, outside day-0 math |

### Styling

Built from `.lds-*` and `emph-*` against `theme-portfolio`, matching the other
pages in `docs/lew-design-system/`. Dates and metadata use `--th-mono`. The page
doubles as an LDS showcase, so a regression in LDS surfaces here first.

## Sections and seed entries

Eight decision sections (31 decisions, 3 milestones, 2 pre-history), ordered foundation-outward, plus `## Milestones` and
`## Pre-history`. All 31 seed decisions are harvested from existing material —
commit bodies, CSS comments, the delta doc. Nothing invented.

**0. Milestones** — spec written (2026-07-14, day 0) · first code lands
(2026-07-24) · v1.0.0 npm publish (2026-07-26)

**Pre-history** — the Oct 2025 rebrand method APCA's construction is inherited
from · One Token as the pre-existing colour layer

**1. Foundations & scope** — plain CSS, no build step, no framework binding ·
core never hardcodes a hex · new components land in LDS first, not back-ported ·
the deliberate ceiling: LDS must not absorb the gradient canvas, 54% is the
honest target

**2. Colour & contrast** — APCA, not WCAG 2.x · 11 symmetric steps tuned to a
fixed Lc curve, solved in OKLCH by binary search · One Token's
`mode × emphasis → seven roles`

**3. Emphasis ladder** — five roles assigned by object size (subtle for large
fields, soft for small components) · components paint from an explicit emphasis
list, so a new role is inert until registered · `emph-media` derives all seven
roles from `currentColor` · stroke-defined, not fill-defined · the 60% stroke
floor · `backdrop-filter: saturate()` rejected as default, kept as opt-in ·
inactive state as opacity, not faded tokens · ink deliberately deferred, then
settled · `.lds-glass` gets dedicated `--glass-*` tokens rather than the general
roles

**4. Typography** — semantic roles for UI, primitive scale inside components ·
mono signals machine-readability

**5. Motion** — `--dur-slow` + `--ease-decelerate` for large objects,
contributed up from palette

**6. Geometry & targets** — radius tokens shift per theme, never hardcoded ·
`--target-min` 44px floor, themes may raise

**7. Themes** — `theme-palette` ships no brand hue · its ramp is measured, not
invented · the type-scale correction

**8. Distribution** — npm-from-GitHub over jsDelivr · manifest at repo root ·
pin the tag · `ink` has no DOM and no dependencies

---

## Entry bar

An entry is **required** when a change:

- alters what a token means
- adds or removes a role, component, or theme
- reverses a prior decision
- sets a constraint other consumers must respect

Explicitly **exempt**: typos, `dist` rebuilds, new example pages, and additions
that follow an existing pattern without changing it.

### README rule

`design-system/README.md`'s "Adding to LDS" section gains:

> A change that alters a token's meaning, adds or removes a role, reverses a
> prior call, or sets a constraint consumers must respect requires an entry in
> [`decisions.md`](../docs/lew-design-system/decisions.md) **in the same
> commit**. Trivial changes — typos, `dist` rebuilds, new examples — are exempt.
> If you cannot name what the change ruled out, it is not a decision.

Discipline documented where a contributor already looks. Chosen over a
pre-commit hook, which would nag on trivial commits and get bypassed.

---

## Error handling

| Case | Behaviour |
|---|---|
| Malformed metadata line | Entry renders with a visible warning banner, placed in an "unsorted" group. **Never silently dropped** — silent drops are exactly how knowledge gets lost, which is the failure this doc exists to prevent. |
| `fetch` fails (opened via `file://`) | A message explaining that the page needs the preview server, plus a direct link to the raw `.md`. |
| JS disabled | Same fallback link. The markdown is fully readable on its own; the timeline is an enhancement. |
| Unknown `area` value | Rendered as-is and given a filter chip. Areas are open-ended by design. |
| Unknown `attribution` value | Fails the regex, so it lands in the malformed path. The three values are closed. |

No external dependencies, no CDN, no markdown library — the parser is a handful
of regexes over the strict conventions above.

---

## Testing

Manual, via the existing static preview server:

1. Every seed entry parses; count rendered equals count in the markdown.
2. An entry with a deliberately broken metadata line shows the warning rather
   than vanishing.
3. Gap markers appear between non-consecutive dates and nowhere else.
4. Day offsets match the real intervals, and prehistory entries do not shift
   day 0.
5. Milestones render without a glyph, do not expand, and are excluded from the
   filters; a milestone lacking `**Ruled out:**` does not trigger the warning.
6. Filters compose (attribution × area) and clear correctly.
7. Spine ticks scroll to the right day.
8. Keyboard: filter chips and every expand/collapse reachable and operable.
9. Mobile width ≤ 760px, matching the breakpoint the other docs pages use.
10. Attribution remains distinguishable in greyscale.
