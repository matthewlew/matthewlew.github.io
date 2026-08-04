# LDS v6 — overlays and data display

Spec for the next Layer 3 batch. Four workstreams: **overlay docking**, **table**,
**list row**, **menu**. First consumer is roadtrip.

Written before the code so the four stay coherent — a table row, a list row and a
menu item are the same horizontal anatomy at three densities, and if they are
built independently they will not look like it.

Not a decision record. Each piece earns its `decisions.md` entry when it lands,
naming what it ruled out. This file is the target; that file is the history.

---

## 0. What already exists

Checked against `dist/lds.css` at `2c4d20b`, not from memory.

| | State |
|---|---|
| Centred modal | ✅ `.lds-modal`, alert/confirm case |
| Bottom sheet | ✅ `.lds-modal--sheet`, docks below 560px |
| Modal header, close, scrolling body | ✅ `2c4d20b` |
| Short-viewport handling | ✅ `--bp-short` 520px |
| Breakpoint tokens | ✅ `--bp-sm/md/lg/xl` |
| Table | ⚠️ padding, borders, hover only |
| List row | ❌ `.lds-list` is the prose do/don't list, not a row |
| Menu | ❌ nothing |
| Media chrome | ✅ `.emph-media`, `.lds-glass` — consumption, not construction |

And on the roadtrip side:

- `.rt-data-table` has sort **logic** (`data-table.js`) and a `▲`/`▼` **text**
  indicator, but no caret, no sticky header, no frozen column.
- `.rt-watch-table-wrap { overflow-x: auto }` is the only overflow answer, which is
  the horizontal-scroll problem this spec exists to fix.
- No `position: sticky` anywhere in the repo.
- No list-row or menu primitive.

---

## 1. Overlay docking

### The decision

One component, three dock positions, chosen by **what the overlay is for** — not
three components.

| Dock | For | Class |
|---|---|---|
| Centre | Alerts, confirmations, anything under ~2 lines of decision | default `.lds-modal` |
| Bottom | The same content, on a phone | `.lds-modal--sheet` (built) |
| Right | Detail, edit, and filter panes that keep their context visible | `.lds-modal--side` (new) |

The distinction that matters: **a centred modal interrupts, a side sheet
accompanies.** If dismissing the overlay to look at the thing behind it would lose
work, it is a side sheet. If the overlay *is* the decision, it is centred. An alert
must never be a side sheet — pushing a destructive confirmation to the edge of a
1440px display puts it outside the user's gaze.

### Responsive collapse

A side sheet is a desktop affordance. Below `--bp-md` (768px) there is no "beside"
— the content it accompanies is already gone.

```
≥ 768px   .lds-modal--side  → docked right, full height, width from the size scale
< 768px   .lds-modal--side  → bottom sheet (inherits --sheet's paint and handle)
< 520px height              → scrollable-top, existing --bp-short rule
```

So `--side` and `--sheet` converge below the breakpoint rather than conflicting.
One class on the markup, correct at every width — the same property that makes
`--sheet` work today.

### Size scale

`max-width: 420px` is currently hardcoded, which is why every consumer that needed
something wider re-declared it. Replace with a token scale, defaulting to the
current value so nothing shifts:

```
--modal-sm    360px   confirmations
--modal-md    420px   the current default
--modal-lg    560px   forms
--modal-xl    720px   tables, side-by-side content
```

Applied as `.lds-modal--sm/lg/xl`; `md` is the default and needs no class. For a
side sheet the scale drives **width**, and the sheet is full-height regardless.

### Behaviours to get right

- **Scrim click dismisses; content click does not.** A CSS hook only — LDS has no
  runtime, same posture as drag-to-dismiss shipping as `.is-dragging`.
- **The side sheet slides from the right, the bottom sheet from the bottom**, both
  under `prefers-reduced-motion`.
- **Focus and `inert` are the consumer's job.** LDS ships the paint; it cannot own
  a focus trap without a runtime. Say this in the docs rather than leaving it
  implied — the omission is the accessibility bug.
- **Stacking is out of scope.** A sheet over a modal is a design smell; if roadtrip
  needs it, that is a separate decision.

---

