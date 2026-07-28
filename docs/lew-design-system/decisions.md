# LDS — decisions and why

Why the Lew Design System is shaped the way it is.

This is not a changelog. It records **decisions** — the ones where something was
ruled out — so the reasoning survives the commit that carried it, and so a
settled question doesn't get re-opened by accident. Organised by area of the
system, not by date: read it front to back and the system should feel logical.

**Timeline view:** [decisions.html](decisions.html)

Each entry carries one metadata line:

```
`date` · `area` · `attribution` · `quality` · `commit`
```

**Quality** is the weight of the change. `reversal` is the one that matters most:
it means this was already tried the other way, and the entry says why it didn't
hold.

| | |
|---|---|
| `minor` | A refinement inside an existing decision. |
| `notable` | A new role, component, or constraint. |
| `structural` | Changes the shape of the system. |
| `reversal` | Undoes a previous call. **Read before re-deciding.** |

**Who decided** — a human, a measurement, or the AI:

| | |
|---|---|
| `human` | Matthew's call. Taste, product, or scope. |
| `measured` | The measurement decided it. Neither person nor AI had latitude — the numbers only went one way. |
| `ai` | AI-proposed, human-approved. |

The split as it stands, across the 71 decisions: **45 human · 24 measured · 2 ai**.
The judgment is human; the verification is machine.

Every entry names what it **ruled out**. If a change ruled nothing out, it is a
fact about the system, not a decision, and it belongs in the README. Some
entries add a **Cost** line: the live gotcha you need to know before you touch
that area.

---

## Milestones

Events, not decisions. They anchor the timeline; they have no "ruled out".

### Spec written

`2026-07-14` · `milestone` · `human`

LDS begins as a design spec: ~12 repos under `github.com/matthewlew` sharing no
common system. Day 0 of the timeline.

### First code lands

`2026-07-24` · `milestone` · `ai`

`lds.css` enters the portfolio repo alongside the sub-project integration.

### v1.0.0 published

`2026-07-26` · `milestone` · `human`

LDS becomes installable. 14.4 kB, 10 files.

---

## Pre-history

Decisions LDS **inherited** rather than made. Excluded from the day-0 arithmetic
on the timeline — otherwise a nine-month gap swamps the axis. Dates are
month-precision.

### The APCA construction comes from the Oct 2025 rebrand

`2025-10` · `prehistory` · `measured` · `structural`

The 11-step symmetric ramp tuned to a fixed APCA curve is not invented for LDS.
It reproduces the method used in the October 2025 rebrand: place each colour in
OKLCH, mute chroma toward the ends, then binary-search lightness until measured
APCA hits the target. LDS adopts the method wholesale rather than re-deriving it.

**Ruled out:** starting the colour system from scratch. The method was already
proven and verified; re-deriving it would have risked a different answer for no
gain.

### One Token is the colour layer, not a dependency to be replaced

`2026-07` · `prehistory` · `human` · `structural`

One Token already solved `mode × emphasis → colour roles` as a portable skill
file. LDS treats it as Layer 2 rather than reimplementing colour resolution.

**Ruled out:** a bespoke LDS colour model. Two competing colour systems under
one author is the exact fragmentation LDS exists to end.

**Cost:** the origin date of One Token is not recorded in this repo. `2026-07`
is when it was vendored in, not when it was made.

---

## 1. Foundations & scope

### Plain CSS — no build step, no runtime, no framework binding

`2026-07-14` · `foundations` · `human` · `structural`

LDS ships as CSS files you link or import. No preprocessor, no CSS-in-JS, no
component runtime, no framework peer dependency.

The consumers are irreconcilable by construction: static single-page HTML
(`tote`, `ping`, `waypoint`), multi-page static sites (`scentmap`,
`volleyball-rotation`), a Vite + CSS-modules React app (`palette`), and a
shadcn/Tailwind React app (`tripblend`). Anything with a build step or a
framework binding would exclude some of them on day one.

**Ruled out:** a component library. It would have served `palette` and
`tripblend` and been useless to the six static sites, which are the majority.

**Cost:** no type safety on class names, and no tree-shaking — you ship all
of `lds.css` or none of it. At 407 lines that is an acceptable trade.

### Core never hardcodes a hex

`2026-07-24` · `foundations` · `human` · `structural`

`lds.css` contains no brand colour. Themes supply the `--c-*` ramp; components
read `var(--background)` and `var(--text)` and inherit their environment.

This is what makes one stylesheet serve an editorial portfolio, a neutral
product surface, and a chromeless media tool. It is also what makes mode
switching free — a component that only listens to tokens adapts without knowing
dark mode exists.

**Ruled out:** shipping a default brand palette in core. Every consumer would
have had to override it, and overrides are where cascade bugs live.

**Cost:** two exceptions survive deliberately. `.emph-plain` pins
`--background:#FFFFFF` and `.emph-strong`/`.emph-stark` pin `--text:#FFFFFF`,
because a knockout label must not follow the theme ramp. The banner status hues
are also fixed hexes — see *Status colour is fixed, not themed*. Reversed
2026-07-28: core ships the ramp as a default, because an unthemed LDS was broken
rather than neutral — see *Core ships a working brand ramp*.

### New shared components land in LDS first

`2026-07-24` · `foundations` · `human` · `structural`

A component that more than one product needs is built in LDS and consumed from
there — not built in a product and back-ported later.

Back-porting means the first product's incidental constraints get baked into the
shared abstraction, and every later consumer inherits them.

**Ruled out:** the pragmatic "build it where you need it, promote it later"
path. Faster per-feature, and it is how design systems accumulate one product's
accidents as everyone's API.

**Cost:** this rule was broken once, on purpose, and it worked — `--dur-slow`
and `emph-media` were both contributed up from `palette`. See those entries. The
rule holds for *components*; primitives discovered in the field are fair game.

### The record is validated by structure, never by judgement

`2026-07-26` · `foundations` · `human` · `notable`

`scripts/check-decisions.mjs` checks every entry parses, that decisions name a
`Ruled out`, that enum values are valid, that referenced commits still exist in
the repo, and that the header's attribution split matches the actual counts.
`CLAUDE.md` carries the rule so future sessions write entries as part of the
work rather than reconstructing them from a diff afterwards.

The grammar lives in `decisions-parser.mjs` and is imported by both the validator
and `decisions.html`. One copy, deliberately: a validator with its own regex
would drift from the renderer, and the record would then pass its own checks
while displaying something else — which is the precise failure this document
exists to prevent.

The split sentence is now generated. It drifted three times in a single
afternoon while being maintained by hand, which is the whole argument for
generating anything.

**Ruled out:** a pre-commit hook, which would nag on trivial commits and get
bypassed. Also ruled out, and more importantly: any attempt to check *quality*.
A script cannot tell whether the reasoning is sound or whether the "Ruled out"
line names something real. Pretending otherwise would be worse than not checking,
because a green run would start to feel like approval.

**Cost:** a green run means well-formed, not well-reasoned. The thing worth
having still cannot be automated — only its scaffolding.

### Showcase pages paint from tokens, never their own fonts

`2026-07-26` · `foundations` · `human` · `notable`

`design-system/index.html` is the LDS showcase. It hardcoded `font-family: 'DM
Sans'` on `body` and `monospace` in five places, so switching the theme changed
the components but never the page's own type — the showcase silently contradicted
the thing it was showcasing.

The related trap, hit the same day: a theme class must sit on the **root**, not on
an inner wrapper. `decisions.html` had `theme-portfolio` on a `div` inside
`body`. Custom properties inherit downward only, so `body` could not see any of
the theme's tokens and kept resolving core defaults — 13px `system-ui` on a cold
grey page — while the components inside looked correctly themed. It fails quietly
and looks like the theme is broken.

**Ruled out:** letting demo pages style themselves for convenience. A showcase
that overrides the tokens it demonstrates is worse than no showcase, because it
reports success while the theme is doing nothing.

### LDS must not absorb the gradient canvas

`2026-07-26` · `foundations` · `human` · `structural`

The honest adoption ceiling for `palette` is ~54% of its component CSS, not
80–90%. `ShapePreviews`, `CanvasHandles`, `SwatchTray`, `FlowEditor`,
`TurrellSquare` and `NoiseOverlay` — 382 lines that are irreducibly
app-specific, plus the bespoke core of another 1,936 — stay in the product.

That gap is not a shortfall. It is the product. A design system that absorbed a
gradient editor's canvas would be a worse design system, because the next
consumer inherits an abstraction shaped by one app's canvas.

**Ruled out:** chasing a high adoption percentage as the success metric. The
target is 80–90% for generic chrome — buttons, search, typography, chips,
modals, toasts, sheets — and 54% overall is a success, not a miss.

**Cost:** the number looks bad out of context, so it has to be stated with the
reasoning attached every time it comes up.

### Icons come from the sprite, and are named for what they draw

`2026-07-27` · `foundations` · `human` · `notable`

Every icon is a `<use>` reference into `dist/icons.svg`. Pages do not carry inline
`<path>` data.

The sprite existed and was almost entirely unused — referenced once each in
`index.html` and `about.html`, against **101** inline SVGs across the showcase,
the tag page and the a11y page. An unused foundation is not a foundation, and the
drift it allowed was already visible:

- Icons had accumulated in **two grids**. The hand-drawn set was `0 0 16 16`; a
  handful of Feather icons had been pasted in at `0 0 24 24` with
  `stroke-width="2"` against the sprite's 1.5.
- The same status was drawn by different shapes on different pages — error was
  an ✕-in-circle in one place and an !-in-circle in another.

All 101 were converted. Only shapes with a verified equivalent were mapped; the
five the sprite was missing were added to it rather than approximated.

**Symbols are named for their shape, not their meaning** — `checkCircle`,
`xCircle`, `infoCircle`, `helpCircle`, `chevronDown`. A status is bound to a
colour in `lds.css` and to a shape here, and neither binding belongs in the
other's name. Naming the symbol `success` would freeze the mapping and put the
same layering mistake in the icon set that *A hue is a colour, a status is a
meaning* just removed from the colour set.

**Ruled out:** semantic symbol names (`success`, `info`), for the reason above.
Also ruled out: leaving the icons inline because they render fine. They do render
fine — that is exactly why two grids and two error shapes survived unnoticed, and
why a page could not pick up a corrected icon without being edited.

