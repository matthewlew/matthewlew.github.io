# LDS Do's and Don'ts

🚨 **Critical Rules**

**Token Hierarchy & Inheritance:**
* ❌ **NEVER** use raw hex values or bypass the One-Token architecture.
* ❌ **NEVER** create bespoke "primary" or "secondary" class variants in CSS for components like buttons or badges.
* ✅ **ALWAYS** use semantic inheritance or explicit `.emph-*` classes to drive color.
* ✅ **ALWAYS** let components inherit their environment (`var(--text)`, `var(--background)`) so they adapt contextually.

**Why:** The One-Token architecture allows a single emphasis class to re-resolve the entire color palette locally. Hardcoding overrides or new classes breaks the cascading theme logic and prevents seamless mode-switching.

---

## Quick Reference

### Typography Layers
* **Semantic Roles (Use these for UI):** `--text-title`, `--text-subhead`, `--text-body`, `--text-caption`
* **Primitive Scale (Use inside components):** `--size-0` through `--size-8`
* **Metadata:** Dates, tokens, code snippets, and system info **always** use `--th-mono`. It signals machine-readability.

### Surfaces & Emphasis
Instead of assigning specific colors, assign an emphasis role:
* **Standard Surface:** `.emph-plain` (White fill, neutral border, default ink).
* **Large Tinted Field:** `.emph-subtle` (Lightest wash — banners, cards; big fields stay gentle).
* **Small Tinted Component:** `.emph-soft` (Light tint one step up — tags, chips, primary buttons).
* **Primary Surface:** `.emph-strong` (Full brand fill, white text, high attention).
* **Knockout:** `.emph-stark` (Reverse/Near-black for maximum contrast).

### Corner Radius
* **Available Tokens:** `--radius-sm`, `--radius`, `--radius-lg`, `--pill`
* **Rule:** Never hardcode pixel values. These radii shift dynamically based on the active brand theme (e.g., Portfolio is sharp 0px, Palette is bubbly 18px).

---

## Color & Inheritance
**Do's**
* Let elements **inherit** their surface colors by default. A button on an `.emph-stark` card will automatically adapt to dark mode if it just listens to `var(--background)` and `var(--text)`.
* Use `.emph-*` classes **directly on elements** to create bespoke overrides without breaking the parent surface.
* Reserve signature accent colors for active states, labels, or a single rule line. Scarcity is the point.

**Don'ts**
* Don't flood the UI with the strong emphasis layer (`.emph-strong`). If it feels loud, there's too much.
* Don't create new color variables like `--button-primary-bg` — rely entirely on contextual emphasis variables.
* Don't add shadows or gradients-as-decoration. It breaks the structural language.

---

## Components & Layout

**Cards vs. Lists**
* **Do:** Use Cards only for standalone content with rich media and multiple actions.
* **Do:** Separate UI sections with 1px hairlines (`var(--border)`). Structure carries hierarchy, not drop shadows.
* **Don't:** Don't mix cards and list items for the same content type.

**CTAs & Buttons**
* **Primary Actions:** Drop an `.emph-strong` class on the button. Use for the main flow completion. Only one per view context.
* **Secondary Actions:** Use `.lds-btn--outline` (inherits from surface).
* **Tertiary Actions:** Use `.lds-btn--ghost` or icon-only for available actions that aren't the main purpose.
* **Do:** Use specific, action-oriented button text (e.g., "Read Case Study", not "Submit").
* **Don't:** Don't put two `.emph-strong` buttons next to each other.

---

## Writing Guidelines

**Capitalization & Tone**
* **Feature Names & Categories:** Title Case when referencing the feature ("Design Systems"), sentence case for general use.
* **App Pages / Sections:** Title Case ("Typography", "Corner Radius").
* **CTAs:** Sentence case, no punctuation ("Save changes").
* **Headlines:** Sentence case, no final punctuation.

**Terminology & Punctuation**
* **Metadata:** Always format in monospace.
* **Ampersands:** Use sparingly; write "and" in UX for accessibility.
* **Oxford comma:** Always.
* **Em dashes:** Always with spaces — like this.
* **Numbers:** Spell 0-9, digits 10+, digits in headlines/ranges.
* **Prices:** No decimals unless needed ($24 not $24.00).

---

## The System is the Statement
1. **Token-first:** Every color, size, and rule starts as a named token — never a one-off value.
2. **Machine-readable:** Structure that both a designer and an AI agent can parse and act on.
3. **Semantic layers:** Primitive → Semantic → Component. Meaning travels, values follow.
4. **Themeable:** Light, dark, and brand modes fall out of one architecture for free.
