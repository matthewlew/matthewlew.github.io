# One Token
**Consistent UI color for any project. Your AI writes the CSS. You just describe what you need.**

---

## What this is

One Token is a color system you teach your AI once. After that, every component it generates uses the same color logic — light mode, dark mode, your brand, error states, all of it — without you specifying a single hex value.

You describe intent. The AI resolves color.

---

## The system in full

### Seven object colors

Every component uses exactly these seven CSS variables. Nothing else.

| Variable | Role |
|---|---|
| `--background` | Surface fill of the component |
| `--text` | Primary content text |
| `--text-accent` | Brand labels, links, eyebrows |
| `--text-subdued` | Secondary or supporting text |
| `--icon` | Icon fills and strokes |
| `--border` | Primary outline |
| `--border-subdued` | Dividers and secondary outlines |

**The rule:** Components reference only these variables. Never hardcode a hex value. Never use a color utility directly (e.g. `text-green-500`). If a component needs a color, it uses one of the seven.

---

### Four classes on the container

Color is set on a *container*, not on the component. The component inherits.

**Mode** — light or dark surface
```
.mode-light
.mode-dark
```

**Hue** — the brand color family
```
.hue-brand     ← your primary brand color
.hue-red       ← errors, destructive actions
.hue-yellow    ← warnings
.hue-blue      ← informational, links
.hue-grey      ← neutral, no color
```

**Emphasis** — how much the surface stands out
```
.emph-plain    ← neutral, blends with the page
.emph-soft     ← light tint of the hue
.emph-strong   ← full brand color
.emph-stark    ← maximum weight
```

**Semantic shortcuts** — for common surfaces
```
.banner-success
.banner-error
.banner-warning
.banner-info
```

---

### How classes resolve to color

The combination of mode + hue + emphasis tells the AI what each variable should be. These are the rules to follow:

**light + plain**
- `--background`: white
- `--text`: near-black
- `--text-accent`: brand-600
- `--text-subdued`: grey-500 (neutral, never the hue color)
- `--icon`: grey-400
- `--border`: grey-200
- `--border-subdued`: grey-100

**dark + plain**
- `--background`: grey-950
- `--text`: white
- `--text-accent`: brand-300
- `--text-subdued`: grey-500 (neutral, never the hue color)
- `--icon`: grey-550
- `--border`: grey-800
- `--border-subdued`: grey-900

**light + soft**
- `--background`: hue-50
- `--text`: hue-800
- `--text-accent`: hue-600
- `--text-subdued`: hue-500
- `--icon`: hue-400
- `--border`: hue-200
- `--border-subdued`: hue-100

**dark + soft**
- `--background`: hue-900
- `--text`: hue-100
- `--text-accent`: hue-200
- `--text-subdued`: hue-400
- `--icon`: hue-400
- `--border`: hue-800
- `--border-subdued`: hue-900

**light + strong**
- `--background`: hue-500
- `--text`: white
- `--text-accent`: hue-100
- `--text-subdued`: hue-200
- `--icon`: hue-200
- `--border`: hue-600
- `--border-subdued`: hue-400

**dark + strong**
- `--background`: hue-600
- `--text`: white
- `--text-accent`: hue-100
- `--text-subdued`: hue-300
- `--icon`: hue-200
- `--border`: hue-700
- `--border-subdued`: hue-500

**light + stark**
- `--background`: hue-800
- `--text`: white
- `--text-accent`: hue-100
- `--text-subdued`: hue-300
- `--icon`: hue-200
- `--border`: hue-700
- `--border-subdued`: hue-600

**dark + stark** — intentionally inverted, near-white on dark page
- `--background`: grey-50
- `--text`: grey-900
- `--text-accent`: hue-600
- `--text-subdued`: grey-600
- `--icon`: grey-500
- `--border`: grey-200
- `--border-subdued`: grey-100

---

### Semantic banner shortcuts