**Cost:** the two semantic names already in the sprite — `error` and `warning` —
predate the rule and are kept, so the naming is not uniform. Renaming them would
break the pages consuming them for no rendering benefit. Also: external `<use>`
needs a real HTTP origin, so an icon is invisible when a page is opened over
`file://` — the same constraint `decisions.html` already carries. And the sprite
is a 24 grid, so an icon rendered at 13px in a tag draws its 1.5 stroke at an
effective 0.8px; verified legible at both 13px and 16px, but it is the floor.

---

## 2. Colour & contrast

### APCA, not WCAG 2.x

`2026-07-26` · `color` · `measured` · `structural` · `c7f9ade`

Contrast is measured with APCA (Lc 0–106), not the WCAG 2.x contrast ratio.

WCAG's ratio is a symmetric luminance quotient. It ignores polarity, so it
scores light-on-dark and dark-on-light identically, and it misjudges the
mid-tones — exactly where photographic and gradient backdrops sit, which is the
surface `emph-media` exists to serve. APCA models perceived lightness difference
and polarity, so a step that passes actually reads.

The implementation is verified against the `apca-w3` reference across a
3,456-pair sweep of the gamut: exact agreement, max |delta| 0.0.

**Ruled out:** WCAG 2.x as the standard. It survives as a sanity floor —
every emphasis pair in `theme-palette` clears AA 4.5:1, tightest is
`emph-strong` at 5.73:1 — but it is not what LDS targets.

**Cost:** APCA is polarity-asymmetric, so contrast does not mirror between
modes. Step 600-on-white measures Lc +72; its complement, step 400-on-black,
measures about Lc −63. In dark mode, step text one notch lighter than the
light-mode complement. Never assume symmetry — verify.

### Eleven symmetric steps on a fixed Lc curve

`2026-07-25` · `color` · `measured` · `structural` · `954445e`

Each hue has 11 steps. Step *N* and step *(1000 − N)* mirror around 500. Every
step's Lc against white is pinned to a fixed target:

| step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Lc vs white | 0 | 9 | 17 | 27 | 40 | 57 | **72** | 82 | 91 | 100 | 103 |

Lightness is binary-searched in OKLCH until the measured APCA hits the target,
so every hue lands on the same curve rather than on the same *nominal* value.
That is what makes `hue-red` and `hue-green` interchangeable at a given
step: the contrast is equal because it was solved to be, not because the hexes
look similar.

**Ruled out:** eyeballed ramps, and evenly-spaced OKLCH lightness. Even
perceptual spacing does not produce even *contrast* — the curve has to be solved
against a measurement.

**Cost:** adding a hue means running the generator, not picking hexes by hand.

### One Token: `mode × emphasis → seven roles`

`2026-07-24` · `color` · `human` · `structural`

Colour resolves through two inputs — mode and emphasis — into exactly seven
object roles: `--background`, `--text`, `--text-accent`, `--text-subdued`,
`--icon`, `--border`, `--border-subdued`, plus hover/pressed states.

The payoff is local re-resolution. Drop `.emph-strong` on any element and the
whole set re-resolves for that subtree, without touching its container and
without a variant class. `<div class="lds-card emph-strong">` promotes one card;
the same markup inside `.mode-dark` resolves dark.

**Ruled out:** per-component `--primary`/`--secondary` variants. That is the
usual approach and it multiplies: every new component needs its own variant set,
and every variant needs a dark-mode twin.

**Cost:** seven roles is a fixed vocabulary. A component needing an eighth
colour has to compose from what exists or justify widening the contract for
everyone.

### Status colour is fixed, not themed

`2026-07-25` · `color` · `ai` · `notable` · `a8b98b7`

Banner status hues are hardcoded hexes in core, the one place core carries
colour. Success is green in every theme, including the portfolio's red-brand and
palette's neutral.

Status is not brand expression. A theme whose brand hue is red cannot render
errors in its brand colour without the error stopping being legible as an error.

**Ruled out:** resolving status through the theme's `--c-*` ramp, which is what
the rest of the system does. Consistency with the architecture would have cost
the semantics.

### A hue is a colour, a status is a meaning

`2026-07-27` · `color` · `human` · `reversal`

There is no `hue-error`. `hue-*` names a **colour** — `hue-red`, `hue-blue`,
`hue-green` — and nothing else. Meaning lives on the component as a modifier:
`lds-tag--error`, `lds-banner--success`, `lds-inline--warning`.

The six semantic hue classes — `hue-error` `hue-warning` `hue-caution`
`hue-success` `hue-info` `hue-helpful` — are **deleted**. They put meaning on the
colour layer, which is the wrong layer: a hue is a coordinate in the palette, and
naming one "error" asserts that red *is* the meaning rather than the current
rendering of it. The shape to copy was already in the system — `lds-btn--primary`
is a role that resolves to the brand hue, not a hue named "primary".

Each of the six was byte-identical to a colour class, verified before deletion,
so nothing rendered differently on the swap. Two of them were worse than
redundant:

- `hue-info` mapped to **grey**, while `lds-banner--info` mapped to **blue**. The
  same word meant two colours depending on which layer you asked. Blue wins;
  grey is not a signal colour, and neutral information is already the default
  surface.
- `hue-helpful` was a second name for the same blue as `info`. Gone.

The five statuses — `error` `warning` `caution` `success` `info` — are now bound
to colours in exactly **one** place, the status map in `lds.css`. Repointing
caution from yellow to orange is a one-line edit that reaches every component at
once, and no consumer markup changes. This also removes the duplication where the
banner carried its own copy of all five ramp remaps.

Only the banner still needs a paint rule per status, because its default surface
is grey rather than the `--c-*` ramp, so a status has to move it onto the ramp.
Tag and inline already paint from `--c-*` in their base rules, so remapping
`--c-*` is enough. Adding paint rules for them anyway would be a trap: bound at
`:where()` they carry specificity 0 and lose to their own base rule.

This does **not** reverse *Status colour is fixed, not themed* — it strengthens
it. Statuses still resolve from the fixed `apca-palette` hues, never the theme's
brand ramp.

**Ruled out:** keeping the semantic aliases as a convenience layer. Two ways to
say the same thing is how `hue-info` and `banner--info` drifted to different
colours in the first place — an alias is where the next contradiction hides.
Also ruled out: going the other way and baking status into the hue layer for
every component, which would have made the palette un-nameable in colour terms
and left no way to ask for plain red.

**Cost:** breaking for any markup using the old classes, with no alias to soften
it. All 31 call sites in this repo were migrated in the same commit; anything
pinned to an older tag keeps working, and anything upgrading has to rename. The
five status lists in `lds.css` also have to be extended by hand when a
status-bearing component is added — deliberate friction, so the set of components
allowed to speak in status names stays small and visible in one place.

---

### Core ships a working brand ramp

`2026-07-28` · `color` · `human` · `reversal`

Reverses *Core never hardcodes a hex*, and amends that entry rather than
replacing it — the other way was tried and this is why it did not hold.

The rule kept core theme-agnostic by keeping it non-functional. With no `--c-*`
ramp at `:root`, `.emph-subtle`, `.emph-soft`, `.emph-strong`, `.emph-stark` and
every status tint resolved to nothing until a theme mounted. An unthemed LDS was
not neutral; it was broken, and the failure was silent — a consumer who forgot
the theme class got uncoloured components rather than an error.

Core now ships the green ramp and the oat neutrals as defaults, plus the faces,
the radius set and the shadows. Themes override exactly as before.

**Ruled out:** a neutral placeholder ramp, which is a fifth brand nobody chose
and which measures wrong against every real theme's floors. Also ruled out:
failing loudly on a missing theme, which needs a runtime in a system that has
none; and keeping the rule and documenting the gap, which is what the last three
consumers did before hitting it anyway.

**Cost:** the default look is now opinionated. A consumer who forgets the theme
class gets this brand rather than nothing — a better failure, but a louder one.

### A link is a role, not an emphasis level

`2026-07-28` · `color` · `measured` · `structural`

Promotes the portfolio theme's `--link` into core. A link is text with
behaviour, and One Token's seven object-colour roles do not include one for
that, so themes painted links with `--text-accent`. That reads backwards in both
directions: every accented word looks clickable, and every link looks like
emphasis.

It is a role rather than a theme knob because the fallback has to be safe.
Before this, a theme with no `--link` rendered links in browser blue on whatever
ground the theme chose — the one colour in the document nobody measured.

Two values. `--link-dark` is not a dark-mode variant; it is the same role solved
against the other ground, at Lc 88.6 on the paper and Lc 75.9 on an oat-200
panel. Resolution is set on the emphasis classes, not at `:root`, because
`:root` inherits one concrete colour past every surface it has to survive — a
link on `.emph-strong` is the case that breaks.

**Ruled out:** an eighth One Token role, which would reopen a fixed vocabulary
for something that is not an object colour. Also ruled out: a single link hue
for both grounds, and colour without an underline — the distinction has to
survive greyscale print and red-green colour blindness, which, the accent being
green, is the whole of it.

**Cost:** a theme that adds an emphasis-shaped class of its own must now set
`--link` on it too, or links inside it inherit from the wrong ground.

## 3. Emphasis ladder

### `lds-list` — do/don't is a hue, not a variant

`2026-07-26` · `emphasis` · `human` · `notable`

A list component: `.lds-list`, `.lds-list__item`, `.lds-list__title`, plus a
`--flush` variant for lists inside an already-bordered container.

It replaces three near-identical `.rule-item` implementations across the site,
each with its own hardcoded greys and its own copy of the layout.

Do and don't are **not** variants. They ride the existing mechanism:

```html
<ul class="lds-list emph-plain hue-green"> … </ul>
<ul class="lds-list emph-plain hue-red">   … </ul>
```

`.lds-list--do` deliberately does not exist. Bespoke colour variants are exactly
what One Token replaces, and the rule against them is written on the very page
this component was built to render.

**Ruled out:** `--do`/`--dont` modifier classes. Simpler to write and they would
have needed a dark-mode twin each, plus a new pair for every future semantic.

**Cost:** `hue-*` must sit on the **same element** as an `emph-*` class. See
*A hue only retints where emphasis resolves*.

