# LDS v6 — overlays and data display

Spec for the next Layer 3 batch. Four workstreams: **overlay docking**, **table**,
**list row**, **menu**. First consumer is roadtrip.

Written before the code so the four stay coherent — a table row, a list row and a
menu item are the same horizontal anatomy at three densities, and if they are
built independently they will not look like it.

Not a decision record. Each piece earns its `decisions.md` entry when it lands,
naming what it ruled out. This file is the target; that file is the history.

**Status: shipped.** All four landed in `lds.css`, with eleven entries in
`decisions.md`. Two calls changed during the build and the entries, not this
file, carry the final reasoning: the header title is centred (a reversal), and
the table's border model moved to `separate` so sticky cells behave.

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
something wider re-declared it. Replace with a scale — but the steps have to be
*derived*, not picked, or the next person adds a 640 because it looked right.

```
--modal-sm    360px    confirmations
--modal-md    420px    the current default
--modal-lg    560px    the PROSE CEILING — see below
--modal-xl    720px    two columns, or a table
--modal-2xl   960px    a workspace
--modal-full  min(100vw - 2*var(--modal-gutter), 1280px)
```

**`--modal-lg` is the measure ceiling, and that is what fixes the scale.** At
`--text-body` 18px, 560px is ~62 characters — the top of the comfortable measure
band. Everything at or below `lg` is one column of prose. Everything above it is
not, by definition: if you need more than 560px, you no longer have a single
column of text, you have two columns or a table. That is the seam, and it is why
`xl` and `2xl` exist as separate steps rather than as "bigger".

`--modal-full` is deliberately **not `100vw`**. Full-screen on a 5K display is
nobody's intent — what they mean is "as large as is useful", which is a cap.
1280px is that cap. And because the gutter collapses to 0 below `--bp-sm`,
`--modal-full` becomes genuinely edge-to-edge on a phone from the same
expression. One rule, both behaviours — the same convergence trick that makes
`--side` and `--sheet` one class.

```
--modal-gutter  24px          (0 below --bp-sm)
```

The actual applied width is `min(100%, var(--modal-w))`, so a modal never exceeds
its declared size but always shrinks with the viewport. The declared value is a
**ceiling, not a width.**

### Height, which the current code gets wrong

`max-height: min(80vh, 640px)` is hardcoded on every modal with a header. That is
fine for `sm`–`lg` and actively wrong for `2xl` and `full`: a workspace modal
strangled to 640px tall is the bug that sends people back to a full page.

Height tracks the width step:

| | `--modal-h` |
|---|---|
| `sm`–`lg` | `min(80vh, 640px)` — unchanged |
| `xl`, `2xl` | `min(88vh, 800px)` |
| `full` | `min(100vh - 2*var(--modal-gutter), 900px)` |

### Side sheet width is capped by ratio, not by pixels

A side sheet **accompanies**. That word has a measurable consequence: it must
never take half the screen, because at half neither side is primary and the
"accompanies" claim is just untrue.

```css
.lds-modal--side { width: clamp(320px, var(--modal-w), 40vw); }
```

| Viewport | `--modal-lg` (560) resolves to |
|---|---|
| 1024px | 410px — the 40vw cap bites |
| 1440px | 560px — the declared size |
| 2560px | 560px — still the declared size, not 40% |

The floor matters as much as the cap: below 320px a side sheet is a column of
broken labels. And below `--bp-md` none of this applies — it is a bottom sheet
there, and a bottom sheet needs no width cap at all, because it only exists below
the breakpoint. That is worth noticing: **the bottom sheet cannot be too wide.**
The geometry rules it out rather than a token doing so.

### 1-bis. So which size does a given modal get?

The direct answer to "does the content dictate it": **no, and it must not.**

CSS cannot measure content and choose a token. But even if it could, auto-sizing
is the wrong behaviour: the same dialog would be one width while loading and
another once loaded, one width in its error state and another without. A modal
that changes size as its own content settles reads as broken. **Stability beats
fit.**

So the size is **declared** — but it is declared from the content's *shape*, not
from taste. Which makes it a lookup, not a judgement:

| Content shape | Size |
|---|---|
| One question, two buttons | `sm` |
| A short form, ≤ 4 fields | `md` (default) |
| Prose, or a form that scrolls | `lg` |
| Two columns, or a table ≤ 5 columns | `xl` |
| A table that scrolls both ways, a map, an editor | `2xl` |
| A task that owns the session | `full` |

