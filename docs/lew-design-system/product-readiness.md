# LDS Product Readiness — evolving the system to carry a product app

**Status:** proposal, for review · **Date:** 2026-07-31
**Design:** Matt Lew · **Engineering review:** Will Chen
**Forcing function:** the Road Trip app (`wwchen/roadtrip`)

**For approval, start with the one-page brief:**
[`product-readiness-brief.md`](product-readiness-brief.md). This document is the
evidence behind it.

---

## What this document is

LDS today is a **surface and appearance system**. It resolves colour beautifully,
it measures contrast honestly, and it records why. It is not yet a system you can
build a dense, dark-first, data-heavy product app on top of — and Road Trip is
exactly that app.

This is a plan to close that gap **inside LDS, before anything in Road Trip is
touched.** It is infrastructure work. The deliverable of every phase here is a
component, a primitive, or a piece of tooling in this repo — not a migrated page
in another one.

That ordering is deliberate and it is the main thing to agree on before starting.
The alternative — port Road Trip onto LDS and backfill the system as gaps appear
— produces components shaped by one app's accidents. LDS's own governance already
says so: *"New shared component? It lands in LDS first, then repos consume it.
Never the reverse."* This document takes that rule literally.

**How to read it by role:**

- **Matt** — sections 3 through 7 are the design work. Each missing component
  comes with a proposed fit into the existing architecture and an open question.
  The proposals are starting positions to argue with, not specifications.
- **Will** — sections 8 through 11 are the engineering surface: what LDS lacks
  as a dependency, what Road Trip would have to change to consume it, and the
  sequencing. Section 12 is the direct ask.

This document changes nothing in `design-system/`, so per `CLAUDE.md` it needs no
`decisions.md` entry. Each component that actually lands from this plan will need
one, in its own commit — see section 9.

---

## 1. The finding, in short

### Road Trip has

A documented architecture that is genuinely good, and a codebase about a third of
the way to it.

- 8 real primitives with lifecycle (`mountComponent(container, config) →
  { dispose() }`), a three-file contract, event delegation, and disposal.
- A living catalog (`web/design-system/gallery.html`) mounted from real modules.
- A real guardrail: `tokens-usage.test.mjs` walks every `.css` **and** `.js` and
  fails CI on any `var(--rt-*)` that isn't defined.
- 82 lines of flat, dark-only tokens: 5 surfaces, 3 text levels, brand blue, map
  hues, status colours, 6 radii, 4 elevations.

And, against that:

- **No spacing tokens and no type-scale tokens at all.** Every padding, gap,
  margin, font-size and weight in the app is a raw literal.
- A **1,704-line inline `<style>` block** in `index.html` (407 rules) — the whole
  of `web/availability/` and `web/drawer/` has no owned CSS, contradicting the
  documented `<link>`-only rule.
- **Three parallel button systems** with the same class names and different
  values (`.rt-btn` 36px, `.cg-btn` 44px in `index.html`, `.cg-btn` 34px in
  `watches.html`). Three toggle-switch implementations.
- The campground palette **declared five times with different values** —
  `tokens.css` says `state #4e9a3f`, `layers.js` says `#558b2f`, `topbar.js` says
  something else again, plus inline legend dots and `topbar/state.js`.
- 156 hardcoded hexes, 16 untokenized font sizes (including fractional 13.5 /
  12.5 / 11.5px), 62 raw `border-radius` values where tokens exist.
- 210 legacy `cg-*` class references against 114 `rt-*`.

The token file is a fine colour inventory and not an architecture: it is flat, it
has no semantic indirection, and light mode would mean re-authoring it rather
than swapping a layer.

### LDS has

The architecture Road Trip is missing, and roughly a third of the components.

- **One Token semantics** — every component paints from seven roles
  (`--background --text --text-accent --text-subdued --icon --border
  --border-subdued`), resolved by five `.emph-*` classes × `.mode-dark`, with
  nine `.hue-*` classes repointing `--c-*`, and a single central status→hue map
  that is the only place a meaning touches a colour.