**Amended 2026-07-26.** The item shipped painting `background:var(--background)`
and that was wrong. Because a hue only retints where emphasis resolves, the list
has to carry an `emph-*` class — so the paint forced the plain surface through
whatever container it sat in, punching a light card out of any tinted section.

It also broke the first rule on the page it was built to render: *"Inherit by
default — let components inherit their environment so they adapt contextually."*
A component that contradicts the guidance it displays is worse than no component.

The item now has no background and inherits its surface. Structure comes from the
left rule and the spacing. For a lifted card, put an `emph-*` on the item itself.

Separately: the container around it carried an inline `background:#fff` and a
`#E2E2E2` border, which is where the actual white was coming from. Both now read
tokens.

### A hue only retints where emphasis resolves

`2026-07-26` · `emphasis` · `measured` · `notable`

`.hue-*` retints only when it is on the same element as an `.emph-*` class, or on
an ancestor of it. Putting it lower has no effect at all.

Custom property substitution happens where the property is **declared**.
`.emph-plain` declares `--text-accent: var(--c-600)`, so on the element carrying
that class it computes to a concrete colour and inherits down as that colour.
Re-pointing `--c-600` further down the tree cannot reach back and change it.

Measured while building `lds-list`: `<ul class="lds-list hue-red">` inside an
`.emph-plain` body produced a "don't" column identical to the "do" column —
both terracotta. Adding `emph-plain` to the `ul` fixed it: green `rgb(39,132,69)`
against red `rgb(190,81,68)`.

**Ruled out:** nothing was rejected here — this is how CSS custom properties
work. Recorded because it fails **silently**, produces a plausible-looking
result, and the existing hue documentation says "drop on any element together
with an emph-x class" without saying what happens if you don't.

### Five roles, assigned by object size

`2026-07-25` · `emphasis` · `human` · `notable` · `954445e`

`plain` → `subtle` → `soft` → `strong` → `stark`. The choice between `subtle`
and `soft` is not intensity, it is **area**:

- `subtle` (`--c-50`) — large fields: banners, cards. A big plane of colour
  registers with less saturation, so it stays gentlest.
- `soft` (`--c-100`) — small components: tags, chips, buttons. A pill is a small
  field, so it carries one step more colour and still reads clean.

**Ruled out:** a pure intensity ladder where the author picks by "how loud".
Same tint on a full-width banner and on a chip reads as two different
intensities, so the author would have to compensate by feel every time.

### Components paint from an explicit emphasis list

`2026-07-26` · `emphasis` · `human` · `notable` · `9d48813`

`.lds-btn`, `.lds-tag` and `.lds-chip` enumerate the emphasis classes they
paint. A new role is **inert** until it is added to each.

Discovered by adding `emph-media` and finding it silently did nothing on
buttons. Fixing it by making components paint from any `emph-*` would have been
the smaller diff.

**Ruled out:** implicit adoption via a wildcard. It would make every new role
land everywhere at once — including on components it was never designed for,
where it fails silently and looks like a component bug.

**Cost:** adding a role is a multi-file change, and forgetting a component is a
silent no-op. The explicitness is the point; the tax is real.

### `emph-media` derives every role from `currentColor`

`2026-07-26` · `emphasis` · `human` · `structural` · `9d48813`

Every other emphasis resolves against a surface colour known when the CSS is
written. `emph-media` does not: it is for chrome over a photo, video still,
album art, or generated gradient, where the backdrop is decided at runtime and
changes as the user scrolls.

All seven roles derive from `currentColor`, so the consumer owns exactly one
decision — the ink — and everything else follows.

This was simultaneously LDS's biggest blocker and the biggest thing `palette`
owed back. Palette's signature floating chrome is 100% of its first screen and
could not adopt LDS at any percentage without it.

**Ruled out:** `.lds-glass`'s fixed `rgba(255,255,255,.14)` recipe as the
answer. It is strictly less capable and dissolves on light gradients.

**Cost:** it is the one role whose correctness depends on the consumer. Give it
a bad ink and every derived role is wrong together.

### Media chrome does not flip with mode

`2026-07-26` · `emphasis` · `measured` · `notable` · `9d48813`

`.mode-dark` deliberately does not override `emph-media`. The role is identical
in both modes.

Media chrome is backdrop-relative, not mode-relative. A white pill over a bright
photo is wrong in light mode and equally wrong in dark mode — the page's mode
says nothing about the artwork underneath.

**Ruled out:** giving `emph-media` a dark-mode resolution like every other role.
It would have been architecturally consistent and behaviourally wrong.

### Stroke-defined, not fill-defined

`2026-07-26` · `emphasis` · `measured` · `reversal` · `8b47a4a`

The 1px hairline was questioned as a glass-UI relic. Measuring it reversed the
conclusion: the hairline earns its keep and the translucent **fill** is the
relic. `emph-media` has no resting fill.

An alpha fill of the ink over artwork is just a dimmer. It moves lightness only,
so it desaturates whatever sits behind it: across six backdrops a 10% fill lowers
backdrop chroma on 5 of 6, and a 30% fill costs ~36% (0.084 → 0.054). For a
gradient tool that is the one unaffordable side effect.

It also fights the label. The fill is made of the same ink as the text on top of
it, so every percent of fill eats label contrast — worst case Lc 66.1 at 10%
fill, Lc 50.9 at 30%.

Removing the resting fill fixes both at once: worst-case label rises to Lc 72.4
and backdrop chroma is untouched on 6 of 6, because nothing is composited over
the art at all.

**Ruled out:** the translucent fill, i.e. the standard glass recipe and the
thing the original `.lds-glass` did.

**Cost:** with no fill at all the stroke had to carry the chip alone at 60%,
which left the worst-case label at Lc 60.9 — under the body floor. Resolved the
same day by an *inverse* scrim; the finding above is unchanged, because the
problem was the scrim's **colour**, not its existence.

### The stroke is 60%, because 28% measures Lc 0.0

`2026-07-26` · `emphasis` · `measured` · `notable` · `8b47a4a`

With the fill gone the stroke carries the control alone, and the usual 28% glass
hairline cannot. An ink-alpha mix moves mostly chroma rather than luminance, so
on saturated artwork a faint hairline just matches its backdrop: a white 28%
stroke over pure red is pink-on-red, measuring **Lc 0.0** on red, blue and
magenta.

Stepping up: 40% still fails magenta (7.8). 50% still fails magenta (13.6). 60%
is the first value where every backdrop tested clears the Lc 15 non-text floor —
worst case 20.6, magenta.

Being 1px, its own effect on the artwork is negligible. That is exactly what
lets it be strong.

**Ruled out:** 28%, 40% and 50%, each by measurement rather than taste.

**Cost:** superseded the same day — the stroke is now **40%**, see *An inverse
scrim, not an ink scrim*. The measurement above still explains why a stroke
carrying the chip *alone* needs 60%; 40% only works because the scrim shares
edge duty.

### An inverse scrim, not an ink scrim

`2026-07-26` · `emphasis` · `measured` · `notable` · `ce297a8`

`emph-media` regains a scrim — but made of the **opposite** polarity to the ink:
white behind dark text, black behind white text. Shipped at 25% scrim / 40%
stroke.

This is a polarity change, **not** a reversal of the no-fill decision. The
earlier finding stands exactly as written: a scrim made of the *ink* is a dimmer.
It desaturates the artwork and, because the label is that same colour, eats the
label's own contrast.

An inverse scrim inverts the second half of that. It still costs saturation, but
it pushes the backdrop *away* from the ink, so the label gets easier to read
rather than harder. Measured across ten backdrops — dark through near-white
through max-chroma primaries:

| scrim | stroke | edge | label | chroma kept |
|---|---|---|---|---|
| 0% | 60% | 20.6 | 60.9 | 100% |
| 15% | 45% | 16.3 | 72.1 | 89% |
| **25%** | **40%** | **16.2** | **79.2** | **81%** |
| 30% | 35% | 15.5 | 82.3 | 77% |

25/40 is where the label first clears the Lc 75 body floor while keeping the most
chroma, and it lets the stroke soften from 60% to 40%.

`--media-scrim` defaults to `transparent`, degrading to the previous pure-stroke
behaviour, because no single colour is correct for both polarities. The
`--on-dark`/`--on-light` helpers set the matching pair, and `mediaInkOn()` in
`lew-design-system/ink` now returns `{ ink, scrim }` so sampling stays one call.

**Ruled out:** stroke-only at 60%, which was shipped hours earlier — its
worst-case label lands at Lc 60.9 and misses the Lc 75 body floor. Also ruled
out again, on the same evidence as before: a scrim made of the ink.

**Cost:** ~19% of the artwork's chroma under the chip, bought for +18 Lc of
label legibility and a visibly softer edge. Stated explicitly in the source
because for a gradient tool it is a real price, not a free win.

### `backdrop-filter: saturate()` rejected as the default

`2026-07-26` · `emphasis` · `measured` · `notable` · `8b47a4a`

Considered as an alternative to a strong stroke, and kept only as opt-in via
`--media-filter`.

It scores identically to the plain stroke and does make artwork richer — but on
already-saturated backdrops it clips to a no-op on pure primaries, and on
near-max colours it clips asymmetrically and shifts hue 4–10°. It distorts the
artwork precisely where help is most needed.

**Ruled out:** as a default. Available for consumers whose artwork is known to
be low-chroma.

### Inactive media chrome is opacity, not faded tokens

`2026-07-26` · `emphasis` · `measured` · `notable` · `8b47a4a`

The disabled state is one `opacity:.45` on the element, not faded `--text` and
`--border` values.

The token version is a trap. The component sets `color:var(--text)`, so once the
label fades, `currentColor` **is** the faded ink — and the border's own
`color-mix` then re-derives 12% *of* 45%, landing at 5.4%. The two fades
multiply and the stroke all but vanishes. One opacity does it correctly in one
operation: the 28% stroke becomes 12.6%, the ink becomes 45%.

`.45` rather than the `.38` of ordinary disabled buttons, because media chrome
has no container to fade toward — drop it further and it stops reading as
disabled and starts reading as a rendering artifact.

**Ruled out:** expressing the state through the token system, which is how every
other state in LDS works.

### Choosing the ink was deliberately deferred