## 2. Table

Four gaps, in priority order.

### 2a. Wrapping — the actual bug

`th` is `white-space: nowrap` and `td` is not, in both systems. The result is a
table that refuses to compress its headers, blows past the viewport, and hands the
user a horizontal scrollbar for content that would have fitted in one column had
it been allowed to wrap.

The fix is not "let everything wrap" — a wrapped date column is worse than a
scrolled one. It is **per-column intent**, declared by the consumer:

| Class | Behaviour |
|---|---|
| `.lds-table__col--wrap` | Wraps freely. Titles, descriptions, addresses. |
| `.lds-table__col--nowrap` | Never wraps. Dates, counts, status, actions. |
| `.lds-table__col--truncate` | One line, ellipsis, full value in `title`. IDs, URLs. |

Default becomes **wrap** for `td` and **wrap** for `th` too. `nowrap` becomes
opt-in rather than the unconsidered default. A column that genuinely cannot wrap
says so.

Pair with `--col-min` per column so a wrapping column has a floor and cannot
collapse to one character per line.

### 2b. Sticky header

`position: sticky; top: 0` on `th`, with a background — a transparent sticky header
lets rows ghost through it, which is the failure mode everyone hits first. The
background must come from `--surface-raised` (Layer 2b) so it is correct in dark
mode without a second rule.

Requires the scroll container to be the page or a `max-height` wrapper, not
`overflow: auto` on an ancestor with no height. Document the constraint; it fails
silently otherwise, which is exactly the class of gotcha `CLAUDE.md` says to write
down.

### 2c. Frozen columns

`position: sticky; left: 0` on a designated column, `.lds-table__col--freeze`. Same
background requirement. Two constraints worth stating:

- **Only the leading column(s) freeze.** Freezing a middle column is not a thing.
- **A frozen column needs a right edge** — a border alone disappears when the
  content scrolls under it. Use a shadow that only appears once scrolled, if that
  is reachable without JS; otherwise a permanent border, and say why.

Freezing is a desktop affordance. Below `--bp-md` a frozen column eats the width it
was meant to preserve — disable it there.

### 2d. Sort affordance

The logic exists in roadtrip; the affordance does not. Ship a **caret**, not a text
`▲`, so it takes `--icon-size-sm` and `currentColor` like every other icon.

Three states, and the third is the one that gets forgotten:

| State | Caret |
|---|---|
| Sortable, unsorted | Dimmed, both directions, visible on hover/focus |
| Sorted ascending | Solid, up |
| Sorted descending | Solid, down |

Showing the caret **only** on hover fails on touch, where there is no hover — the
user cannot discover that the column sorts at all. The unsorted caret must be
present at rest on coarse pointers. `lds.css` already has an `@media (pointer:coarse)`
block to hang that on.

The header must be a real `<button>` inside the `th`, not a `th` with a click
handler — that is what carries keyboard and screen-reader semantics.

### 2e. What a table stops being

Below `--bp-sm` a data table with more than ~3 columns is not a table. Rather than
pretend, the guidance is: **collapse to list rows.** Which is why the next section
exists, and why it should be built in the same batch.

---

## 3. List row

The one component with no equivalent anywhere. `.lds-list` is prose; this is
different enough to need its own name — `.lds-row`.

### Anatomy

```
┌──────────────────────────────────────────────────────────┐
│ [lead]  Title                         [trail label] [>]   │
│         Subtitle                      [trail meta]        │
└──────────────────────────────────────────────────────────┘
   ↑      ↑                             ↑                ↑
   leading  content                     trailing      affordance
```

Every slot optional. The row is a flex container with three regions; the content
region is the flex child that grows, and it gets `min-width: 0` — without it the
subtitle refuses to truncate and pushes the trailing region off-screen. That is the
same `min-width: auto` trap already documented on `.lds-banner`, and it will bite
here for the same reason.

| Slot | Holds |
|---|---|
| Leading | Checkbox, radio, avatar, image, icon, or nothing |
| Content | Title (required), subtitle, third line |
| Trailing | Label, secondary meta, badge, toggle |
| Affordance | Chevron, or nothing |

### Selection

