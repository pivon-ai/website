import { describe, it, expect } from 'vitest'
import '../js/scrollspy.js' // klassisches Skript, setzt globalThis.PvScrollspy
const { aktiveSektion, aktiverLink } = globalThis.PvScrollspy

const LINIE = 315 // 35 % von 900 px Fensterhoehe

describe('aktiveSektion', () => {
  it('liefert null, wenn keine Sektion die Linie erreicht hat', () => {
    expect(aktiveSektion([{ id: 'a', top: 600 }, { id: 'b', top: 1400 }], LINIE)).toBeNull()
  })

  it('liefert null bei leerer Liste', () => {
    expect(aktiveSektion([], LINIE)).toBeNull()
  })

  it('waehlt die einzige Sektion oberhalb der Linie', () => {
    expect(aktiveSektion([{ id: 'a', top: 80 }, { id: 'b', top: 900 }], LINIE)).toBe('a')
  })

  it('waehlt die UNTERSTE oberhalb der Linie, nicht die oberste', () => {
    // Genau der Fehlerfall: b ist angesteuert, a ragt noch knapp herein.
    expect(aktiveSektion([{ id: 'a', top: -666 }, { id: 'b', top: 80 }], LINIE)).toBe('b')
  })

  it('bleibt bei der oberen, solange die naechste die Linie nicht erreicht', () => {
    expect(aktiveSektion([{ id: 'a', top: -200 }, { id: 'b', top: 400 }], LINIE)).toBe('a')
  })

  it('wechselt, sobald die naechste die Linie genau erreicht', () => {
    expect(aktiveSektion([{ id: 'a', top: -200 }, { id: 'b', top: 315 }], LINIE)).toBe('b')
  })

  it('waehlt bei mehreren oberhalb die unterste', () => {
    const s = [{ id: 'a', top: -900 }, { id: 'b', top: -400 }, { id: 'c', top: 10 }, { id: 'd', top: 800 }]
    expect(aktiveSektion(s, LINIE)).toBe('c')
  })

  it('ist unabhaengig von der Reihenfolge der Eingabe', () => {
    const s = [{ id: 'c', top: 10 }, { id: 'a', top: -900 }, { id: 'b', top: -400 }]
    expect(aktiveSektion(s, LINIE)).toBe('c')
  })

  it('behandelt eine Sektion genau auf der Linie als erreicht', () => {
    expect(aktiveSektion([{ id: 'a', top: 315 }], 315)).toBe('a')
  })
})

describe('aktiverLink', () => {
  const LINIE = 315
  const OBEN = [{ id: 'leistungen', top: 900 }, { id: 'vorgehen', top: 1800 }]
  const DRIN = [{ id: 'leistungen', top: -100 }, { id: 'vorgehen', top: 1800 }]

  it('markiert die Sektion, sobald eine erreicht ist', () => {
    expect(aktiverLink(DRIN, LINIE, 'inhalt')).toBe('leistungen')
  })

  it('faellt oberhalb der ersten Sektion auf die Startseite zurueck', () => {
    expect(aktiverLink(OBEN, LINIE, 'inhalt')).toBe('inhalt')
  })

  it('markiert nie zwei Ziele: die Sektion schlaegt die Startseite', () => {
    expect(aktiverLink(DRIN, LINIE, 'inhalt')).not.toBe('inhalt')
  })

  it('liefert null, wenn es kein Startseitenziel gibt', () => {
    expect(aktiverLink(OBEN, LINIE, null)).toBe(null)
  })

  it('liefert null, wenn startId gar nicht uebergeben wird', () => {
    expect(aktiverLink(OBEN, LINIE)).toBe(null)
  })

  it('faellt auch ohne Sektionen auf die Startseite zurueck', () => {
    expect(aktiverLink([], LINIE, 'inhalt')).toBe('inhalt')
  })
})