`2026-07-26` · `emphasis` · `human` · `notable` · `9d48813`

`emph-media` shipped without a sampler. Picking the ink was explicitly left to
the consumer, with `--on-dark`/`--on-light` covering known-tone backdrops.

Sampling requires a contrast threshold, and that was the one open question in
the system: `palette` enforced WCAG 4.5:1, LDS standardised on APCA Lc, and the
two disagree precisely in the mid-tones where gradients live. Shipping a sampler
first would have baked the disagreement into the API.

**Ruled out:** shipping the sampler with `emph-media`, which is what the role
obviously wanted.

### `lew-design-system/ink` settles it

`2026-07-26` · `emphasis` · `measured` · `reversal` · `c7f9ade`

The sampler ships as a separate module, and the answer is APCA. Exports
`apcaContrast`/`lcOn` (raw), `bestInkOn` (pick from candidates, fall back to
white/black), `inkOn` (zero-config knockout), and the published Lc floors.

Measured across all 146 published gradients. Two findings any consumer will hit:

- Enforcing the floor naively collapses **~94% of labels to white or black** —
  the gradient's own stops rarely clear it, so a naive implementation throws
  away the reason to sample at all.
- The OKLCH lightness walk needs real gamut mapping, or it shifts hue by ~29°.

**Ruled out:** WCAG 4.5:1, which is what `palette` shipped. The migration has to
absorb the change.

**Cost:** the ~94% finding means `bestInkOn` needs a candidate list and a
considered fallback, not just a floor.

### `.lds-glass` gets dedicated tokens

`2026-07-26` · `emphasis` · `measured` · `reversal` · `9d48813`

`.lds-glass` reads `--glass-bg` and `--glass-border`, not `--background` and
`--border`.

It previously hardcoded a white wash and dissolved on light backdrops. Pointing
it at the general roles instead would have turned it **opaque white** inside any
`.emph-plain` context, because that is what `--background` resolves to there.

**Ruled out:** reusing the general surface roles. The obvious fix; wrong for the
one component whose entire job is to stay translucent.

---

### `.emph-cta` moves from the theme into core

`2026-07-28` · `emphasis` · `human` · `notable`

Supersedes the theme-level version in *`.emph-cta` is one button, not a sixth
emphasis level*. The reasoning there stands unchanged; only the location moves.

The theme could not finish the job. Components paint from an explicit emphasis
list, so `themes/portfolio.css` had to hand-write a `.lds-btn.emph-cta` rule to
opt the one component in. A role that requires a per-component patch in every
theme that wants it belongs in core, where the patch is written once.

`.lds-mark` lands with it as the CTA's second form: `.emph-cta` paints a
control, `.lds-mark` paints a phrase. Both take `--cta`, and there is still
exactly one of each on a page.

**Ruled out:** pattern-matching `.emph-*` in components, which would make every
future role adopt itself everywhere silently — the explicit list is a deliberate
call and this does not reverse it. Also ruled out: an eleven-step chartreuse
ramp, and flipping the chartreuse in dark mode.

**Cost:** each new component that grows a CTA needs one rule in core. That is
the same cost the explicit-list decision already priced, now paid in one file
instead of three themes.

### The highlight sizes its own box

`2026-07-28` · `emphasis` · `measured` · `structural`

`.lds-mark` paints with a `background-image` and an em-sized
`background-size`, not a `background-color`. A colour fills the inline box,
whose height comes from the face's metrics — roughly 1.25em — and a hero set
tighter than that has a line box shorter than the paint. The fill then covers
the descenders of the line above and overflows the heading's own box.

Percentages do not help: they resolve against the same content area. em does,
because it is a function of the font size and not of the leading, so
`--mark-height: 0.92em` fits inside any leading the hero is set at. Vertical
padding is zero for the same reason — inline padding paints outside the line box
and cannot be contained.

**Ruled out:** relaxing the hero's leading to fit the paint, which is fixing a
component by constraining every consumer of a type role. Also ruled out:
`padding-block` with a background colour, and a `box-shadow` spread, both of
which move the overflow rather than remove it.

**Cost:** the two knobs are metric-dependent. A theme whose display face has a
markedly different x-height ratio has to retune them, and the failure is visible
rather than measured — it looks fine until a descender lands on it.

## 4. Typography

### Sans heads, serif text

`2026-07-26` · `type` · `human` · `reversal`

`--th-display` stays Jost. `--th-body` becomes **Spectral**. `--th-mono` stays
DM Mono.

A geometric sans is a poster face. It sets a headline well and reads *technical*
the moment you ask it to carry a paragraph — which is most of what a rationale
document is. Spectral is drawn for screen text: low stroke contrast, sturdy at
16px, quiet enough to disappear behind the prose. It is the closest free
equivalent in **role** to the Equity that Butterick sets his own body text in.

Sans heads over serif text is not a compromise between the two. It is the
standard midcentury magazine arrangement, and it keeps the geometric voice
exactly where it works.

**Ruled out:** serif for display too, which would have retired Jost and with it
the single clearest midcentury signal in the theme. Also ruled out: serif
everywhere including the mono role — that would reverse *Mono means
machine-readable*, and the role is still earning its keep.

**Cost:** three families now load on every themed page. Spectral also runs a
smaller x-height than Jost at the same nominal size, so 16px body reads slightly
smaller than it did — still inside Butterick's 15–25px, but it is the floor of
the range now rather than comfortably above it.

**Reversed 2026-07-27** by *Serif display, sans text*. The split survived; the
sides swapped. The argument here was sound about *Jost* — a geometric sans does
read technical in a paragraph — but it was an argument about the display face,
not about sans in general. Change the display face and it stops applying.

**Amended 2026-07-27:** this decision quietly set every *control* in the serif
too — buttons, tags, chips and field labels all read `--th-body`. That was not
intended and is fixed by *`--th-ui` is the control role* below. The decision
itself stands: sans heads, serif text.

### `--th-ui` is the control role

`2026-07-27` · `type` · `human` · `notable`

A fourth font role: `--th-display` · `--th-body` · `--th-ui` · `--th-mono`.
`--th-ui` is for **controls** — buttons, tags, chips, field labels and inputs.
It defaults to `--th-display`, so a theme gets sans controls without opting in.

The role exists because *Sans heads, serif text* made `--th-body` a serif, and
every control was reading `--th-body`. A button label in Spectral is not an
editorial choice, it is a mistake: a control is chrome, not prose. Three roles
could not express this, because "the text font" and "the control font" had been
the same variable for as long as they happened to agree.

Prose keeps the serif — `lds-banner` and `lds-card__body` are sentences, and they
still read `--th-body`.

**Declare `--th-ui` in the theme**, alongside the other font roles. Not once at
`:root`.

**Ruled out:** keeping the serif on controls for consistency of voice. The
editorial character is carried by the prose and the headings, which is where it
reads as deliberate; on a button it reads as an oversight. Also ruled out:
hardcoding `--th-display` directly in each control rule, which would have made
the two impossible to separate — a theme can now decouple controls from headings
by setting `--th-ui` alone.

**Cost:** the first attempt defined `--th-ui: var(--th-display)` once at `:root`
and it silently did nothing on the showcase page. `:root` matches `html`, the
`var()` resolved there against **core's** `--th-display`, computed to a concrete
`system-ui`, and inherited *past* `theme-portfolio` — which is mounted on `body`
on that page — so every control stayed system-ui while the headings were Jost.
This is the substitution rule from *A hue only retints where emphasis resolves*
reappearing in the type layer: a core default that references a theme variable is
early-bound and cannot be overridden downstream. Any future role of this shape
has to be declared per-theme for the same reason.

### Semantic roles for UI, primitives inside components

`2026-07-25` · `type` · `human` · `notable`

`--text-title`, `--text-subhead`, `--text-body`, `--text-caption` for anything
building a UI. The raw `--size-0`…`--size-8` scale only inside component
internals.

Each semantic role bundles size, leading and tracking, so a theme can shift all
three together. The portfolio's title is `--size-8` with tightest tracking;
palette's is smaller. A consumer reading `--text-title` follows automatically; a
consumer reading `--size-8` does not.

**Ruled out:** exposing only the numeric scale, which is simpler and what most
token sets do.

**Cost:** this is the rule most easily broken by accident, and it fails silently.
Audited 2026-07-26: `decisions.html` was using 18 raw primitives against 2
semantic roles. Its `h1` was pinned to `--size-7` (32px) while the theme set
`--text-title` to 44px, so the page's own heading ignored the theme — a token
change moved every component except the title it was supposed to move. Now 20
semantic, 0 primitives.

The lesson beyond the fix: reach for the **composite**, not just the size.
`--text-title` also carries the theme's leading and tracking, so a page that
takes only the font-size still drifts.

### A page loads only the faces it renders

`2026-07-26` · `type` · `human` · `minor`

Every page was still requesting Bricolage Grotesque, DM Sans and Space Mono after
the theme had moved to Jost, Spectral and DM Mono. Nothing rendered them —
aliasing the pages' token layers had already redirected every rule — but the
downloads stayed, so the site *looked* like it was running several sans faces to
anyone inspecting it.

Kept: Caveat on `index`/`about`, which really is used for the hand-drawn notes,
and Inter on the LDS showcase, which `theme-product` sets.

Also fixed here: `.menu-btn` rendered in **Arial**. A `<button>` does not inherit
`font-family`, so any button without one falls back to the UA default — a third
apparent sans, from a single missing declaration.

**Ruled out:** leaving the requests in place as harmless. They are not free, and
a font list that disagrees with what renders is a false description of the
system.

### Mono means machine-readable

`2026-07-24` · `type` · `human` · `minor`

Dates, tokens, code, hashes and system output always use `--th-mono`. Never for
emphasis or decoration.

It makes the typeface carry a meaning rather than a mood: mono signals "this
value came from a machine and is exact."

**Ruled out:** mono as a stylistic accent, which is the common editorial use and
would destroy the signal.

**Amended 2026-07-26.** The role survives; the typeface changed. Space Mono gave
way to DM Mono in `theme-portfolio` — rounded terminals, low stroke contrast, so
it sits with a geometric sans instead of reading as a terminal.