**And the lever is exposed.** The named classes do nothing except set one custom
property:

```css
.lds-modal--lg { --modal-w: var(--modal-lg); }
```

so a designer who needs 640px sets `--modal-w: 640px` inline and takes it. Named
class carries *intent* and survives a redesign; the raw property is the escape
hatch. That is the same split LDS already uses for emphasis — `.emph-soft` is the
intent, the underlying tokens are the override — so it needs no new concept.

The rule that keeps this honest: **if you find yourself overriding `--modal-w` in
three places, that is a missing step in the scale, not three exceptions.**

### Behaviours to get right

- **Scrim click dismisses; content click does not.** A CSS hook only — LDS has no
  runtime, same posture as drag-to-dismiss shipping as `.is-dragging`.
- **The side sheet slides from the right, the bottom sheet from the bottom**, both
  under `prefers-reduced-motion`.
- **Focus and `inert` are the consumer's job.** LDS ships the paint; it cannot own
  a focus trap without a runtime. Say this in the docs rather than leaving it
  implied — the omission is the accessibility bug.
### 1a. The header: large title and collapsed bar

The header today is one fixed row — title at `--text-subhead`, left, truncating.
There is no large state, no collapsed state, and no transition between them.

**The architecture that makes this work without a runtime: the large title is
content, the bar is chrome.**

```
┌─────────────────────────────────┐   ← bar: chrome. Always present.
│  ‹      Trip settings       ✕   │     Fixed --control-xl. Never scrolls.
├─────────────────────────────────┤
│                                 │   ← body: the scroll region
│  Trip settings                  │     large title lives HERE, as its
│                                 │     first child. Scrolls away because
│  Name                           │     it is content, not because
│  ┌───────────────────────────┐  │     anything animated it.
```

The large title scrolls out of view on its own — no JS, no scroll listener,
nothing to fall back from. That is the whole trick, and it is why this is
buildable in a system with no runtime.

What scroll-driven animation adds is only the *polish*: cross-fading the bar's
small title in as the large one leaves, and revealing the bar's divider once the
body has scrolled. Both degrade to "always visible", which is correct, just less
elegant.

```css
/* Fallback: bar title visible. Mildly redundant at rest, never broken. */
.lds-modal__header .lds-modal__title { opacity: 1; }

@supports (animation-timeline: scroll()) {
  .lds-modal__header .lds-modal__title {
    opacity: 0;
    animation: lds-title-in linear both;
    animation-timeline: scroll(nearest);
    animation-range: 0 var(--modal-title-collapse, 48px);
  }
}
```

Firefox has this behind a flag, so the `@supports` branch is load-bearing, not
defensive.

### 1b. Sizes and alignment

| | Role | Face | Align |
|---|---|---|---|
| Large title | `--text-subhead` (28px) | `--th-display` | Left |
| Bar title | `--text-body` (18px) | `--th-ui` | see below |

Both take their **whole composite** — leading and tracking, not just the
font-size. Taking only the size is the documented way to drift.

No new size tokens. The large title is the size `.lds-modal__title` already is,
so a modal that does not opt into the collapsing header is unchanged.

**Alignment answers your question directly, and it falls out of the rule already
in §1:**

> Centred when the overlay **interrupts**. Left when it **accompanies**.

| Dock | Bar title |
|---|---|
| Centre modal | Centred |
| Bottom sheet | Centred |
| Side sheet | **Left** |

A centre modal and a bottom sheet are *screens* — they own the user's attention,
and a centred title reads as the title of that screen. A side sheet sits beside
live content and its title competes with the page's own hierarchy; left-aligning
it keeps it subordinate, which is what "accompanies" means.

Centring is done with a **three-column grid**, not `text-align`. The left and
right slots get equal `minmax(var(--control-xl), auto)` so the title stays
optically centred when a back button appears — with `text-align:center` it
shifts sideways the moment the stack grows, which is the thing that makes a
nested flow feel unstable.

The large title is left-aligned in **all three docks**. A centred 28px title over
left-aligned body content has no edge to align to.

### 1c. Nesting, back, and close

A nested overlay is a **stack**, not a second overlay. One scrim, one panel, the
panel's content replaced — the same replace-not-cascade model §4 uses for touch
menus.

**Order: back left, close right. Always, and they are never the same target.**

