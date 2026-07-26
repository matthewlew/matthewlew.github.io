/* ==========================================================================
   LDS ink — the sampling half of `emph-media`.

   The CSS role derives every colour from `currentColor`, which leaves the
   consumer exactly one decision: what the ink should be. This module makes
   that decision against APCA, the contrast model LDS standardises on.

   Why APCA and not WCAG 2.x: WCAG's ratio is symmetric and ignores polarity,
   so it scores light-on-dark and dark-on-light identically and is known to be
   unreliable in the mid-tones — exactly where photographic and gradient
   backdrops sit. APCA (Lc) models polarity and perceptual lightness, so its
   answers hold up on the surfaces `emph-media` exists to serve.

   No dependencies, no DOM. Safe in Node, workers, and canvas export paths.
   ========================================================================== */

/* APCA 0.1.9 (W3C draft) constants. Do not tune these individually — they are
   fitted together, and changing one silently invalidates the published Lc
   thresholds. */
const MAIN_TRC = 2.4
const R_CO = 0.2126729, G_CO = 0.7151522, B_CO = 0.0721750
const NORM_BG = 0.56, NORM_TXT = 0.57, REV_TXT = 0.62, REV_BG = 0.65
const BLK_THRS = 0.022, BLK_CLMP = 1.414
const SCALE_BOW = 1.14, SCALE_WOB = 1.14
const LO_BOW_OFFSET = 0.027, LO_WOB_OFFSET = 0.027
const DELTA_Y_MIN = 0.0005, LO_CLIP = 0.1

/** Published APCA use-case floors. See docs/lew-design-system/apca-palette.md. */
export const Lc = {
  BODY: 90,        // body text, columns, >=14px/400
  BODY_LARGE: 75,  // minimum body text, >=18px/400 (or ~15px/600)
  CONTENT: 60,     // content text, 24px/400 or 16px/700
  LARGE: 45,       // headlines only — 36px, or 24px bold
  NON_TEXT: 30,    // placeholder, disabled, solid non-text
  FLOOR: 15,       // invisibility floor — borders, >=5px non-text
}

/** '#rgb' | '#rrggbb' -> [r, g, b] in 0–255. */
export function parseHex(hex) {
  let h = String(hex).trim().replace(/^#/, '')
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new TypeError(`lds-ink: bad hex ${hex}`)
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

/** APCA screen luminance (Y). Note this is a simple 2.4 power curve, NOT the
 *  piecewise sRGB transfer function WCAG uses — they are not interchangeable. */
export function srgbToY(hex) {
  const [r, g, b] = parseHex(hex)
  return R_CO * (r / 255) ** MAIN_TRC + G_CO * (g / 255) ** MAIN_TRC + B_CO * (b / 255) ** MAIN_TRC
}

/**
 * APCA lightness contrast between text and background, in Lc.
 *
 * Sign carries polarity: POSITIVE means dark text on a light background,
 * NEGATIVE means light text on dark. Compare `Math.abs(lc)` against a
 * threshold unless you specifically care about direction. Argument order
 * matters — unlike WCAG, this is not symmetric.
 *
 * @param {string} textHex foreground
 * @param {string} bgHex   background
 * @returns {number} roughly -108..106
 */
export function apcaContrast(textHex, bgHex) {
  let txtY = srgbToY(textHex)
  let bgY = srgbToY(bgHex)

  // Soft-clamp near-blacks; below this the curve misbehaves.
  if (txtY <= BLK_THRS) txtY += (BLK_THRS - txtY) ** BLK_CLMP
  if (bgY <= BLK_THRS) bgY += (BLK_THRS - bgY) ** BLK_CLMP

  if (Math.abs(bgY - txtY) < DELTA_Y_MIN) return 0

  let out
  if (bgY > txtY) {
    const sapc = (bgY ** NORM_BG - txtY ** NORM_TXT) * SCALE_BOW
    out = sapc < LO_CLIP ? 0 : sapc - LO_BOW_OFFSET
  } else {
    const sapc = (bgY ** REV_BG - txtY ** REV_TXT) * SCALE_WOB
    out = sapc > -LO_CLIP ? 0 : sapc + LO_WOB_OFFSET
  }
  return out * 100
}

/** Absolute Lc — the usual form for "is this legible enough". */
export function lcOn(textHex, bgHex) {
  return Math.abs(apcaContrast(textHex, bgHex))
}

/**
 * Pick the most legible ink for a backdrop from a list of candidates.
 *
 * Candidates are tried in order and the highest-Lc one wins, so pass them in
 * preference order. If the best still misses `min`, falls back to whichever of
 * white/black scores higher — that fallback always beats every candidate, so a
 * miss degrades to "legible but generic" rather than "on-brand but unreadable".
 *
 * @param {string}   bgHex
 * @param {string[]} candidates preferred inks, best-first
 * @param {number}   [min=Lc.BODY_LARGE]
 * @returns {{hex: string, lc: number, usedFallback: boolean}}
 */
export function bestInkOn(bgHex, candidates = [], min = Lc.BODY_LARGE) {
  let best = null
  let bestLc = -1
  for (const c of candidates) {
    const lc = lcOn(c, bgHex)
    if (lc > bestLc) { bestLc = lc; best = c }
  }
  if (best !== null && bestLc >= min) return { hex: best, lc: bestLc, usedFallback: false }

  const white = lcOn('#ffffff', bgHex)
  const black = lcOn('#000000', bgHex)
  return white >= black
    ? { hex: '#ffffff', lc: white, usedFallback: true }
    : { hex: '#000000', lc: black, usedFallback: true }
}

/**
 * Knockout ink for a backdrop, with no candidate list — the zero-config case.
 * This is what `emph-media--on-dark` / `--on-light` do statically.
 */
export function inkOn(bgHex) {
  return lcOn('#ffffff', bgHex) >= lcOn('#000000', bgHex) ? '#ffffff' : '#000000'
}