**Cost:** Butterick's advice is to avoid monospaced fonts outright. This role is a
deliberate exception to it, kept because the typeface is carrying *meaning* here
(this value came from a machine and is exact) rather than mood. Worth re-opening
if the signal ever stops earning the cost. Noted, not endorsed by him. Narrowed
2026-07-28: the rule was applied too widely and section eyebrows leave the mono
for the sans — see *A section eyebrow is not metadata*.

**Amended 2026-07-27.** The role survives again; the typeface is now a system
stack. DM Mono was the last face `theme-portfolio` reached a font CDN for, and
once Coconat and Ronzino were self-hosted it was one `<link>` for one role. The
role's meaning arguably improves: "whatever this machine calls monospace" is a
more literal reading of *machine-readable* than a chosen face was.

### Serif display, sans text

`2026-07-27` · `type` · `human` · `reversal`

`--th-display` becomes **Coconat**. `--th-body` and `--th-ui` become
**Ronzino**. Both are Collletttivo, both SIL OFL.

This reverses *Sans heads, serif text*. The split survives — one face for the
head, another for the text — but the sides swap.

The old entry argued that a geometric sans reads *technical* the moment it
carries a paragraph. That was true, and it was true specifically of Jost. It is
not a fact about sans faces; it is a fact about geometric ones. Ronzino is a
grotesque, which is a text face by construction: large x-height, even fitting,
nothing circular about it. Spectral was solving a problem the display face
created, and the display face has changed.

Coconat earns the display role by having a voice. Jost at 44px was legible and
anonymous — a Futura revival reads as *period*, and the period is exactly what
the theme stopped wanting. A high-contrast serif with cut stems is a face
someone drew, which is the right thing at the one size where the identity is
allowed to speak.

Sans text under a serif head is the modular arrangement rather than the
magazine one: the head is the object, the text is the label.

**Ruled out:** keeping Jost for display and swapping only the body, which would
have left the clearest signal of the treatment being reversed still on the page.
Also ruled out: the obliques of either family — this theme sets no italic, so
shipping them would be four files nothing renders.

**Cost:** `--th-ui` now points at `--th-body` rather than at `--th-display`,
because the body face *is* the sans here. The default the other way round is
still correct for any theme whose display face is a sans, and a theme that
inherits it while setting a serif display will silently put a serif on every
button. That default is a trap for exactly one shape of theme, and this is it.

### Theme faces are self-hosted, page faces need not be

`2026-07-27` · `type` · `human` · `notable`

Every face a theme *names* ships in `design-system/dist/fonts` with its licence
beside it. `theme-portfolio` loads Coconat and Ronzino from there via
`@font-face`, and `--th-mono` drops to a system stack.

The reason is distribution, not performance. LDS installs over npm from GitHub.
A theme that names a face it does not carry renders one way for whoever added
the matching `<link>` and another way for everyone else — the theme is then a
description of a design rather than the design, which is the thing this system
exists not to be.

The line is drawn at *roles*, not at pages. `index` and `about` still load
Caveat from a font CDN for their hand-written notes. That is a page rendering a
face it uses, which *A page loads only the faces it renders* already permits;
Caveat is not a `--th-*` role and no consumer inherits it.

**Ruled out:** keeping DM Mono on the mono role. It was the last thing holding a
font-CDN `<link>` open for a theme role, and one external face for one role is a
bad trade once the other three are self-hosted. Also ruled out: vendoring Caveat
too, which would ship a fourth family to every consumer of LDS so that two pages
in this repo can set a marginal note.

**Cost:** ~247 kB of WOFF2 now lives in `dist`, up from zero. That is real for
an npm package whose whole pitch is that it is small. It buys a theme that
renders identically wherever it is installed, and the alternative — naming faces
and shipping none — is the failure mode the entry exists to prevent.

---

### `--text-hero`, the display role two pages were hand-rolling

`2026-07-28` · `type` · `human` · `notable`

`--text-title` is a section title, and a page with one h1 needs something louder
than one. `index.html` and `about.html` had each written the same `.display`
rule — a literal clamp, a leading override, and a comment explaining why
`--leading-title` was wrong for it. A role two pages reimplement identically is
a missing role.

Fluid, and the only fluid role in the system: a hero's size is a function of the
viewport rather than of the scale. At 44px it is a heading; at 72px it is the
page. The steps stay fixed and only this interpolates.

**Ruled out:** a `--size-9` step, because a fixed step cannot be fluid. Also
ruled out: reusing `--text-title` with a page-level override, which is what was
already happening, and a `.lds-display` utility, which puts a type role in the
component layer.

**Cost:** a theme that wants a fixed hero has to restate the clamp as a single
value, and its leading as a second — see *`--leading-hero` is a literal, and the
ladder gets no step below 1.0*, which is the one line-height a theme's ladder
does not reach.

### A section eyebrow is not metadata

`2026-07-28` · `type` · `human` · `reversal`

Amends *Mono means machine-readable*. The rule is right and was applied too
widely: the eyebrows took it, which put a phrase naming a section in uppercase
mono directly beside a counter in uppercase mono, as though prose and machine
output were the same kind of object.

The split: `--th-mono` keeps dates, tokens, hex, code, counters and measured
numbers. A label takes the sans, on `--th-ui` rather than `--th-body` for the
reason `--th-ui` exists — an eyebrow is chrome, not prose — in sentence case,
like the headings.

Two scales, because the role names a section (19px, beside a 44px title) and a
component (14px card kicker, panel heading), and one size cannot do both: 19px
on a kicker competes with the card's own title. The small one is its own
composite rather than a smaller copy — at 19px, position and subdued ink
separate a label from prose on their own; at 14px directly above a title in the
same family they do not, so it carries a medium weight and 0.014em of tracking.

`.lds-card__kicker` moves with it, and `.lds-card__title` leaves the display
serif for `--th-ui` at the same time: a card in a library is an object you act
on, not an article.

**Ruled out:** mono for everything small, which is where this started. Also
ruled out: uppercase as the label signal, a size step above body to separate
label from prose, one composite at two sizes, and leaving the weight to the
consumer.

**Cost:** weight in a type composite is a precedent — any future role wanting
one has to justify why size will not do the work. Two of the four core roles
(`--text-body`, `--text-subhead`) are now literals rather than scale steps: the
scale describes headings and captions, and body and subhead are set where the
faces actually work.

### A font-family token travels with its metric corrections

`2026-07-28` · `type` · `measured` · `structural`

`--th-mono` shipped alone, which assumed that naming a face is the whole of
specifying it. It is not. Two faces at one `font-size` are not one optical size:
the mono's x-height fills more of its em, so at 12px it was optically the larger
of the pair and the metadata outshouted the prose it annotates. Read as a weight
problem; it is a size problem.

`--mono-adjust` holds one number — the x-height-to-em ratio of `--th-body` — and
`font-size-adjust` scales whatever face `--th-mono` names until its x-height
matches. The correction therefore survives a face swap: change the mono and the
balance holds with nobody re-tuning a size. It also inherits, so an inline mono
run inside a paragraph is corrected without being given a class, which was the
case reading heaviest.

Two further corrections, both judgements: `--mono-tracking` 0.08em → 0.03em,
because a monospace is letterspaced by construction and the widest tracking on
top of a face that sets ~18% wider than the sans produces a label that takes a
column to say one word; and `--mono-weight` bold → medium, since the bold was
compensating for the size mismatch. Packaged as `.lds-meta`.

The face itself is now declared rather than delegated: Martian Mono, self-hosted,
replacing the `ui-monospace` stack that rendered three different widths for the
same column of counters on three operating systems. It ships its own woff2, so
the objection that retired DM Mono does not return.

**Ruled out:** a smaller literal size for the mono role, and a per-face
multiplier — both correct for exactly one typeface. Also ruled out:
`font-size-adjust: from-font`, which normalises fallbacks within a family and not
across roles; a Google Fonts link, which reopens *Theme faces are self-hosted*;
Chivo Mono, too close to Ronzino to signal a different kind of object; and
shipping the variable file for two axes the role does not use.

**Cost:** `font-size-adjust` needs Chrome 127 / Safari 16.4. Below that the mono
renders uncorrected, which is the previous behaviour — it degrades to before,
not to broken. And ~92KB of woff2 across three instances.

### `--leading-hero` is a literal, and the ladder gets no step below 1.0

`2026-07-28` · `type` · `human` · `notable`

Two changes to the leading ladder, arriving with `--text-hero`.

`--leading-relaxed` (1.475) joins it, closing the real gap between 1.4 and 1.6
where every measure under about 55ch sits.

Nothing joins it at the other end. The tempting argument is that
`--leading-none` is named for 1.0 as though 1.0 were the tightest a line can be
set, when it is only the tightest that is safe without knowing the face — and
that argument holds. The value did not survive it: 0.95 read as confident on a
two-line hero and cramped on a three-line one, closing up exactly where a hero
is most likely to land. So `--leading-hero` is 1.1, as a literal. It is not a
primitive, and inventing one for a single role puts a token in the ladder that
nothing else uses and that someone later re-derives.

**Ruled out:** a `--leading-negative` primitive at 0.95, and a `--leading-snug`
step in its place. Also ruled out: treating the relaxation as the fix for the
highlight overflow — it is a reading call, and the box constraint is separate
and still required. See *The highlight sizes its own box*.

**Cost:** the hero's leading is now the one line-height in the system that is
not a token reference, so a theme retuning the ladder does not reach it.

## 5. Motion

### `--dur-slow` + `--ease-decelerate` for large objects

`2026-07-26` · `motion` · `ai` · `notable`

A second duration/easing pair (320ms, `cubic-bezier(.22,1,.36,1)`) alongside the
standard 180ms, for sheets, drawers and view-transition groups.

The standard 180ms `--ease-standard` lands too abrupt on a large moving object.
Contributed up from `palette`, which drives every view-transition group off this
pair: mismatched easing between a resizing card and a sliding sheet reads as jank
even at a full frame rate.

**Ruled out:** one duration for everything. Simpler, and it makes large-object
motion feel broken in a way that is hard to attribute.

**Cost:** two pairs means authors must choose, and "large" is a judgment call.

---

## 6. Geometry & targets

### Radius is a token, and themes move it hard

`2026-07-24` · `geometry` · `human` · `notable`

`--radius-sm`, `--radius`, `--radius-lg`, `--pill`. Never a hardcoded pixel.