| | Does | Present when |
|---|---|---|
| `‹` back | Pops **one** level | Stack depth > 1 |
| `✕` close | Dismisses the **whole stack** | Always |

Back is directional and belongs at the origin edge; close is terminal and belongs
at the far edge. Putting close on the left, or replacing back with close at depth
1, makes the affordance move under the user's thumb between panels.

**Tapping the scrim closes the entire stack. It does not go back one level.**

The scrim belongs to the outermost overlay — the user tapped outside *everything*,
not on the parent panel. Popping one level there means an outside tap does
something different depending on how deep you are, and the user cannot see the
depth. Ruled out for that reason.

Consequence worth stating: **the deeper the stack, the more an accidental scrim
tap costs.** Which is what the next section is for.

### 1d. Leaving with unsaved work

The governing rule: **dismissal is free only when it is reversible.**

| State | Scrim / Esc / swipe / close |
|---|---|
| No edits | Closes. No prompt. |
| Edits, draft preserved | Closes. No prompt. |
| Edits, lost on close | **Confirm** |

The middle row is the one to design toward. A prompt is a tax for failing to
preserve the work; where a draft can be kept, keep it and skip the dialog. Do not
add a confirmation to a flow that could have been made reversible instead.

When the confirm is genuinely needed:

- It is a **centred modal, never a sheet** — it is an alert, and §1 already rules
  alerts out of the side dock. It stacks above the overlay it is guarding.
- **The destructive action is "Discard", not "Close".** Name the loss. "Are you
  sure you want to leave?" hides which button destroys the work.
- **"Keep editing" is the default and holds focus.** The destructive button is
  never the one Enter lands on.

And the gesture consequence:

> **With unsaved work, a sheet does not swipe-dismiss.** The drag rubber-bands and
> snaps back; the close button is what routes to the confirm.

A swipe is a low-effort, easily-accidental gesture. A dialog fired *by* a swipe
interrupts a gesture already in flight and reads as the system fighting the user.
Removing the dismissal path entirely is better than guarding it. The alternative
— swipe fires the confirm — was ruled out on that basis.

### 1e. The handle

The rule, stated once so it stops being a per-case judgement:

> **A handle appears if and only if the panel is swipe-dismissable.**

The handle is a *promise that the thing drags*. Today it is correctly hidden on
the centred modal, whose comment already says it "affords a drag that does
nothing" — this generalises that call rather than adding to it.

| Dock | Handle |
|---|---|
| Centre modal | No — does not drag |
| Bottom sheet | Yes |
| Side sheet ≥ 768px | No — there is no swipe gesture with a mouse |
| Side sheet < 768px | Yes — it *is* a bottom sheet there |

The unsaved-work case keeps the handle: the panel still drags and rubber-bands,
so the promise still holds. Only the dismissal is gated. Hiding it would make the
layout jump on first keystroke.

### 1f. Images

Both, as you suggested — and they are genuinely different components, not a
styling preference.

| | Class | For |
|---|---|---|
| Full-bleed | `.lds-modal__media` | The subject of the overlay. A campsite photo, a map preview. |
| Inset | `.lds-modal__media--inset` | An illustration supporting text. Sits in body padding, takes `--radius-md`. |

Full-bleed rules:

- Aspect from `--media-ratio` (default 16/9), never a fixed height — a fixed
  height crops differently at every panel width.
- **As the panel's first child it inherits the panel's top corner radius**; in a
  sheet that is top-only. Below a bar it is square, because the bar already owns
  the rounded edge.
- It escapes body padding via negative margin, so it must be a direct child of
  the body — not nested in a wrapper.

**This is the media-chrome use case you flagged.** A full-bleed hero with the
close button *on* the image is exactly what `.emph-media` and `.lds-glass` were
built for: the close button takes `emph-media` and resolves against the artwork
instead of assuming a white knockout. It is the one-token media path with a real
consumer, rather than a showcase demo.

Cost: `emph-media` is backdrop-relative, not mode-relative, so `.mode-dark` must
not reach it — the existing rule in `lds.css` already handles this, but a modal
is the first place a consumer will be tempted to override it.

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
3. **Overlay docking** — side sheet + size scale, then the header system (§1a–1f).
   Independent of §2/§3; can run parallel. Within it: bar and large title first,
   then the stack, then media. Scroll-driven collapse last — it is polish over a
   layout that already works without it.
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
