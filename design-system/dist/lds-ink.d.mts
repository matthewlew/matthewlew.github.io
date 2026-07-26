/** Published APCA use-case floors. See docs/lew-design-system/apca-palette.md. */
export declare const Lc: {
  /** Body text, columns, >=14px/400. */
  readonly BODY: 90
  /** Minimum body text, >=18px/400 (or ~15px/600). */
  readonly BODY_LARGE: 75
  /** Content text, 24px/400 or 16px/700. */
  readonly CONTENT: 60
  /** Large/heavy only — headlines 36px, or 24px bold. */
  readonly LARGE: 45
  /** Placeholder, disabled, solid non-text. */
  readonly NON_TEXT: 30
  /** Invisibility floor — borders, >=5px non-text. */
  readonly FLOOR: 15
}

/** `#rgb` | `#rrggbb` -> `[r, g, b]` in 0–255. Throws on malformed input. */
export declare function parseHex(hex: string): [number, number, number]

/** APCA screen luminance (Y). Not interchangeable with WCAG relative luminance. */
export declare function srgbToY(hex: string): number

/**
 * APCA lightness contrast, in Lc. Sign carries polarity: positive is dark text
 * on light, negative is light on dark. Not symmetric — argument order matters.
 */
export declare function apcaContrast(textHex: string, bgHex: string): number

/** Absolute Lc — the usual form for "is this legible enough". */
export declare function lcOn(textHex: string, bgHex: string): number

/**
 * Pick the most legible ink for a backdrop from candidates given in preference
 * order. Falls back to white/black when none clears `min`.
 */
export declare function bestInkOn(
  bgHex: string,
  candidates?: readonly string[],
  min?: number,
): { hex: string; lc: number; usedFallback: boolean }

/** Knockout white/black ink for a backdrop — the zero-config case. */
export declare function inkOn(bgHex: string): '#ffffff' | '#000000'