The range is deliberately extreme: `theme-portfolio` sets every radius to **0px**
(sharp, editorial), `theme-palette` is bubbly. Same components, and the shift
alone changes the character of the whole UI.

**Ruled out:** a fixed radius scale with per-theme nudges. The token has to be
able to go all the way.

**Cost:** a component that hardcodes even one corner breaks visibly under any
theme whose radius is far from that value.

**Amended 2026-07-26.** This entry originally cited `theme-portfolio`'s 0px as
the proof that the token must reach the extremes. That theme is now 18px — see
*`theme-portfolio` is midcentury, not sharp-editorial*. The argument is
unchanged and arguably better evidenced: the same components have now rendered at
both 0px and 18px with no component-level change.

### Corners are round by default, and squircle by shape

`2026-07-26` · `geometry` · `human` · `reversal`

Core's radius scale moves from 4/8/12/16 to **8/14/22/30**, and a second axis
arrives: `--corner-shape: squircle`.

The old scale read sharp on anything large enough to show a corner, and an
unthemed LDS should not look severe by default. The two themes that set their own
radius — product and palette — are untouched, because they override it.

`corner-shape` is a real CSS property here, not an approximation: `squircle` is a
continuous superellipse rather than a circular arc, so the curve starts earlier
and flattens through the corner. Verified against the whole ladder before
choosing — the `superellipse()` numbers run the *other* way, higher being
**squarer**, so `squircle` is the rounded end of that range and `superellipse(6)`
is nearly a box.

**Ruled out:** approximating a squircle with a very large `border-radius`, which
gives a rounder arc rather than a different curve. Also ruled out:
`superellipse(4)` and above, which are squarer than the default `round`.

**Cost:** applied to rectangular components only. At `--pill` (999px) the radius
clamps to half the short side, and a squircle there flattens the ends of what
should be a stadium — pills keep a circular arc. Browsers without `corner-shape`
drop the declaration and get the plain radius, so it degrades to the previous
look rather than breaking.

### `--target-min` is a floor of 44px that themes may raise

`2026-07-26` · `geometry` · `human` · `minor`

Minimum interactive target is a token, not a constant. Components must never
hardcode below it; themes may raise it.

`theme-palette` uses 44px for chrome that floats over artwork, where there is no
surrounding container to help the user aim.

**Ruled out:** hardcoding 44px in components. It would be correct today and
unraisable by a theme that needs more.

### Elevation is three steps, not one

`2026-07-26` · `geometry` · `measured` · `notable` · `f6d3373`

`--shadow-sm`, `--shadow-base`, `--shadow-lg`. Themes define all three;
`--card-shadow` survives as an alias for base.

LDS shipped exactly two shadow tokens, `--card-shadow` and `--btn-shadow`, and
that turned out to be a defect rather than a simplification. `.lds-modal` and
`.lds-glass` were written wanting deeper elevation than a card — they carried
`0 20px 50px` and `0 8px 24px` fallbacks to say so — but the fallback only fires
when the theme is silent. **Every theme defines `--card-shadow`, so every theme
silently flattened its modals onto card elevation.** The intent was in the
stylesheet and unreachable in practice.

`palette` found it, and `palette` also supplied the scale. Its 16 hand-written
box-shadows collapse onto three geometries that were already there, drifting
only in alpha — `0 2px 8px` at .20–.30 (thumbs, chips, the tab switcher),
`0 4px 16px` at .18–.35 (cards and floating pills), `0 12px 32px` (modals). Three
steps because three is what the components reached for on their own.

**Ruled out:** a full 5- or 6-step elevation ramp of the kind most systems ship.
Nothing in three consumers wanted a fourth step, and the unused steps would have
been invented rather than measured — which is how a scale stops meaning anything.

Also ruled out: fixing this by deleting `--card-shadow`. Themes and consumers
already reference it, and an alias costs nothing.

**Cost:** components now read `var(--shadow-lg, var(--card-shadow, …))`, a
two-deep fallback. That is the price of staying backwards-compatible with a
theme that defines only `--card-shadow` — such a theme behaves exactly as it did
before, which is the point.

---

## 7. Themes

### `theme-portfolio` is midcentury, not sharp-editorial

`2026-07-26` · `themes` · `human` · `reversal`

The theme is warm, soft and geometric: terracotta brand ramp, Jost, large
rounded corners, layered warm shadows, cream surfaces.

It previously ran the opposite way — 0px corners everywhere, no shadow at all,
13px body, Space Mono — and that version was internally consistent but read as
sterile and flat. Nothing separated a card from the page, and the type scale
started below the legible floor.

Jost is doing the specific work: a Futura revival, so circular bowls and a
single-storey `a`. That is what makes it read midcentury rather than merely
rounded. The corners are deliberately large — the arc has to be long enough to
read as a drawn curve rather than a chamfer, which is the difference between a
1960s television cabinet and a rounded rectangle.

**Amended 2026-07-26.** Jost was set on `--th-body` as well as `--th-display`;
body has since moved to Spectral. See *Sans heads, serif text*.

**Ruled out:** the sharp-editorial treatment, in full. Also ruled out: doing this
as a fourth theme. A new theme would have left the portfolio and every docs page
looking exactly as before, which was the actual complaint.

**Cost:** `docs/lew-design-system/pitch.html` overrides `.theme-portfolio` inline
with `--radius:0px` and `--card-shadow:none`, so that page still renders the old
treatment. Left alone deliberately — it may be demonstrating the sharp look on
purpose.

**Reversed 2026-07-27** by *`theme-portfolio` is oat, not midcentury*. What did
not hold was not the craft — it was that cream-plus-terracotta stopped being a
period reference and became the house style of AI-generated design. The radius
and shadow decisions made here survived the reversal intact.

### Body text is 16px, because 13px was under the floor

`2026-07-26` · `themes` · `human` · `reversal`

`--text-body` moves from `--size-2` (13px) to `--size-4` (16px), and the scale
above it re-spaces to 12 / 16 / 24 / 44.

Butterick puts web body text at **15–25px**. The old scale started below his
minimum, which is a large part of why the theme read as having no hierarchy:
when body copy is already too small, every level above it has to fight for
separation. Leading stays at 140%, inside his 120–145%.

**Ruled out:** 13px body, and the 13 / 19 / 44 progression — which had a hole at
the subhead level and a 2.3× jump to the title.

**Cost:** `--density` multiplies `--text-body` for button labels, so every button
in the theme grew from 13px to 16px. That is a real layout change for consumers,
not just a type change.

**Amended 2026-07-27.** `--text-body` moves again, to `--size-5` (19px), and
leading from 140% to 160%. The floor argument is unchanged and still the reason
13px was wrong; 16px simply sat *at* Butterick's minimum rather than inside it,
and Ronzino's x-height can carry the extra size. Same cost, one step larger:
button labels are now 19px.

### Warm neutrals are the grey ramp rotated, not new greys

`2026-07-26` · `themes` · `measured` · `notable`

The theme overrides `--grey-50…950` with a warm set. They are not invented:
core's greys converted to OKLCH, **lightness kept exactly**, hue rotated to 58
with a low chroma arc — fullest through the mids where warmth reads, near-zero at
the ends so paper stays paper and ink stays ink.

Measured drift against core: **max 0.27 Lc across all eleven steps.** The neutral
hierarchy is unchanged; only its temperature is.

Same method `theme-palette` used for its cool ramp, which is why it was reached
for here — it is the established way to warm a ramp in this system without
disturbing contrast.

**Ruled out:** picking cream neutrals by eye, which would have shifted contrast
somewhere and required re-verifying every emphasis pair.

**Amended 2026-07-27.** The method is untouched and is why the oat ramp was
cheap to build. What changed is that the hue is no longer *one* number: it now
runs 105 at the paper end to 150 at the ink end. See *The neutral ramp rotates
along its length*. Measured drift is now max 0.32 Lc.

### The neutral ramp rotates along its length, not once

`2026-07-27` · `themes` · `measured` · `notable`

`theme-portfolio` sets the neutral hue per step — 105 at `grey-50`, 150 at
`grey-950`, interpolated — rather than rotating the whole ramp to a single
number as *Warm neutrals* did.

It is forced by the brand having two neutrals that are not the same colour. Oat
is a yellow-green paper at hue 105. The ink is a green-black at hue 150. Fix one
hue for the ramp and you get one of them: at 105 the ink reads as a dark olive
under the paper, and at 150 the paper loses the oat entirely and reads mint.
Neither is the page.

The rotation stays inside a single colour family the whole way, which is what
separates it from the warm/cool neutral mix that was rejected earlier — that was
two families sharing a ramp, and it read as a mistake at the crossover.

Method is unchanged from *Warm neutrals*: core's lightness kept exactly, only
hue and chroma move. Measured drift against core: **max 0.32 Lc across all
eleven steps.**

**Ruled out:** a single hue for the ramp, in either direction. Also ruled out:
carrying the ink as a separate token outside the ramp — that works, and it is
what the configurator did while the brand was being solved, but it puts a
neutral where One Token cannot reach it, so no emphasis level can resolve to it.

**Cost:** the chroma arc is no longer symmetric. It dips through the mids and
rises again at `grey-900`, because the ink is the most chromatic neutral in the
theme rather than the least. Anyone re-deriving this ramp from the *Warm
neutrals* description alone will get a near-neutral ink and wonder where the
green went.

### `theme-portfolio` is oat, not midcentury

`2026-07-27` · `themes` · `human` · `reversal`

The theme is modular: an oat ground rotating to a green-black ink, one blue
brand ramp, Coconat over Ronzino, one chartreuse call-to-action. The references
are Vitsoe 606, USM Haller and Kunsthalle Basel rather than a 1960s living room.

This reverses *`theme-portfolio` is midcentury, not sharp-editorial*, and it is
worth being precise about what failed, because most of that entry was right.
The craft held. The radius, the shadow structure and the card/page argument all
survive this change untouched. What did not hold is that **cream plus terracotta
stopped being a period reference and became the default look of AI-generated
design.** A treatment that reads as a genre is not carrying the system's
argument; it is carrying somebody else's.

The correction is register, not hue. Oat is still a warm ground — it is a
yellow-green rather than a pink-cream, and it is far enough from cream that the
page does not read as the same gesture.