- **APCA done properly** — an 11-step curve with each step's Lc pinned, solved by
  binary search in OKLCH, verified against `apca-w3` across a 3,456-pair sweep,
  with published floors shipped as code in `lds-ink.mjs`.
- **A theme architecture proven across three genuinely different brands**, with
  `--density`, `--target-min`, `--corner-shape` and icon knobs.
- **`decisions.md`** — 72 decisions, 19 of them reversals, with a structural
  validator and a shared grammar.
- 15 components, 28 icons, zero build step, zero runtime.

And, against that:

```
toast:0  tooltip:0  table:0  radio:0  checkbox:0  tabs:0  accordion:0
breadcrumb:0  pagination:0  skeleton:0  spinner:0  progress:0  avatar:0
popover:0  slider:0  stepper:0  grid:0  sr-only:0  prefers-reduced-motion:0
```

Plus three structural holes covered in sections 5–7: forms, layout/responsive,
and the base layer.

### The thesis

**Road Trip is not adopting LDS's component library — it is adopting LDS's colour
architecture, contrast methodology, and governance model.** In exchange, it is
the forcing function that turns LDS from a portfolio system into a product
system, and it supplies the component patterns to do it.

The value flows both ways and mostly *upward*. `decisions.md` records the "LDS
first" rule as holding for *components*, while primitives discovered in a real
app are fair game to contribute up — which is most of what phases 0–4 are.

**Why it's worth doing now:** Road Trip is early and inconsistent, which is
normal and cheap to fix at this size. The outcome we want is not a particular
look — it's the ability to place *any* opinion on the app later and have it be a
theme rather than a rewrite. Road Trip is also the first real pressure LDS has
ever been under: dense tables, constant loading, genuine responsive layout, and
behavioural overlays. See the brief for that framing.

---

## 2. The audit gate — how each component gets reviewed

Nothing gets built from the list in section 4 until it has been through this.
The point is to catch, before code, the two failure modes LDS has already hit and
recorded as reversals: **a component that encodes a meaning the system resolves
elsewhere** (the `hue-info` grey vs `banner--info` blue contradiction, which cost
31 migrated call sites), and **a primitive with exactly one consumer**
(`--leading-negative`, shipped and removed).

For each component, answer six questions in writing:

**1. Does it already exist under another name?**
`.lds-list` replaced three near-identical `.rule-item` implementations. Check
before adding. Three similar sites are usually one missing abstraction; two are
usually a coincidence.

**2. What does it paint from?**
It must reference only the seven roles plus theme knobs. If it needs a colour the
seven roles can't express, that is a finding about the semantic layer, not a
licence to add a component-scoped variable. Say so and stop.

**3. Is its variation emphasis, hue, status, or structure?**
- *Emphasis* → compose with `.emph-*`, add nothing.
- *Hue* → compose with `.hue-*`, add nothing.
- *Status* → add the selector to the five `:where()` status lists and nowhere
  else.
- *Structure* → a real `--modifier`.

A `--primary` that is just "emph-strong with a name" is a smell. `.lds-btn`'s
named presets are the deliberate exception and the comment explains why; that
exception should not multiply.

**4. What does it need that the theme layer doesn't have?**
New theme knobs are the expensive kind of change — every existing theme must
declare them or inherit something wrong. The `--grey-*` incident is the
precedent: when the brand moved into core, all seven `.emph-plain` roles changed
for both themes in both modes, and the dashboard rendered on cream paper.

**5. What are its states, and are they derived?**
Hover, pressed, disabled, focus, loading, empty, error. Derived from `--c-*`
steps and `--bg-hover`/`--bg-pressed`, never hand-picked. If a state needs a
value the ramp can't produce, that is a finding about the ramp.

**6. What is its accessibility contract?**
Roles, required ARIA, keyboard model, focus behaviour, and the measured Lc for
every text pair it introduces — in **both** modes. APCA is polarity-asymmetric,
so contrast does not mirror; in dark mode step one notch lighter than the
light-mode complement.

**Output per component:** a short spec answering those six, plus the
`decisions.md` entry naming what was ruled out. The entry is written while the
reasoning is in hand, in the same commit — reconstructing it from the diff
afterwards is the thing the rule exists to prevent.

---

## 3. Audit of what already exists