Three modes, and they are not interchangeable:

- **None** — the row may still be tappable (navigates).
- **Single** — radio, or a checkmark on the selected row.
- **Multi** — checkbox in the leading slot.

A row cannot be both *navigable* and *multi-select* from the same tap target. If it
needs both, the checkbox is its own target and the rest of the row navigates — two
targets, both meeting `--control-xl` (44px). This is the rule that stops the
component becoming ambiguous later.

### Sizing

Heights come from the existing `--control-*` scale rather than new tokens:

| Variant | Height | Content |
|---|---|---|
| `.lds-row--compact` | `--control-xl` (44) | Title only |
| default | ~`--control-2xl`+ (56) | Title + subtitle |
| `.lds-row--roomy` | ~72 | Title + subtitle + image |

The whole row is the target, so the 44px floor is met by every variant.

---

## 4. Menu

Nothing exists. Needed: a surface, items, separators, and **nesting**.

### Structure

`.lds-menu` is a surface at `--surface-overlay` — same plane as the modal, so it
takes the same token rather than inventing an elevation. Items reuse the **list row
anatomy** at compact density: leading icon, label, trailing shortcut or state.
Building the list row first is what makes this cheap.

### Nesting

Two behaviours, and the choice is by pointer, not by preference:

- **Fine pointer** — submenu opens beside the parent on hover/focus, parent stays
  visible. The classic cascade.
- **Coarse pointer** — tapping a parent **replaces** the panel with the submenu,
  plus a back affordance. Cascading submenus on touch are unusable: they open under
  the thumb and there is no hover to keep them alive.

This is the user's "tap on one item to go into a nested menu" — it is the touch
branch, and it should be the branch the markup is designed around, with the cascade
as the enhancement.

### The hard part

Positioning. Keeping a menu inside the viewport, flipping it when it would overflow,
and anchoring it to a trigger is a **runtime** problem, and LDS has no runtime and
should not grow one for this.

Options, in preference order:

1. **CSS anchor positioning** (`anchor-name` / `position-anchor`) — no JS, but
   support is not yet universal. Needs a fallback that is merely imperfect, not
   broken.
2. **Popover attribute** (`popover`, `popovertarget`) — native top-layer and
   light-dismiss with zero JS, and it composes with anchor positioning.
3. **Ship the paint, document the positioning as the consumer's job** — honest, and
   consistent with the focus-trap posture on modals.

Recommendation: **2 + 1 with 3 as the stated fallback.** `popover` alone buys
top-layer and dismissal, which is most of the value.

---

## 5. Build order

1. **List row** — no dependencies, unblocks two other pieces.
2. **Table** — wrapping first (it is the live bug), then sticky, sort caret, freeze.
   Collapse-to-rows needs §3.
3. **Overlay docking** — side sheet + size scale. Independent; can run parallel.
4. **Menu** — wants §3's anatomy and §1's overlay surface.

Map pins are explicitly **out of scope** for this batch.

---

## 6. Consumer mapping — roadtrip

| LDS piece | Replaces |
|---|---|
| Table wrapping + freeze | `.rt-watch-table-wrap { overflow-x: auto }` |
| Sort caret | the `▲`/`▼` text in `data-table-template.js` |
| Sticky header | nothing — new capability |
| List row | nothing — new capability, and the phone view of `WatchTable` |
| Side sheet | `settings-modal`, `profile-panel` if they want context retained |
| Menu | `.rt-watch-table-actions` — three icon buttons per row that should be one |

That last one is worth calling out: every row currently carries a 3-column grid of
icon buttons. A menu collapses it to a single kebab, which is what buys the width
the table needs on a phone.

---

## 7. Open questions

- **Does roadtrip want the token bridge first?** `--rt-*` → LDS is on the backlog as
  critical. Building v6 against `--rt-*` and bridging afterwards means doing the
  work twice.
- **Kebab vs. hamburger, X vs. circle-X** — the row and menu work will force these
  calls. They belong in the OpenIcons North Star, not here, but v6 is what surfaces
  them.
- **Sticky + frozen together** — the intersection cell (frozen column, sticky header)
  needs `z-index` above both. Verify rather than assume.
