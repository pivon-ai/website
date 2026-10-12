/**
 * Bereitet aus content/logo_v1.png alle Logo-Assets auf.
 * Einmalig auszufuehren mit: npm run logo
 *
 * Vorgehen:
 *  1. Flood-Fill vom Bildrand entfernt den zusammenhaengenden Hintergrund.
 *  2. Ein zweiter Durchgang entfernt eingeschlossene helle Flaechen
 *     (Punzen von p und o), aber nur solche ohne gesaettigte Nachbarn.
 *  3. Helle Saumpixel an der Kante werden entfernt.
 *  4. Zuschnitt, Umfaerben der Wortmarke, Verkleinern, Schreiben.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { PNG } from 'pngjs'

const SRC = 'content/logo_v1.png'
const OUT = 'images'

/** Farbabstand als Summe der Kanalunterschiede. */
const dist = (d, a, b) =>
  Math.abs(d[a] - d[b]) + Math.abs(d[a + 1] - d[b + 1]) + Math.abs(d[a + 2] - d[b + 2])

const maxCh = (d, o) => Math.max(d[o], d[o + 1], d[o + 2])
const minCh = (d, o) => Math.min(d[o], d[o + 1], d[o + 2])
const satur = (d, o) => maxCh(d, o) - minCh(d, o)
const lum = (d, o) => 0.2126 * d[o] + 0.7152 * d[o + 1] + 0.0722 * d[o + 2]

const SATURATED = 60   // ab hier gilt ein Pixel als bunt (Gehirn, nicht Wortmarke)
const LIGHT = 225      // ab hier gilt ein Pixel als hell
const LOWSAT = 25      // darunter gilt ein Pixel als unbunt

/** Schritt 1: zusammenhaengenden Hintergrund vom Rand her transparent machen. */
function floodFillFromBorder(png, tolerance = 18) {
  const { width: w, height: h, data } = png
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (i) => { if (!seen[i]) { seen[i] = 1; stack.push(i) } }

  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x) }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1) }

  while (stack.length) {
    const i = stack.pop()
    const o = i * 4
    data[o + 3] = 0
    const x = i % w
    const y = (i / w) | 0
    const neighbours = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
    for (const [nx, ny] of neighbours) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      const ni = ny * w + nx
      if (seen[ni]) continue
      const no = ni * 4
      // Vergleich gegen den AKTUELLEN Pixel, nicht gegen eine feste
      // Referenz - so folgt der Fill dem Helligkeitsverlauf des Hintergrunds.
      if (dist(data, o, no) <= tolerance) push(ni)
    }
  }
}

/**
 * Schritt 2: eingeschlossene helle Flaechen entfernen, sofern sie nicht
 * an gesaettigte Farbe grenzen. Das trifft die Punzen von p und o,
 * verschont aber die hellen Schaltkreispunkte im Gehirn.
 */
function removeEnclosedLightAreas(png) {
  const { width: w, height: h, data } = png
  const seen = new Uint8Array(w * h)
  const isLight = (i) => {
    const o = i * 4
    return data[o + 3] > 0 && maxCh(data, o) > LIGHT && satur(data, o) < LOWSAT
  }

  for (let start = 0; start < w * h; start++) {
    if (seen[start] || !isLight(start)) continue
    const component = []
    const stack = [start]
    seen[start] = 1
    let touchesSaturated = false

    while (stack.length) {
      const i = stack.pop()
      component.push(i)
      const x = i % w
      const y = (i / w) | 0
      const neighbours = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
      for (const [nx, ny] of neighbours) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const ni = ny * w + nx
        const no = ni * 4
        if (isLight(ni)) {
          if (!seen[ni]) { seen[ni] = 1; stack.push(ni) }
        } else if (data[no + 3] > 0 && satur(data, no) > SATURATED) {
          touchesSaturated = true
        }
      }
    }

    if (!touchesSaturated) {
      for (const i of component) data[i * 4 + 3] = 0
    }
  }
}

/** Schritt 3: helle Saumpixel an der Transparenzkante entfernen. */
function trimLightFringe(png, passes = 2) {
  const { width: w, height: h, data } = png
  for (let p = 0; p < passes; p++) {
    const kill = []
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        const o = i * 4
        if (data[o + 3] === 0) continue
        if (maxCh(data, o) <= 235 || satur(data, o) >= LOWSAT) continue
        const neighbours = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
        for (const [nx, ny] of neighbours) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          if (data[(ny * w + nx) * 4 + 3] === 0) { kill.push(o); break }
        }
      }
    }
    for (const o of kill) data[o + 3] = 0
  }
}