Before adding anything, the 15 existing components need checking against product
use. Road Trip is denser, darker and more interactive than anything LDS has
carried, and several components have gaps that only show up under that load.

| Component | Product-readiness finding |
|---|---|
| `.lds-btn` | **Closest to ready.** Loading state and `aria-busy` missing. `--icon` is square at `--target-min`; Road Trip's compact contexts want a 28px variant (`double-confirm-button.js` already ships one) — is that a `--sm` icon button, or does `--target-min` genuinely bind? |
| `.lds-card` | Ready. `__body` takes `--th-body` (prose); in a dashboard most card bodies are not prose. Does a dense card want `--th-ui` throughout, and is that a theme decision or a modifier? |
| `.lds-field` | **The weakest link.** Styles a `label` and an `input`. Hardcoded `10px 12px` padding that ignores `--density`. No size variants, no states. See section 5. |
| `.lds-badge` | Ready, but overlaps `.lds-tag` — badge is mono/`--c-*`, tag is UI-font/emphasis-driven. The line between them should be written down before a third pill-shaped thing appears. |
| `.lds-tag` | Strong. Good precedent for how the rest should be built. |
| `.lds-chip` | Strong. `__caret` rotates on `[aria-expanded]` **but there is no panel for it to open** — see Popover, section 4. |
| `.lds-inline` | Exists to be a validation message; **nothing wires it to a field.** Closing this is part of the forms work. |
| `.lds-banner` | Ready. Legacy fixed-hex `.banner-*` shortcuts still ship alongside the status map — worth deciding whether those are deprecated. |
| `.lds-nav` | **A styled bar, not a nav system.** No active/`aria-current` state, no mobile behaviour, no dropdown. Road Trip's topbar is 2,057 lines; this cannot carry it as-is. |
| `.lds-modal` | **Paint only.** No `position:fixed`, no `inset`, no z-index, no scroll lock, no focus trap, no close affordance, no `<dialog>`/`::backdrop`. Road Trip's `modal.js` is materially more complete and should be the donor. |
| `.lds-glass` | Ready. Likely useful for map chrome. |
| `.lds-icon` | Ready. Sprite needs additions (see section 4). |
| `.lds-list` | Strong. Uses `border-left`/`padding-left` — logical properties, see section 8. |
| `.lds-mark` | Ready. Not needed by Road Trip. |
| `.lds-meta` | Ready and useful — Road Trip has a lot of machine-readable data. |

Two cross-cutting findings from this pass:

- **Focus is inconsistent.** `.lds-btn` and `.lds-chip` have `:focus-visible`;
  `.lds-field input`, `.lds-tag--interactive`, `.lds-nav__links a`,
  `.lds-list__item` and `.lds-modal` have none. Each existing rule hardcodes `2px
  solid` + `2px` offset against a different colour. **There is no shared focus
  token.** This should be fixed first — it is one primitive plus a sweep, and
  every component added later would otherwise reproduce the inconsistency.
- **Defined and unconsumed:** `--space-*`, `--grain`, `--weight-bold`,
  `--tracking-tighter/wider/widest`, `--leading-loose`, `--radius-xl`,
  `--size-7`, and — most consequentially — `--link`/`--link-dark`, which are
  resolved on **every** emphasis class and read by **no rule**. The README says
  colour must always travel with an underline; nothing enforces it.

---

## 4. Components to add

Grouped by whether the shape is settled. Each carries a proposed fit and the
question that needs Matt's call.

### Group A — the shape is known, the work is disciplined execution

These have close cousins in LDS or a strong donor in Road Trip.

