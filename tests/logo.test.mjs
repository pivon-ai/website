import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { PNG } from 'pngjs'

const read = (p) => PNG.sync.read(readFileSync(p))

/** Anteil vollstaendig transparenter Pixel. */
function transparentShare(png) {
  let n = 0
  for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) n++
  return n / (png.width * png.height)
}

/** Zaehlt deckende Pixel, die hell und wenig gesaettigt sind. */
function countOpaqueLight(png) {
  let n = 0
  const d = png.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue
    const max = Math.max(d[i], d[i + 1], d[i + 2])
    const min = Math.min(d[i], d[i + 1], d[i + 2])
    if (max > 225 && max - min < 25) n++
  }
  return n
}

/** Zaehlt deckende, sehr dunkle Pixel im rechten Bildteil (Wortmarke). */
function countOpaqueDarkRight(png, fromFraction = 0.45) {
  let n = 0
  const startX = Math.floor(png.width * fromFraction)
  for (let y = 0; y < png.height; y++) {
    for (let x = startX; x < png.width; x++) {
      const i = (y * png.width + x) * 4
      if (png.data[i + 3] < 200) continue
      if (Math.max(png.data[i], png.data[i + 1], png.data[i + 2]) < 80) n++
    }
  }
  return n
}

function alphaAt(png, x, y) {
  return png.data[(y * png.width + x) * 4 + 3]
}

describe('Logo-Assets', () => {
  const files = [
    'images/logo.png',
    'images/logo@2x.png',
    'images/logo-invers.png',
    'images/logo-invers@2x.png',
    'images/logo-mark.png',
    'images/favicon-32.png',
    'images/favicon.ico',
    'images/apple-touch-icon.png',
    'images/og-image.png'
  ]

  it('erzeugt alle neun Dateien', () => {
    for (const f of files) expect(existsSync(f), f).toBe(true)
  })

  let logo, logo2x, invers2x, mark

  beforeAll(() => {
    logo = read('images/logo.png')
    logo2x = read('images/logo@2x.png')
    invers2x = read('images/logo-invers@2x.png')
    mark = read('images/logo-mark.png')
  })

  it('haelt die vorgegebenen Breiten ein', () => {
    expect(logo.width).toBe(220)
    expect(logo2x.width).toBe(440)
  })

  it('behaelt in beiden Aufloesungen dasselbe Seitenverhaeltnis', () => {
    const a1 = logo.width / logo.height
    const a2 = logo2x.width / logo2x.height
    expect(Math.abs(a1 - a2)).toBeLessThan(0.02)
  })

  it('hat die Ecken freigestellt', () => {
    expect(alphaAt(logo2x, 0, 0)).toBe(0)
    expect(alphaAt(logo2x, logo2x.width - 1, 0)).toBe(0)
    expect(alphaAt(logo2x, 0, logo2x.height - 1)).toBe(0)
    expect(alphaAt(logo2x, logo2x.width - 1, logo2x.height - 1)).toBe(0)
  })

  it('entfernt einen substanziellen Teil des Hintergrunds', () => {
    expect(transparentShare(logo2x)).toBeGreaterThan(0.2)
  })

  it('behaelt die hellen Schaltkreislinien im Gehirn', () => {
    // Waeren sie mit weggeschnitten worden, laege der Wert nahe null.
    expect(countOpaqueLight(logo2x)).toBeGreaterThan(300)
  })

  it('hat in der normalen Fassung eine dunkle Wortmarke', () => {
    expect(countOpaqueDarkRight(logo2x)).toBeGreaterThan(2000)
  })

  it('hat in der Inversfassung keine dunkle Wortmarke mehr', () => {
    expect(countOpaqueDarkRight(invers2x)).toBeLessThan(50)
  })

  it('liefert die Bildmarke quadratisch', () => {
    expect(Math.abs(mark.width - mark.height)).toBeLessThanOrEqual(1)
  })

  it('schreibt eine ICO-Datei mit gueltigem Kopf', () => {
    const ico = readFileSync('images/favicon.ico')
    expect(ico.readUInt16LE(0)).toBe(0) // reserviert
    expect(ico.readUInt16LE(2)).toBe(1) // Typ: Icon
    expect(ico.readUInt16LE(4)).toBe(1) // ein Bild
  })
})
