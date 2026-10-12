import { describe, it, expect } from 'vitest'
import '../js/gauge.js' // klassisches Skript, setzt globalThis.PvGauge
const { REGELN, waehleSegmente, anteil, nebeneinander } = globalThis.PvGauge

// "100%" in JetBrains Mono: 4 Zeichen à 0,6 em
const mono = (px) => 4 * 0.6 * px

describe('Fortschrittsbalken: Segmente und Schrift', () => {
  it('Kundenwunsch: lieber 40 Segmente, 20 nur als Rückfall', () => {
    expect(REGELN.anzahlen).toEqual([40, 20])
    expect(REGELN.minPx).toBe(10)
  })
  it('1350 px Balken (1440er Bildschirm): 40 Segmente, mindestens 11 px', () => {
    const { n, px } = waehleSegmente(1350, mono)
    expect(n).toBe(40)
    expect(px).toBeGreaterThanOrEqual(11)
  })
  it('1206 px Balken (1280er Bildschirm): 40 Segmente, 10 px', () => {
    expect(waehleSegmente(1206, mono)).toEqual({ n: 40, px: 10 })
  })
  it('zu schmal für 40: Rückfall auf 20 Segmente, größere Schrift', () => {
    const { n, px } = waehleSegmente(1000, mono)
    expect(n).toBe(20)
    expect(px).toBeGreaterThanOrEqual(10)
  })
  it('die Zahl passt immer in ein Segment', () => {
    for (const b of [1000, 1100, 1206, 1300, 1350, 1600]) {
      const { n, px } = waehleSegmente(b, mono)
      expect(mono(px), `Breite ${b}`).toBeLessThanOrEqual(b / n - REGELN.gap - 2 * REGELN.rand)
    }
  })
})

describe('Fortschrittsbalken: Füllstand und Sichtbarkeit', () => {
  it('Box i füllt bis zu ihrer rechten Kante: 20 %, 40 % … 100 %', () => {
    expect([0, 1, 2, 3, 4].map((i) => anteil(i, 5))).toEqual([0.2, 0.4, 0.6, 0.8, 1])
  })
  it('nur sichtbar, wenn alle Boxen in einer Reihe stehen', () => {
    expect(nebeneinander([10, 10, 10, 10, 10])).toBe(true)
    expect(nebeneinander([10, 10, 10, 340, 340])).toBe(false)
    expect(nebeneinander([])).toBe(false)
  })
})