| Component | Proposed fit | Open question |
|---|---|---|
| **Table** | Structural component, paints from `--background`/`--border-subdued`; zebra from `--bg-hover`. Density from `--density`. Road Trip's `data-table.js` is the donor. | Is a dense table a `--compact` modifier or purely `--density`? `theme-product`'s brief is "neutral, dense, dependable" and it already sets `0.92` — does a table need to go further? |
| **Tabs / segmented** | Structural; active tab is `.emph-soft`-equivalent, resolved not hardcoded. Road Trip's `tabs.js` (rail → segmented ≤560px) is the donor. | Are rail and segmented one component with a breakpoint, or two? This is the first component that *requires* section 6 to exist. |
| **Toggle** | Track/thumb from `--c-*` steps. Road Trip has three implementations to reconcile into one. | Does the checked track take `--c-600` (strong) or `--c-100` (soft)? Soft matches the tag/button tonal language; strong reads more like a switch. |
| **Checkbox / radio** | `checkbox` and `checkboxFilled` **already exist in the sprite** with no control to hang them on. | Sprite icons or CSS-drawn? Icons are consistent with the system; CSS is smaller and themes cleanly with `--icon-weight`. |
| **Select / textarea** | `textarea` is **already named in the `--corner-shape` list with zero paint rules** — it is in the system's mind and not its CSS. | Native `select` with a caret reset, or a chip-driven custom listbox? The chip already has the caret and the `aria-expanded` behaviour. |
| **Spinner / skeleton / progress** | Nothing in LDS currently says "waiting." Skeleton shimmer from `--bg-hover`. | Does skeleton animate at all? It interacts directly with the reduced-motion gap in section 8. |
| **Empty state** | Composition of icon + `--text-subdued` + optional action, not a new paint. | Is this a component or a documented pattern? It may fail question 1. |

### Group B — the shape needs design work