These are the only pre-defined component-level classes. Everything else is built from the four container classes above.

```css
.banner-success {
  /* hue: green, emphasis: soft, mode: light */
}
.banner-error {
  /* hue: red, emphasis: soft, mode: light */
}
.banner-warning {
  /* hue: yellow, emphasis: soft, mode: light */
}
.banner-info {
  /* hue: blue, emphasis: soft, mode: light */
}
```

---

### Interaction states

Never write hover or pressed colors manually. Derive them by shifting the background one step on the palette scale.

- **Hover**: background shifts one step lighter (light mode) or darker (dark mode)
- **Pressed**: background shifts two steps
- **Inactive / disabled**: opacity 0.38, pointer-events none

---

### Palette scale

When generating a palette from a brand hex, produce 11 steps:

`50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 950`

- 50 is near-white, highly desaturated
- 500 is the brand color itself (or nearest perceptual match)
- 950 is near-black, deeply saturated

Always include grey as a neutral scale alongside the brand scale.

**Accessibility:** Text, text-accent, text-subdued, and icon must always meet WCAG AA — 4.5:1 contrast against their background. If a generated combination fails, shift the foreground token one step darker (light mode) or lighter (dark mode) until it passes. Border tokens have no contrast minimum.

---

## How to use this in your project

### 1. Set the context on your root element

```html
<body class="mode-light hue-brand emph-plain">
```

Every component inside inherits this. Nothing else needed.

### 2. Write components using only the seven variables

```css
.card {
  background: var(--background);
  color: var(--text);
  border: 1px solid var(--border);
}

.card-title    { color: var(--text); }
.card-subtitle { color: var(--text-subdued); }
.card-label    { color: var(--text-accent); }
```

### 3. Override theme on any element

```html
<!-- Promo banner: inherits mode and hue, overrides emphasis -->
<div class="card emph-strong">...</div>

<!-- Loyalty section: different hue entirely -->
<div class="card hue-blue emph-soft">...</div>

<!-- Dark card inside a light page -->
<div class="card mode-dark">...</div>
```

### 4. Use semantic classes for status banners

```html
<div class="banner banner-error">
  Payment failed. Check your card details.
</div>

<div class="banner banner-success">
  Order confirmed. Ready in 4 minutes.
</div>
```

### 5. Generate the CSS

Tell the AI: *"Using One Token rules from SKILL.md, generate the CSS for `.hue-brand` using #E8420A as the brand color, including all mode + emphasis combinations."*

The AI writes every combination. You own the output. No dependency, no package, no build step.

---

## What to tell your AI

Add this to your system prompt or `.cursorrules`:

```
Use One Token for all UI color (see SKILL.md).
- Components reference only: --background, --text, --text-accent,
  --text-subdued, --icon, --border, --border-subdued
- Theme is set by classes on the container: mode-*, hue-*, emph-*
- Never hardcode hex values in component CSS
- Never use framework color utilities (e.g. text-green-500) for
  component surfaces — use the seven variables instead
- Hover and pressed states are derived by shifting the background
  one or two palette steps, never written manually
- All text tokens must pass WCAG AA (4.5:1) against background
```

---

## Scope

One Token covers **color on UI surfaces**. It does not cover:

- Typography scale
- Spacing
- Shadows (beyond what color can express)
- Animation
- Layout

Keep it focused. Color is enough to solve.

---

## Why seven variables

Because your AI can hold seven things in mind and apply them consistently across every component it generates. A library of 200 tokens cannot be consistently applied — not by an AI, not by a developer working fast, not by a team of three.

Seven roles, four classes, one skill file. That's the whole system.

---

---

## Working example

A single card component using all seven variables. This is the reference implementation — every token appears exactly once, in the role it was designed for. Use this to verify your output matches the system.

### The component

