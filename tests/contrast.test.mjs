import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('css/tokens.css', 'utf8')

/** Liest den Wert einer Custom Property aus tokens.css. */
function token(name) {
  const m = css.match(new RegExp(`--${name}\\s*:\\s*(#[0-9A-Fa-f]{6})`))
  if (!m) throw new Error(`Token --${name} nicht in css/tokens.css gefunden`)
  return m[1]
}

function luminance(hex) {
  const v = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}

function ratio(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Spec Abschnitt 3, Kontrastnachweis. Vordergrund, Hintergrund, Mindestwert.
const PAIRS = [
  ['color-action', 'color-surface', 4.5, 'Aktionsfarbe auf Weiss'],
  ['color-surface', 'color-action', 4.5, 'Weiss auf Button'],
  ['color-text', 'color-surface', 4.5, 'Fliesstext'],
  ['color-text-muted', 'color-surface', 4.5, 'Sekundaertext'],
  ['color-text-meta', 'color-surface', 4.5, 'Kleintext'],
  ['color-text', 'color-surface-alt', 4.5, 'Fliesstext auf Flaeche'],
  ['color-text-muted', 'color-surface-alt', 4.5, 'Sekundaertext auf Flaeche'],
  ['color-mensch-text', 'color-mensch-bg', 4.5, 'Mensch'],
  ['color-orga-text', 'color-orga-bg', 4.5, 'Organisation'],
  ['color-tech-text', 'color-tech-bg', 4.5, 'Technologie'],
  ['color-accent-cyan-on-ink', 'color-ink', 3.0, 'Headline-Akzent Cyan'],
  ['color-accent-magenta-on-ink', 'color-ink', 3.0, 'Headline-Akzent Magenta'],
  ['color-on-ink', 'color-ink', 4.5, 'Weiss auf Navy'],
  ['color-on-ink-muted', 'color-ink', 4.5, 'Hero-Subline'],
  ['color-on-ink-soft', 'color-ink', 4.5, 'Footer-Text'],
  ['color-on-ink-faint', 'color-ink', 4.5, 'Footer-Kleintext'],
  ['color-error', 'color-surface', 4.5, 'Fehlertext im Formular'],
  ['color-on-ink', 'color-mensch', 4.5, 'Tag Mensch'],
  ['color-on-ink', 'color-orga', 4.5, 'Tag Organisation'],
  ['color-on-ink', 'color-tech-text', 4.5, 'Tag Technologie'],
  ['color-io-in', 'color-surface', 4.5, 'In-Text der Leistungskarten'],
  ['color-io-out', 'color-surface', 4.5, 'Out-Text der Leistungskarten']
]

describe('Kontraste nach WCAG 2.1 AA', () => {
  for (const [fg, bg, min, label] of PAIRS) {
    it(`${label}: --${fg} auf --${bg} erreicht ${min}:1`, () => {
      const r = ratio(token(fg), token(bg))
      expect(
        r,
        `${token(fg)} auf ${token(bg)} ergibt ${r.toFixed(2)}:1, noetig sind ${min}:1`
      ).toBeGreaterThanOrEqual(min)
    })
  }
})

describe('Farbregel', () => {
  it('definiert die Dreiklangfarben genau einmal', () => {
    for (const name of ['color-mensch', 'color-orga', 'color-tech']) {
      const hits = css.match(new RegExp(`--${name}\\s*:`, 'g')) || []
      expect(hits.length, `--${name}`).toBe(1)
    }
  })
})