| Component | Why it's harder |
|---|---|
| **Popover / dropdown / menu** | Positioning is the hard part and CSS anchor positioning is not universally available. Needs a z-index scale (doesn't exist) and a decision on how much behaviour LDS owns. `.lds-chip__caret` is already waiting for this. |
| **Toast** | Long owed. Needs a stacking model, a region, and a motion spec — `--dur-slow`/`--ease-decelerate` already exist for exactly this class of thing and are currently unused. |
| **Drawer / sheet** | Same motion tokens, same gap. Road Trip's drawer is the core map interaction and its donor (`web/drawer/chrome.js`, 303 lines) is the most product-specific code in this plan. |
| **Modal, properly** | Promoting paint to behaviour. `<dialog>` + `::backdrop` is the modern answer and settles focus trap and scroll lock; it also constrains the markup contract. |
| **Nav, properly** | Active state, mobile behaviour, overflow. Road Trip's topbar suggests this may be two components (a bar and a menu) rather than one. |

### Group C — the honest ceiling

**Map chrome has no vocabulary in any design system**, and it is Road Trip's
centre of gravity: pins, legend dots, route lines, marker halos, availability
overlays.

The problem is categorical: `--rt-layer-*` and `--rt-avail`/`--rt-first-come` are
*data identity* and *meaning*. They must stay stable when the theme changes — a
federal campground does not become a different colour because the brand ramp did.
They cannot ride `--c-*`.

LDS's own rule points the way: *a hue is a colour, never a meaning*, and meanings
are bound centrally in the status map. The proposal is a **categorical scale**
as a sibling to the brand ramp — theme-stable, APCA-solved for the same floors,
bound to data identities in one place — with Road Trip as its first consumer.

Where this stops matters as much as where it starts. **LDS covers panels, forms,
dashboards and chrome. It does not cover the map.** A design system that tries to
own a product's signature surface stops being reusable and starts being that one
product's code. The gap is the product, not a shortfall — `decisions.md` already
holds this line elsewhere, and it should hold here.

### Icon sprite additions

The 28 icons are named for shape, not meaning. Product gaps: `chevronLeft`,
`chevronUp`, `arrowLeft`, `filter`, `sort`, `refresh`, `bell`, `mapPin`, `clock`,
`link`, `eye`/`eyeOff` (Road Trip's `secret-field.js` needs these), `dragHandle`.

---

## 5. The forms layer

Called out separately because it is the largest single hole and the one most
likely to be underestimated.

`.lds-field` covers a `label` and an `input`. A product app needs, and LDS has
none of: `textarea`, `select`, checkbox, radio, toggle, slider, number stepper,
date input, file input, search input (`search` is in the sprite; the control is
not), field error/success states, `:invalid` / `aria-invalid`, `:disabled` /
`:read-only`, placeholder colour, helper text, required marker, character
counter, input group / prefix / suffix, and `fieldset`/`legend`.

Two design decisions gate all of it:

**Does a field own its validation message?** `.lds-inline` exists and is unwired.
Either `.lds-field` grows a slot for it — which couples them and makes the
contract explicit — or they stay independent and the wiring is documented
convention. The first is more system, the second is more flexible.

**Where does the error colour come from?** A field in error is a *status*, and
the status map is `:where()`-bound at specificity 0 for exactly this reason. But
an error field is not tinted like an error banner — it is a neutral field with a
red border and a red message. That may mean the status map needs a second,
quieter binding shape, which is a change to the semantic layer rather than a
component. Worth resolving early; it is load-bearing for everything in Group A.

---

## 6. The responsive and layout layer

**There is not a single `@media` query in `lds.css`.** `--text-hero`'s `clamp()`
is the entire responsive behaviour of the system. There are no breakpoint tokens,
no container or measure token, no stack/cluster/grid helpers, no gap utilities,
and no z-index scale. `--space-*` is defined and consumed by nothing.

Road Trip's breakpoints are unstandardized literals: `480px`, `560px` (×4),
`640px` (×5), `700px`, `767px` (×2), `768px` (×4). So **neither system has this
and it has to be authored from scratch.** It is the most genuinely new design
work in the plan, and Tabs and Drawer both depend on it.

Four questions, in order:

**1. What are the breakpoints, and what are they named?** Road Trip's real
clusters are ~560 and ~640–768. Naming them is a decision about what they *mean*
(`--bp-compact`, `--bp-wide`) rather than what size they are.

**2. Container queries or media queries?** LDS components are designed to be
composed into arbitrary containers and to resolve emphasis standalone —
`.lds-card` inside a narrow drawer wants to behave as if the *viewport* were
narrow. That argues strongly for container queries, and container queries argue
for named `container-type` conventions as part of the component contract. This is
the single biggest architectural call in the document.

**3. Layout primitives, utilities, or neither?** A `stack`/`cluster`/`grid` set
would consume `--space-*` and give Road Trip somewhere to put the layout
currently living in a 1,704-line inline block. The risk is that a utility layer
is a different kind of system than LDS has been so far, and it is a one-way door.

**4. The z-index scale.** Modal, drawer, popover, toast and tooltip all stack,
and `.lds-modal` currently leaves stacking entirely to the consumer. Five
components in Group B cannot be built without this.

A fifth, quieter one: **the measure.** There is no `--measure` or `ch`-based prose
width despite an editorial brand, and `--leading-relaxed` was added specifically
because narrow measures needed it. The token that would define "narrow" doesn't
exist.

---

## 7. The base layer

`* { box-sizing: border-box }` is the entire reset.

- **No typographic element bindings.** `--text-hero`, `--text-title`,
  `--text-label` and friends are defined and **no selector or class applies
  them**. There is no `.lds-title`, no `.lds-hero`. Consumers hand-wire the
  size/leading/tracking triple — which is precisely the "take the whole
  composite" trap `CLAUDE.md` warns about, made structurally likely by the
  absence of a class that does it for you.
- **No link styling.** `--link`/`--link-dark` resolve on every emphasis class and
  no rule reads them. The underline rule is documented and unenforced.
- No `body` defaults, no heading/paragraph/list resets, no `img { max-width:100% }`,
  no `font: inherit` on form elements.

### Accessibility

- **No `.sr-only`.**
- **No `prefers-reduced-motion`** — every transition and the `--dur-slow` easing
  runs unconditionally. Road Trip has two blocks and is ahead here. This blocks
  the skeleton and toast work.
- **No `prefers-color-scheme`** — dark is class-only, so every consumer writes
  its own toggle and persistence. For Road Trip, which is dark-first, this
  matters in reverse: LDS's dark values were solved as the *second* case, and a
  dark-primary product needs them verified against the floors as the default.
- **No `forced-colors`** handling — an all-`currentColor`, all-`color-mix` system
  is unusually exposed here.
- No skip link, no landmark guidance, no per-component ARIA contract.
- **No logical properties discipline** — `.lds-list__item` uses `border-left` and
  `padding-left`, `.lds-chip__caret` uses `margin-right`. Cheap to fix now,
  expensive after twelve more components.

---

## 8. Tooling and distribution — the engineering surface

Mostly for Will. These are the reasons LDS is not yet safe to depend on, ranked.

**1. There is no CI.** No CSS lint, no token lint, no visual regression, no
tests. `check-decisions.mjs` validates the *record*, not the *system* — and by
explicit decision, structure and never reasoning.

**2. The contrast numbers are asserted in prose and never re-verified.** Every Lc
figure in `lds.css`'s comments is a measurement someone took once. `lds-ink.mjs`
is right there, has no DOM and no dependencies, and could assert all of them in
CI. **This is the highest-value piece of tooling in the document** — it is what
makes the APCA rigour durable instead of a snapshot, and it is a few hours.

**3. The APCA generator is not in the repo.** `apca-palette.md` points at
`/tmp/claude-501/apca_palette.py`. The ramps cannot be regenerated or extended
from this checkout, which directly contradicts "adding a hue means running the
generator." Section 4's categorical scale **requires** this to exist. It is a
hard blocker, not a nice-to-have.

**4. `dist/` is hand-maintained with no source.** There is no build, so there is
nothing that could drift-detect source against dist — a deliberate decision, but
it means "rebuild dist" is a manual copy and correctness rests on discipline.

**5. `tokens.json` is a stale stub.** It says `grey.900 #1C1C1C`, `#FFFFFF` plain
background, `text.body 13px` — none of which match `lds.css`. Nothing generates
it and nothing consumes it. Either generate it from `lds.css` or delete it;
shipping a token file that lies is worse than shipping none.

**6. Distribution vs. Road Trip's stack.** LDS installs as
`npm i "github:matthewlew/matthewlew.github.io#v1.0.0"`, with a load order that
is load-bearing: **hues → core → theme**. Road Trip has **no `package.json` and
no build step at all** — Kotlin/Ktor serves raw files, and its only npm presence
is a Playwright helper unrelated to the web app. So consumption is either vendor
`dist/` into `web/`, or introduce npm purely for CSS. **This needs Will's call
and it shapes the Road Trip side of the plan.** Note the CDN `<link>` snippet in
`adoption-audit.md` is stale — jsDelivr and public npm were both ruled out.

**7. No framework adapters.** The audit's shadcn bridge for `tripblend` was never
written. Not on Road Trip's path (it has no framework), but the same technique is
what makes Road Trip's migration cheap — see phase 5.

---

## 9. Sequencing

The brief states this as three steps. These are the same three, at working
detail:

| Brief | Here |
|---|---|
| **1. Fix what's already broken** | Phase 0, plus the Road Trip hex/contrast ratchet noted at the end of this section |
| **2. Bring Road Trip's components into LDS** | Phases 1–4 |
| **3. Road Trip adopts** | Phase 5 |

Phases 0–4 are entirely in this repo. Road Trip is not touched until phase 5.

**Phase 0 — the floor.** Contrast assertions in CI from `lds-ink.mjs`. Recover
the APCA generator. A shared focus token, applied across all 15 existing
components. `prefers-reduced-motion`, `.sr-only`, logical properties. Resolve
`tokens.json`. *Everything after this is safer, and none of it is design work.*

**Phase 1 — the semantic layer questions.** Two open items that are changes to
the architecture, not components, and that gate the component work: the quiet
status binding for form errors (section 5), and the categorical scale for data
identity (section 4, Group C). Settle these before building on them.

**Phase 2 — the base and layout layers.** Typographic element bindings, link
styling, the reset. Then section 6 in its stated order: breakpoints, the
container-vs-media call, layout primitives, the z-index scale. **Phase 3 cannot
start without the z-index scale, and Tabs and Drawer cannot start without the
breakpoints.**

**Phase 3 — forms.** Section 5 end to end. Largest single body of work; unblocks
most of Group A.

**Phase 4 — components.** Group A, then Group B, each through the section 2
gate, each with its `decisions.md` entry in the same commit. Icons alongside.

**Phase 5 — Road Trip.** Only now. A `theme-roadtrip.css` forked from
`theme-product`, then the bridge: redefine `tokens.css` so `--rt-*` become
aliases over LDS's resolved roles rather than renaming 114 call sites —

```css
:root.theme-roadtrip.mode-dark.emph-plain {
  --rt-bg:         var(--background);
  --rt-text:       var(--text);
  --rt-muted:      var(--text-subdued);
  --rt-border:     var(--border);
  --rt-brand-text: var(--text-accent);
  --rt-r-md:       var(--radius);
}
```

Every existing Road Trip component keeps working unchanged and inherits light
mode and hue swaps for free. Only after that does the `cg-*` sweep and the
dismantling of the 1,704-line inline block begin.

**One thing Road Trip should do immediately and independently of all of this:**
extend `tokens-usage.test.mjs` into a raw-hex and raw-px linter. It already walks
every `.css` and `.js`. Allowlist the 156 existing hexes, forbid new ones,
ratchet down. The five conflicting campground palettes are a bug today, not
migration debt — and the `var(--rt-x, #hardcoded)` fallback pattern needs killing
because it defeats the existing test by design.

---

## 10. Explicitly out of scope

- The map surface (section 4, Group C). LDS supplies a categorical scale; it does
  not own pins, route rendering, or overlays.
- Road Trip's `topbar.js` as-is. 2,057 lines with CSS in template literals; it
  gets decomposed against LDS's nav, not ported.
- A build step for LDS. Plain CSS with no runtime is a recorded structural
  decision and nothing here needs it reversed.
- Migrating other repos. `palette`, `tripblend`, and the static sites have their
  own paths in `adoption-audit.md` and are unaffected.

---

## 11. Open questions — Matt

1. **Container queries or media queries?** (§6) The biggest architectural call
   here, and the one that most shapes what the components look like.
2. **Does the error status get a quieter binding?** (§5) Blocks the forms work.
3. **Categorical scale — sibling to the brand ramp, or something else?** (§4C)
4. **Does `.lds-field` own its validation message?** (§5)
5. **Layout primitives: utilities, components, or documented patterns?** (§6) A
   one-way door.
6. **Where is the badge/tag line?** (§3) Before a third pill appears.
7. **Are the legacy `.banner-*` fixed-hex shortcuts deprecated?** (§3)
8. **Is dark mode promoted to a first-class resolution** rather than the second
   case? Road Trip is dark-first and this is the deepest mismatch between the two
   systems.

## 12. Open questions — Will

1. **How does Road Trip consume LDS?** (§8.6) Vendor `dist/` into `web/`, or
   introduce npm for CSS in a repo that has no frontend build? This shapes
   phase 5 and can be answered now, independently of everything else.
2. **Is the bridge approach sound?** (§9, phase 5) Aliasing `--rt-*` over LDS's
   resolved roles rather than renaming 114 call sites — is the indirection
   acceptable long-term, or is it a permanent layer nobody removes?
3. **Can `tokens-usage.test.mjs` become the hex/px ratchet?** (§9) Worth doing
   regardless of whether this plan proceeds.
4. **Does the phase ordering survive contact with Road Trip's roadmap?** Phases
   0–4 are weeks of infrastructure with no user-visible change. If that is not
   fundable, the alternative is to bring components up opportunistically as
   Road Trip needs them — which is cheaper per step, worse per component, and
   contradicts the "LDS first" rule. That trade is a real one and worth naming
   rather than assuming.
5. **What is the CI surface?** (§8.1) LDS has none; Road Trip has a working one.
   Is there a reason not to reuse the same shape?
6. **Does anything in Road Trip's `mountComponent` contract conflict with LDS
   being CSS-only?** LDS ships no JS except `lds-ink.mjs`. Components in Group B
   (modal, drawer, popover, toast) need behaviour, and Road Trip already has it.
   Does that behaviour move into LDS — making it no longer CSS-only — or stay in
   Road Trip with LDS supplying paint alone?

Question 6 is the one with the longest shadow. LDS being pure CSS is a recorded
structural decision, and every Group B component is a reason to reconsider it.
It should be decided deliberately, once, rather than eroded one component at a
time.