/** Begrenzungsrechteck aller deckenden Pixel. */
function bounds(png) {
  const { width: w, height: h, data } = png
  let minX = w, minY = h, maxX = -1, maxY = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] === 0) continue
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  return { minX, minY, maxX, maxY }
}

/** Groesste x-Koordinate mit gesaettigtem Pixel - das rechte Ende des Gehirns. */
function lastSaturatedColumn(png) {
  const { width: w, height: h, data } = png
  for (let x = w - 1; x >= 0; x--) {
    for (let y = 0; y < h; y++) {
      const o = (y * w + x) * 4
      if (data[o + 3] > 0 && satur(data, o) > SATURATED) return x
    }
  }
  return 0
}

function crop(png, minX, minY, maxX, maxY) {
  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const out = new PNG({ width: w, height: h })
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const s = ((y + minY) * png.width + (x + minX)) * 4
      const d = (y * w + x) * 4
      out.data[d] = png.data[s]
      out.data[d + 1] = png.data[s + 1]
      out.data[d + 2] = png.data[s + 2]
      out.data[d + 3] = png.data[s + 3]
    }
  }
  return out
}

/**
 * Faerbt die Wortmarke weiss. Wirkt nur rechts von fromX, damit die hellen
 * Schaltkreislinien im Gehirn unangetastet bleiben.
 * Dunkle Glyphenpixel werden voll deckend weiss, Kantenpixel anteilig.
 */
function whitenWordmark(png, fromX) {
  const { width: w, height: h, data } = png
  const DARK_REF = 45
  const LIGHT_REF = 246
  for (let y = 0; y < h; y++) {
    for (let x = fromX; x < w; x++) {
      const o = (y * w + x) * 4
      if (data[o + 3] === 0) continue
      if (satur(data, o) > SATURATED) continue
      const l = lum(data, o)
      let a = ((LIGHT_REF - l) / (LIGHT_REF - DARK_REF)) * 255
      a = Math.max(0, Math.min(255, Math.round(a)))
      data[o] = 255
      data[o + 1] = 255
      data[o + 2] = 255
      data[o + 3] = Math.round((a * data[o + 3]) / 255)
    }
  }
}

/** Box-Filter-Verkleinerung mit vormultipliziertem Alpha. */
function resize(png, targetW, targetH) {
  const out = new PNG({ width: targetW, height: targetH })
  const sx = png.width / targetW
  const sy = png.height / targetH
  for (let y = 0; y < targetH; y++) {
    const y0 = Math.floor(y * sy)
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy))
    for (let x = 0; x < targetW; x++) {
      const x0 = Math.floor(x * sx)
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx))
      let r = 0, g = 0, b = 0, a = 0, n = 0
      for (let yy = y0; yy < y1 && yy < png.height; yy++) {
        for (let xx = x0; xx < x1 && xx < png.width; xx++) {
          const o = (yy * png.width + xx) * 4
          const al = png.data[o + 3] / 255
          r += png.data[o] * al
          g += png.data[o + 1] * al
          b += png.data[o + 2] * al
          a += png.data[o + 3]
          n++
        }
      }
      const d = (y * targetW + x) * 4
      const aAvg = a / n
      const alNorm = aAvg / 255
      out.data[d] = alNorm > 0 ? Math.round(r / n / alNorm) : 0
      out.data[d + 1] = alNorm > 0 ? Math.round(g / n / alNorm) : 0
      out.data[d + 2] = alNorm > 0 ? Math.round(b / n / alNorm) : 0
      out.data[d + 3] = Math.round(aAvg)
    }
  }
  return out
}

/** Quadratische Leinwand, Motiv zentriert. */
function squarePad(png) {
  const side = Math.max(png.width, png.height)
  const out = new PNG({ width: side, height: side })
  out.data.fill(0)
  const ox = ((side - png.width) / 2) | 0
  const oy = ((side - png.height) / 2) | 0
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const s = (y * png.width + x) * 4
      const d = ((y + oy) * side + (x + ox)) * 4
      out.data[d] = png.data[s]
      out.data[d + 1] = png.data[s + 1]
      out.data[d + 2] = png.data[s + 2]
      out.data[d + 3] = png.data[s + 3]
    }
  }
  return out
}