```html
<!-- Container sets the theme. Component inherits. -->
<div class="mode-light hue-brand emph-soft">
  <div class="card">

    <!-- text-accent: brand label, eyebrow, anything that carries color -->
    <div class="card-label">New Arrival</div>

    <!-- text: primary content, highest contrast -->
    <div class="card-title">Iced Brown Sugar Oat Espresso</div>

    <!-- border-subdued: divides sections within the card surface -->
    <hr class="card-divider">

    <!-- text-subdued: supporting copy, must pass AA against --background -->
    <p class="card-body">
      Blonde espresso shaken with oat milk and brown sugar syrup.
    </p>

    <!-- icon: svg stroke or fill, same weight as text-subdued -->
    <div class="card-meta">
      <svg class="card-icon" viewBox="0 0 16 16" fill="none"
           stroke="currentColor" stroke-width="1.5">
        <circle cx="8" cy="8" r="6.5"/>
        <path d="M8 5v3.5l2 1.5"/>
      </svg>
      <span class="card-meta-text">230 cal · Available now</span>
    </div>

    <!-- button inherits the same seven variables from its container -->
    <button class="card-button">Order Now</button>

  </div>
</div>
```

### The CSS

```css
/* ── Card shell ─────────────────────────────────────
   --background: surface fill
   --border:     outer edge of the card                */
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Label ──────────────────────────────────────────
   --text-accent: brand color, eyebrow, category tag  */
.card-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-accent);
}

/* ── Title ──────────────────────────────────────────
   --text: primary content, always highest contrast   */
.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text);
}

/* ── Divider ────────────────────────────────────────
   --border-subdued: internal separator, lighter than
   the card's outer border                            */
.card-divider {
  border: none;
  border-top: 1px solid var(--border-subdued);
  margin: 0;
}

/* ── Body copy ──────────────────────────────────────
   --text-subdued: secondary text, must pass 4.5:1
   contrast against --background                      */
.card-body {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-subdued);
}

/* ── Meta row ───────────────────────────────────────
   --icon:         svg stroke color
   --text-subdued: label beside the icon, same weight */
.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-icon {
  width: 13px;
  height: 13px;
  color: var(--icon);
  flex-shrink: 0;
}

.card-meta-text {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-subdued);
}

/* ── Button ─────────────────────────────────────────
   Inherits all seven variables from the container.
   Uses --background as fill, --text as label,
   --border as outline.
   Hover shifts background one step — never written
   manually, always derived.                          */
.card-button {
  background: var(--background);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.12s;
}

.card-button:hover   { opacity: 0.85; }
.card-button:active  { opacity: 0.65; }
.card-button:disabled { opacity: 0.38; pointer-events: none; }
```

### What each token is doing

| Token | Where | Why |
|---|---|---|
| `--background` | Card fill, button fill | The surface color — set by emphasis + mode |
| `--text` | Title, button label | Highest contrast against background |
| `--text-accent` | Label / eyebrow | Brand color, draws the eye first |
| `--text-subdued` | Body copy, meta text | Secondary — readable but not dominant |
| `--icon` | SVG stroke | Same visual weight as text-subdued |
| `--border` | Card outline, button border | Primary edge — stronger than subdued |
| `--border-subdued` | Horizontal divider | Internal separator, lighter weight |

### What changes when you switch the container class

Same HTML. Same CSS. Different class on the wrapper.

```html
<!-- Soft green — default above -->
<div class="mode-light hue-brand emph-soft">

<!-- Strong green — full brand color background, white text -->
<div class="mode-light hue-brand emph-strong">

<!-- Dark soft — deep tint, light text -->
<div class="mode-dark hue-brand emph-soft">

<!-- Error surface — red hue, soft emphasis -->
<div class="mode-light hue-red emph-soft">

<!-- No color — neutral grey, no brand influence -->
<div class="mode-light hue-grey emph-plain">
```

The card CSS never changes. The variables resolve to different values based on the container. That is the entire system.

---

*One Token · MIT · github.com/matthewlew/one-token*
