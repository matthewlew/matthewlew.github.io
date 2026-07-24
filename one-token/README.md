# One Token

**The complete colors for your vibe coded project.**

I kept starting projects in Cursor and ending up with six different greens across twelve components. None of them were wrong exactly. But none of them looked like they belonged together.

One Token fixes that. It's a single skill file you point your AI at. After that, every component it generates uses the same color logic — light mode, dark mode, your brand color, error states — without you specifying a single hex value.

You describe intent. The AI resolves color.

---

## Install

```bash
# Copy SKILL.md into your project
curl -o SKILL.md https://raw.githubusercontent.com/matthewlew/one-token/main/SKILL.md
```

Or just download it manually and drop it in your project root.

---

## Use

Tell your AI about it once:

```
Use One Token for all UI color. Reference SKILL.md for the complete system.
Components use only: --background, --text, --text-accent, --text-subdued,
--icon, --border, --border-subdued. Set theme with classes on the container.
Never hardcode hex values.
```

Then describe what you need:

```
Build a card component with a title, body text, a divider, and an order button.
Use One Token. The container is mode-light hue-brand emph-soft.
```

The AI writes the CSS. You own it. No dependency, no package, no build step.

---

## What's in SKILL.md

- The seven color variables every component uses
- The four classes that set the theme on any container
- How emphasis levels resolve to actual color values
- Interaction states (hover, pressed, disabled) — derived, never written manually
- WCAG AA rules — which tokens require contrast checking and how to fix failures
- A complete working card component showing all seven variables in use
- How to switch the same component across five different themes by changing one class

---

## How it works

```html
<!-- Theme set on the container -->
<div class="mode-light hue-brand emph-soft">
  <div class="card">...</div>
</div>

<!-- Override emphasis on one element -->
<div class="card emph-strong">...</div>

<!-- Override hue for a different section -->
<div class="card hue-blue emph-soft">...</div>

<!-- Dark mode on any container -->
<div class="card mode-dark">...</div>
```

The card CSS never changes. Seven variables, resolved from context.

---

## Works with everything

Vanilla CSS, React, Next.js, Tailwind, Vue, Svelte — anything. The skill file teaches your AI the system. It writes whatever CSS your project uses.

---

## .cursorrules

Add this to your `.cursorrules` file:

```
Use One Token for all UI color (see SKILL.md).
Components reference only: --background, --text, --text-accent, --text-subdued,
--icon, --border, --border-subdued. Never hardcode hex values.
Set theme via classes on the container: mode-*, hue-*, emph-*.
```

---

## Demo

→ [Interactive playground](https://matthewlew.github.io/one-token)

---

MIT · Built by [@matthewlew](https://github.com/matthewlew)
