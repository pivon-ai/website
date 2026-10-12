import { describe, it, expect } from 'vitest'
import '../js/net-graph.js' // klassisches Skript, setzt globalThis.PvNetGraph
const {
  KONFIG, knotenAnzahl, naechsteNachbarn, kantenDeckkraft, brueckenDeckkraft, sollAnimieren,
  sollLaufen, reagiertAufZeiger, mussNeuAufbauen
} = globalThis.PvNetGraph

describe('knotenAnzahl', () => {
  it('skaliert mit der Fläche', () => {
    expect(knotenAnzahl(1000, 680)).toBe(40) // 680000 / 17000
  })
  it('hat eine Untergrenze für kleine Flächen', () => {
    expect(knotenAnzahl(375, 360)).toBe(KONFIG.minKnoten)
  })
  it('hat eine Obergrenze für große Flächen', () => {
    expect(knotenAnzahl(1920, 1080)).toBe(KONFIG.maxKnoten)
  })
})

describe('naechsteNachbarn', () => {
  const k = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 30 }, { x: 100, y: 100 }]
  it('liefert die k nächsten ohne den Knoten selbst, aufsteigend', () => {
    expect(naechsteNachbarn(k, 0, 2)).toEqual([[10, 1], [30, 2]])
  })
  it('liefert höchstens so viele, wie es andere Knoten gibt', () => {
    expect(naechsteNachbarn(k, 0, 9)).toHaveLength(3)
  })
})

describe('Deckkraft', () => {
  it('Kanten verblassen bis zur Kantenlänge auf 0', () => {
    expect(kantenDeckkraft(0)).toBeCloseTo(0.38)
    expect(kantenDeckkraft(KONFIG.kante)).toBe(0)
    expect(kantenDeckkraft(KONFIG.kante + 1)).toBe(0)
  })
  it('Brücken gibt es nur zwischen Kantenlänge und Brückenlänge', () => {
    expect(brueckenDeckkraft(KONFIG.kante)).toBe(0)
    expect(brueckenDeckkraft(KONFIG.kante + 1)).toBeGreaterThan(0)
    expect(brueckenDeckkraft(KONFIG.bruecke)).toBe(0)
  })
})

describe('sollAnimieren', () => {
  it('animiert nicht bei reduzierter Bewegung', () => {
    expect(sollAnimieren(true)).toBe(false)
    expect(sollAnimieren(false)).toBe(true)
  })
})

// Abschluss-Review: drei Laufzeit-Entscheidungen als reine Funktionen

describe('sollLaufen', () => {
  it('läuft nur, wenn sichtbar, Tab vorn und keine reduzierte Bewegung', () => {
    expect(sollLaufen({ imBild: true, tabVerborgen: false, reduziert: false })).toBe(true)
  })
  it('läuft nach Tab-Rückkehr nicht, solange die Fläche außerhalb des Bildes ist', () => {
    expect(sollLaufen({ imBild: false, tabVerborgen: false, reduziert: false })).toBe(false)
  })
  it('läuft nicht, solange das Layout noch nicht berechnet ist (Schrift lädt noch)', () => {
    expect(sollLaufen({ imBild: true, tabVerborgen: false, reduziert: false, bereit: false })).toBe(false)
  })
  it('läuft nicht bei verborgenem Tab oder reduzierter Bewegung', () => {
    expect(sollLaufen({ imBild: true, tabVerborgen: true, reduziert: false })).toBe(false)
    expect(sollLaufen({ imBild: true, tabVerborgen: false, reduziert: true })).toBe(false)
  })
})

describe('reagiertAufZeiger', () => {
  it('bei reduzierter Bewegung folgt nichts dem Mauszeiger', () => {
    expect(reagiertAufZeiger(true)).toBe(false)
    expect(reagiertAufZeiger(false)).toBe(true)
  })
})

describe('mussNeuAufbauen', () => {
  it('kein Neuaufbau, wenn sich die Fläche nicht verändert hat (mobile Adressleiste)', () => {
    expect(mussNeuAufbauen({ b: 375, h: 680 }, { b: 375, h: 680 })).toBe(false)
  })
  it('Neuaufbau bei echter Größenänderung', () => {
    expect(mussNeuAufbauen({ b: 375, h: 680 }, { b: 812, h: 375 })).toBe(true)
  })
})