**Ruled out:** shipping this as a fifth theme and leaving `theme-portfolio`
alone. That was ruled out for the same reason last time: a new theme leaves the
portfolio and every docs page looking exactly as before, which is the actual
complaint. Also ruled out: keeping terracotta as a secondary accent — see
*Terracotta is retired, not demoted*.

**Cost:** the same one as last time, and it is now load-bearing.
`docs/lew-design-system/pitch.html` overrides `.theme-portfolio` inline, so it
renders neither treatment faithfully. Two reversals deep, that page is now
demonstrating a look no other page in the repo has.

### Terracotta is retired, and the accent is green

`2026-07-27` · `themes` · `human` · `notable`

The brand ramp becomes **green at OKLCH hue 150** — the ink's own hue — solved
to the same steep Lc curve the terracotta ramp used. There is no terracotta
token left anywhere in the theme.

Terracotta was reassigned out of existence rather than replaced. The ground took
the warmth it was providing. The neutral ramp took the borders. What remained
was an accent with no job that a colour carrying a *meaning* could not do
better.

Green rather than any other hue because it is the ink with the chroma turned
up. An accented word is then the same voice speaking louder, not a different
voice interrupting — which is the whole difference between a system with an
accent and a page with a highlight colour on it.

`--c-50` is the one step not solved to its target, and the reason is that the
target's reference is wrong on this theme. "Lc 0 against white" assumes a white
page. This page is oat, and a `c-50` solved against white measures **Lc 1.7**
against it — an `emph-subtle` surface invisible on the ground it sits on. Solved
against the paper instead, at Lc 8.2.

**Ruled out:** blue for the brand ramp, which was built and measured first and
was wrong for a reason worth recording: it made every accented word look
clickable. See *A link is not an accent*. Also ruled out: keeping terracotta on
a secondary role — a highlight, a hover, a status. Every one of those is a job
something else already does, and a colour kept because it would be a shame to
lose it is how a palette turns into a collection.

**Cost:** `--red` was the portfolio's alias onto the brand ramp, in five pages
and 99 rules. It is now `--accent`, because an alias named for a hue the ramp no
longer contains is worse than no alias. Any bookmarked snippet using
`var(--red)` is dead.

### A link is not an accent

`2026-07-27` · `themes` · `measured` · `notable`

`theme-portfolio` adds `--link` (and `--link-dark`, swapped in under
`mode-dark`). Links take it. Nothing else does.

One Token's seven roles have no link role, and the near-miss is `--text-accent`.
Painting links with the accent is wrong in both directions at once: every
accented word starts looking clickable, and every link starts looking like
emphasis. A link is not a position on the emphasis ladder — it is text with
behaviour.

Blue, hue 250, and it is the only colour in the theme that is not oat, ink,
green or chartreuse. Solved against the two grounds a link actually lands on
rather than against white: **Lc 88.6** on the paper and **Lc 75.9** on an
oat-200 panel. That second figure is what pushed it darker than the accent's own
step — a link solved only against the page fails the moment it sits in a card.

**Ruled out:** reusing `--text-accent`, and adding a link role to One Token. The
second is the tempting one, and it fails because the seven roles are *object*
colours — they describe a surface, its text, its border. A link is a behaviour,
and adding it would make the ladder a mix of two kinds of thing.

**Cost:** a link and the accent now measure at similar lightness and differ
mostly in hue, which is exactly the distinction some readers cannot make and no
greyscale print preserves. So **a link carries the underline as well as the
colour**, always. The underline is not decoration here; it is the part of the
signal that survives.

### `.emph-cta` is one button, not a sixth emphasis level

`2026-07-27` · `themes` · `human` · `notable`

The chartreuse call-to-action ships as two theme tokens (`--cta`, `--cta-text`)
and one class shaped like an emphasis level, deliberately outside the ladder.

It is shaped like one so it composes with components that paint from emphasis.
It is not one because the ladder is *ordinal* — plain, subtle, soft, strong,
stark is a scale of how loud, and every level retints. A call-to-action is not a
position on that scale; it is a cardinality rule. There is one on a page, and a
second one means neither is a call to action.

So it does not retint, and it does not flip with mode. The chartreuse holds in
both, because a highlighter's whole argument is that it is the brightest thing
present, and on a dark ground that is more true rather than less.

Measured: ink on chartreuse is Lc 87.8 against the Lc 75 body floor; chartreuse
against oat paper is Lc 9.5 against the Lc 8 surface floor, so it separates from
the page without needing a border.

**Ruled out:** an eleven-step chartreuse ramp. Build one and it is a second brand
hue, with two colours competing to mean *act on this*. Also ruled out: adding it
to One Token as a sixth emphasis, which would have made every component that
enumerates emphasis levels grow a case that means "and also the loud one".

**Cost:** two, and the second is the one that bites. `.emph-cta` sets the seven
roles by hand and will not track future changes to how emphasis resolves. And
because *Components paint from an explicit emphasis list* — core enumerates the
five levels by name rather than matching `[class*="emph-"]` — every component
that should accept a CTA needs opting in from the theme. `.lds-btn` is done;
anything else is a rule someone has to remember to write, and the failure is
silent: the class applies, the tokens resolve, and the component simply does not
paint.

### Card and page separate by shadow, not by contrast

`2026-07-26` · `themes` · `measured` · `notable`

The card sits at `#FFFCF8` against a `#FBF7F4` page. Measured separation between
them: **Lc 0.0** — deliberately none.

The shadow does that job instead, tinted with the brand's own dark step rather
than neutral black, because a grey shadow over warm paper turns it muddy. The
result reads softer than a contrast edge would.

**Ruled out:** separating the card from the page by lightness, which is the
conventional approach and reintroduces exactly the crispness this theme is
moving away from.

**Cost:** the whole surface hierarchy now depends on the shadow rendering. Print
styles, forced-colors mode, or any consumer that strips shadows gets a flat page
with no card boundaries at all.

### `emph-plain` is retuned per-theme, against measured floors

`2026-07-26` · `themes` · `measured` · `notable`

The theme overrides three of `emph-plain`'s roles. Two are contrast fixes, each
measured against the card surface:

- `--text-subdued` was `grey-500`, which measures **Lc 58.4** on the page — under
  the Lc 60 content floor. `grey-600` lands at **75.1**.
- `--border` was `grey-200`, which measures **Lc 13.0** on the card — under the
  Lc 15 non-text floor, i.e. not reliably visible at all. `grey-300` is **27.0**.
- `--background` is cream, because core pins it to `#FFFFFF` and warm neutrals
  need something warm to sit on.

This is the concrete answer to "it has no hierarchy": the old theme's secondary
text and its borders were **both below the floor they needed**. Not a matter of
taste — they were under-specified.

**Ruled out:** leaving emphasis resolution entirely to core. A theme overriding
role resolution is arguably outside its remit, and it is accepted here only
because the measurements showed core's defaults failing on this surface.

**Cost:** these are theme-level overrides of core behaviour, so a future change
to core's `emph-plain` will not reach `theme-portfolio`. Widening the floors in
core would be the better long-term fix.

### The portfolio consumes the theme through its own token layer

`2026-07-26` · `themes` · `human` · `reversal` 

All five pages — `index`, `about`, `brand-identity`, `system-ops`, `tools` —
now alias their eleven private tokens onto LDS —
`--red: var(--c-600)`, `--ink: var(--grey-900)`, `--font-body: var(--th-body)`
and so on — with `theme-portfolio emph-plain` on `<html>` so `:root` can resolve
the emphasis roles.

Before this, `theme-portfolio` appeared **once per page** on two of the five, on
a `<span>` wrapping the footer badge; the other three did not link `lds.css` at
all. Everything visible ran on a parallel, divergent copy of a
design system, while the badge in the corner read "Built on Lew Design System".
The claim was true of one element on the page.

The migration is cheap for a reason worth recording: the pages already routed
123 and 139 style usages through their own token names, so re-pointing eleven
declarations moved ~87% of the styling without touching a single component rule.
**That is the entire argument for having a token layer** — and it only paid off
because the original author had been disciplined about not scattering hexes.

**Ruled out:** rewriting the pages onto `.lds-*` components, which is a far
larger job for a portfolio whose layout is deliberately bespoke. Also ruled out:
leaving it and recording the gap, which keeps the badge overstating things.

**Cost:** the pages are in **quirks mode** — no doctype, `compatMode` is
`BackCompat`. This change deliberately did not add one, because flipping to
standards mode carries its own layout risk and deserves its own change. An
`<html>` tag alone does not affect the mode.

### The home page carries no token layer at all

`2026-07-27` · `themes` · `human` · `reversal`

`index.html` is rebuilt on LDS components. Its `<style>` block declares layout
and nothing else: no `--ink`, no `--rule`, no colour, no font family, no type
size that is not already a semantic role.

This reverses *The portfolio consumes the theme through its own token layer*
for this page only, and the earlier entry was right for its moment — a page that
predates the system needs a translation layer, and eleven aliases moved ~87% of
the styling onto the theme for almost no work. But a translation layer is a
migration tool, and keeping one after the migration means every value exists
under two names. Cards, lists, buttons, tags and nav parts now come from
`lds-*`, so there is nothing left to translate.

Two rules the page follows that are worth stating, because they are what keep it
honest rather than merely tidy:

- **Font size is not layout.** Where a component was too loud in context —
  `.lds-card__title` at `--text-title`, four-up — the page drops it one
  *semantic role* to `--text-subhead` and takes the leading and tracking with
  it. It never reaches for a pixel value.
- **Use the parts, not always the container.** The sticky bar takes
  `.lds-nav__logo` and `.lds-nav__links` but not `.lds-nav`, which is a floating
  pill with a border, a large radius and a shadow. A full-bleed sticky bar is a
  different object, and forcing the component to become one would have meant
  overriding four of its five declarations.

**Ruled out:** keeping the old page and re-pointing its aliases, which is what
the previous two theme changes did. It works, and it is why the page survived
three brand directions — but it also meant the site's front door was the one
page least able to demonstrate the system it advertises.

**Cost:** `about.html`, `tools.html`, `system-ops.html` and `brand-identity.html`
still run their own alias layers. The site is now half-migrated, and the four
remaining pages are the harder half.

### `index.html` gets a doctype