/** Motiv auf eine deckende Flaeche setzen (fuer das OG-Bild). */
function onCanvas(png, w, h, rgb) {
  const out = new PNG({ width: w, height: h })
  for (let i = 0; i < w * h; i++) {
    const o = i * 4
    out.data[o] = rgb[0]
    out.data[o + 1] = rgb[1]
    out.data[o + 2] = rgb[2]
    out.data[o + 3] = 255
  }
  const ox = ((w - png.width) / 2) | 0
  const oy = ((h - png.height) / 2) | 0
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const s = (y * png.width + x) * 4
      const a = png.data[s + 3] / 255
      if (a === 0) continue
      const d = ((y + oy) * w + (x + ox)) * 4
      out.data[d] = Math.round(png.data[s] * a + out.data[d] * (1 - a))
      out.data[d + 1] = Math.round(png.data[s + 1] * a + out.data[d + 1] * (1 - a))
      out.data[d + 2] = Math.round(png.data[s + 2] * a + out.data[d + 2] * (1 - a))
    }
  }
  return out
}

/** ICO-Container mit eingebettetem PNG. */
function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(22)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(1, 4)
  header.writeUInt8(size === 256 ? 0 : size, 6)
  header.writeUInt8(size === 256 ? 0 : size, 7)
  header.writeUInt8(0, 8)
  header.writeUInt8(0, 9)
  header.writeUInt16LE(1, 10)
  header.writeUInt16LE(32, 12)
  header.writeUInt32LE(pngBuffer.length, 14)
  header.writeUInt32LE(22, 18)
  return Buffer.concat([header, pngBuffer])
}

const write = (name, png) => {
  writeFileSync(`${OUT}/${name}`, PNG.sync.write(png))
  console.log(`  ${name}  ${png.width} x ${png.height}`)
}

// ---------- Ablauf ----------
mkdirSync(OUT, { recursive: true })
console.log(`Lese ${SRC}`)
const src = PNG.sync.read(readFileSync(SRC))
console.log(`  Quelle: ${src.width} x ${src.height}`)

floodFillFromBorder(src)
removeEnclosedLightAreas(src)
trimLightFringe(src)

const b = bounds(src)
const padX = Math.round((b.maxX - b.minX) * 0.02)
const padY = Math.round((b.maxY - b.minY) * 0.02)
const full = crop(
  src,
  Math.max(0, b.minX - padX),
  Math.max(0, b.minY - padY),
  Math.min(src.width - 1, b.maxX + padX),
  Math.min(src.height - 1, b.maxY + padY)
)
console.log(`  Zugeschnitten: ${full.width} x ${full.height}`)

const brainEnd = lastSaturatedColumn(full)
console.log(`  Gehirn endet bei x = ${brainEnd} (Wortmarke beginnt danach)`)

const ratio = full.width / full.height
const h1x = Math.round(220 / ratio)
const h2x = Math.round(440 / ratio)

write('logo.png', resize(full, 220, h1x))
write('logo@2x.png', resize(full, 440, h2x))

const inverse = crop(full, 0, 0, full.width - 1, full.height - 1)
whitenWordmark(inverse, brainEnd + 1)
write('logo-invers.png', resize(inverse, 220, h1x))
write('logo-invers@2x.png', resize(inverse, 440, h2x))

const markRaw = crop(full, 0, 0, brainEnd, full.height - 1)
const markB = bounds(markRaw)
const mark = squarePad(crop(markRaw, markB.minX, markB.minY, markB.maxX, markB.maxY))
write('logo-mark.png', mark)

const fav32 = resize(mark, 32, 32)
write('favicon-32.png', fav32)
write('apple-touch-icon.png', resize(mark, 180, 180))

writeFileSync(`${OUT}/favicon.ico`, pngToIco(PNG.sync.write(fav32), 32))
console.log('  favicon.ico  32 x 32')

const ogLogo = resize(inverse, 700, Math.round(700 / ratio))
write('og-image.png', onCanvas(ogLogo, 1200, 630, [0x16, 0x29, 0x3f]))

console.log('Fertig.')