`2026-07-27` · `foundations` · `human` · `reversal`

`index.html` now opens with `<!doctype html>` and renders in standards mode.

Standing advice in `CLAUDE.md` was not to add one incidentally: these pages
rendered in quirks mode, and flipping a live layout into standards mode changes
box sizing, percentage heights and table cell inheritance in ways that surface
as small breakages everywhere at once.

That risk was entirely about the *existing* layout. The page was rebuilt, so
there is no legacy layout to break — which makes this the only moment the change
is free, and skipping it would have meant carrying quirks mode indefinitely.

**Ruled out:** rebuilding the page and leaving it in quirks mode for consistency
with the other four. Consistency with a mode nothing should be in is not a
reason.

**Cost:** `about.html`, `tools.html`, `system-ops.html` and `brand-identity.html`
are still quirks-mode, so the site now runs both. The advice in `CLAUDE.md`
still holds for those four, and for the same reason it always did.

### This brand sets no italic

`2026-07-27` · `type` · `human` · `notable`

No rule in the system sets `font-style: italic`, and neither shipped family
carries an oblique.

The `.it` class survives in `brand-identity`, `tools` and `system-ops` because
the markup uses it, but it now paints `--accent` instead of slanting. Emphasis
inside a heading is carried by colour, or by the chartreuse mark, or by weight.

The measurable half of the argument: with no oblique in the font files, every
`font-style: italic` in the repo was producing a **synthesised** slant — the
browser shearing an upright at roughly 12°, which breaks the stroke modulation
of a high-contrast serif precisely where it is most visible. The rule was
producing a worse result than no rule.

**Ruled out:** shipping the Ronzino and Coconat obliques so the italics would be
real. Four more files, ~160 kB, for a style the brand does not use.

### Documentation pages report the system, they do not restate it

`2026-07-26` · `foundations` · `human` · `notable`

`brand-identity.html` documents the palette and the type stack. Its swatches now
carry `data-token="--red"` and fill their own hex and typeface labels from the
live computed values at load.

They used to be typed in. So when the brand moved to terracotta, the page went on
displaying a chip labelled `--red` with `#C8391B` beside it — a brand page
asserting a value the brand no longer held. Same for the type specimens, which
named "DM Sans" and "Space Mono" as content while the tokens resolved to Jost and
Spectral.

This is the sharpest version of a rule already in the record: a page that
demonstrates the system must paint from it. Documentation restating values by
hand is not documentation, it is a second source of truth with no way to notice
it has diverged.

The same page also stated rules the theme had reversed — "zero border-radius,
the system has corners" and "no shadows, no soft cards". Both corrected: radius
is a theme knob that has now run at 0px and 18px, and cards lift on a
brand-tinted shadow.

**Ruled out:** updating the hexes by hand to the new values, which is what the
page had already proved does not hold.

**Cost:** the swatches need JS. With scripting off the chips still paint from
`var(--token)` via CSS, but the hex captions render empty rather than wrong —
chosen deliberately, since a blank label is honest and a stale one is not.

### A `data:` URI cannot read a token

`2026-07-26` · `themes` · `measured` · `minor`

The hand-drawn squiggle under "100+ color tokens into 7" is an SVG `data:` URI
in a `background` shorthand. CSS treats that URI as an opaque string, so
`var(--red)` does not resolve inside it. The hex has to be maintained by hand.

Found because it kept rendering the old vermilion for a while after everything
around it had moved to terracotta — the page looked migrated and one stroke was
not.

Inline SVG has no such problem: `.doodle path { stroke: var(--red) }` and
`.circled svg.oval` both tokenise correctly, which is why they moved on their own.

**Ruled out:** masking, which would tokenise it — `background-color: var(--red)`
plus a `mask-image`. It fails here because a mask applies to the element's text
as well, so it would knock out the words the squiggle sits under.

**Cost:** one hex on the page is permanently off-token and will go stale again at
the next brand move. Prefer inline SVG for any new annotation.

### `theme-palette` ships no brand hue

`2026-07-26` · `themes` · `human` · `reversal` · `9d48813`

Palette's theme has no brand colour. Its `--c-*` ramp is a cool neutral.

Palette is a gradient tool: **the artwork is the colour**. A violet brand ramp
would compete with every gradient on screen. The earlier version of this theme
was fiction — a violet ramp for an app that has no brand colour.

**Ruled out:** giving palette a brand hue because every other theme has one.

### The palette ramp is measured, not invented

`2026-07-26` · `themes` · `measured` · `reversal` · `9d48813`

Converting palette's 19 ad-hoc CSS colours to OKLCH shows they already land on
the **same lightness steps as the LDS grey ramp** — at hue ~285 with ~0.02
chroma, a cool violet cast. So the theme ramp is the LDS grey ramp rotated onto
palette's own measured hue, with 6 of 11 steps snapped to hexes palette already
ships.

Every emphasis pair LDS resolves from it clears WCAG AA 4.5:1; tightest is
`emph-strong` at 5.73:1. Verified, not eyeballed.

**Ruled out:** designing a neutral ramp by eye. The measurement meant the theme
could match the app instead of the app having to change.

### The palette type scale was one step too large

`2026-07-26` · `themes` · `measured` · `reversal` · `9d48813`

Corrected to palette's real 13px body / 11px caption.

As originally written the theme's scale was one step up, so adopting LDS
as-written would have silently restyled the entire app — the kind of change that
reads as "the design system broke my product" and ends adoption.

**Ruled out:** keeping the nominal scale and asking palette to absorb the shift.

---

### `theme-portfolio` becomes a shim

`2026-07-28` · `themes` · `human` · `structural`

The theme that was the brand has nothing left to declare: core carries the oat
neutrals, the green ramp, `--link`, `--cta`, the faces, the radius set, the
shadows and the retuned `.emph-plain` in both modes. `themes/portfolio.css` is
now an empty `.theme-portfolio{}` block.

It stays because `class="theme-portfolio"` is in the markup of six pages.
Deleting the file breaks nothing — the properties resolve from core — but
deleting the class from six pages is a separate change with its own diff.

**Ruled out:** deleting the file in this commit, which turns a token change into
a six-page markup change. Also ruled out: keeping a partial theme "for clarity",
which would silently shadow core for every page carrying the class.

**Cost:** an empty file that looks like an oversight. The comment inside it is
the only thing stopping someone re-adding values, and that comment is
load-bearing.

### The portfolio has no theme file

`2026-07-28` · `themes` · `human` · `structural`

Completes *`theme-portfolio` becomes a shim*: the class is gone from the markup
and `themes/portfolio.css` is deleted. The portfolio is now the only surface in
the system with no theme file, because core carries its brand — a theme is what
a surface declares in order to *diverge*, and this one has nothing to diverge
from.

The shim's own comment said six pages. That counted the pages carrying the
class; **eight** linked the stylesheet. `design-system/index.html` and
`index_a11y.html` linked it without ever setting the class, so removing the
class from six pages and deleting the file would have left two 404s. Grepping
for the class and grepping for the `<link>` return different sets, and only the
second one governs deletion.

The showcase switcher now emits **no** theme class for Portfolio rather than an
inert `theme-portfolio`. Selecting it means "core, unthemed", which is the
architecture stated rather than papered over.

**Ruled out:** keeping the empty shim indefinitely, which costs a network
request to assert that nothing is asserted. Also ruled out: renaming the shim to
`theme-core.css`, which reintroduces the shadowing hazard under a friendlier
name — core is not a theme and must not be selectable as one. Also ruled out:
deleting `docs/lew-design-system/pitch.html`'s inline `.theme-portfolio`, which
is a frozen pre-oat artifact with its own values and never linked this file.

**Cost:** `class="theme-portfolio"` in any consumer's markup is now silently
inert rather than loudly missing. Nothing breaks — the properties resolve from
core, which is what the class selected anyway — but there is no longer a file
whose absence would signal the rename.

## 8. Distribution

### npm from GitHub, not a CDN `<link>`

`2026-07-26` · `dist` · `human` · `reversal` · `9d48813`

```bash
npm i "github:matthewlew/matthewlew.github.io#v1.0.0"
```

The original plan was a jsDelivr `<link>`. That meant an unversioned network
dependency in the critical rendering path, no bundler involvement, and no way to
consume LDS from `palette`'s Vite + CSS-modules build at all.

Installing from GitHub keeps it free — no registry account, no hosting, no
recurring cost — while behaving like a real dependency.

**Ruled out:** jsDelivr, and publishing to the public npm registry. The registry
would work, but the package is one person's design system and the GitHub path
costs nothing.

### The manifest sits at the repo root

`2026-07-26` · `dist` · `measured` · `minor` · `9d48813`

`package.json` is at the root of `matthewlew.github.io`, not in
`design-system/`, with an `exports` map pointing into `design-system/dist`.

Not a preference: npm requires the manifest at the repo root for git
dependencies.

**Ruled out:** co-locating the manifest with the code it describes. It does not
work for this install method.

**Cost:** a design-system manifest at the root of a portfolio repo reads as
misplaced. The `exports` map is the only thing keeping the boundary legible.

### Pin the tag

`2026-07-26` · `dist` · `human` · `minor` · `9d48813`

Consumers install `#v1.0.0`, never a bare `github:matthewlew/matthewlew.github.io`.

A bare ref resolves to whatever is on `main` at install time — an unversioned
dependency that drifts between a local install and CI, with no lockfile entry to
catch it.

**Ruled out:** tracking `main` for convenience during early development.

### `ink` has no DOM and no dependencies

`2026-07-26` · `dist` · `human` · `minor` · `c7f9ade`

The sampler is pure computation over colour values. No `document`, no `canvas`,
no packages.

That is what makes it safe in Node, in workers, and in canvas export paths —
which is where palette actually needs it, not just in the browser.

**Ruled out:** reading pixels via `canvas` inside the module. Convenient in a
page, unusable everywhere else palette needs ink.

---

## Adding an entry

An entry is **required** when a change:

- alters what a token means
- adds or removes a role, component, or theme
- reverses a prior decision
- sets a constraint other consumers must respect

**Exempt:** typos, `dist` rebuilds, new example pages, and additions that follow
an existing pattern without changing it.

Write it in the same commit as the change. If you cannot name what the change
ruled out, it is not a decision.
