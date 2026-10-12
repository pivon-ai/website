import { describe, it, expect } from 'vitest'
import '../js/kg-graph.js' // klassisches Skript, setzt globalThis.PvKgGraph
const {
  KNOTEN, KANTEN, REGELN, kreuzt, beziehungText, berechneLayout, platziere
} = globalThis.PvKgGraph

// Gemessene Geometrie der Bühne (Mockup L, Bühne 600 px): Zeilenrechtecke von
// Badge, Headline und Unterzeile, Lage des "s" von "umsetzen", Labelbreiten.
const BREITEN = [32.4, 61.2, 104.4, 97.2, 66.8, 66.8, 66.8, 73.4, 60.2, 66.8, 80, 47, 33.8, 33.8, 60.2, 86.6, 86.6, 60.2, 86.6, 60.2, 66.8]
const DESKTOP = {
  breite: 1425, hoehe: 600, schmal: false,
  text: [
    { l: 49.5, t: 142.1, r: 259.5, b: 158.1 },
    { l: 36.5, t: 194.5, r: 125.3, b: 286.5 }, { l: 125.3, t: 194.5, r: 803.9, b: 286.5 },
    { l: 803.9, t: 194.5, r: 957.3, b: 286.5 }, { l: 36.5, t: 284.2, r: 848.8, b: 376.2 },
    { l: 36.5, t: 404.9, r: 441.5, b: 428.9 }, { l: 36.5, t: 438.9, r: 218.9, b: 462.9 }
  ],
  grenze: { x: 610.4, unten: 375.9 },
  labelBreiten: BREITEN
}
const MOBIL = {
  breite: 360, hoehe: 568, schmal: true,
  text: [
    { l: 29, t: 131.3, r: 239, b: 147.3 }, { l: 16, t: 184.7, r: 259.4, b: 230.7 },
    { l: 16, t: 229.5, r: 224.5, b: 275.5 }, { l: 16, t: 274.4, r: 238.3, b: 320.4 },
    { l: 16, t: 319.2, r: 191.5, b: 365.2 }, { l: 16, t: 393, r: 262.7, b: 414 }, { l: 16, t: 422, r: 270.6, b: 443 }
  ],
  grenze: null,
  labelBreiten: BREITEN
}

// Wiederholbarer Zufall (mulberry32), damit die Tests deterministisch sind
function zufallMit(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const erweitert = (rects, m) => rects.map((h) => ({ l: h.l - m, t: h.t - m, r: h.r + m, b: h.b + m }))
const box = (p, w) => ({ l: p.x - 9, r: p.x + w, t: p.y - 9, b: p.y + 9 })
const ueberlappt = (a, b) => !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b)

describe('Daten des Knowledge Graph', () => {
  it('21 Begriffe, davon 4 Hubs', () => {
    expect(KNOTEN).toHaveLength(21)
    expect(KNOTEN.filter((k) => k.hub).map((k) => k.name)).toEqual(['KI', 'Mensch', 'Organisation', 'Technologie'])
  })
  it('28 Beziehungen, jede mit Verb und gültigen Endpunkten, 6 dauerhaft sichtbar', () => {
    const namen = new Set(KNOTEN.map((k) => k.name))
    expect(KANTEN).toHaveLength(28)
    for (const k of KANTEN) {
      expect(namen.has(k.von), k.von).toBe(true)
      expect(namen.has(k.nach), k.nach).toBe(true)
      expect(k.beziehung.length).toBeGreaterThan(2)
    }
    expect(KANTEN.filter((k) => k.immer).map((k) => k.beziehung))
      .toEqual(['erzeugt', 'trägt', 'plant', 'speist', 'automatisiert', 'wird zu'])
  })
  it('Regeln: 20 px zum Text, 40 px Rand zur Bühne, 20 px im Seitenkopf der Leistungsseiten', () => {
    expect(REGELN.abstand).toBe(20)
    expect(REGELN.rand).toBe(40)
    expect(REGELN.randUnterseite).toBe(20)
  })
})

describe('kreuzt', () => {
  const h = { l: 10, t: 10, r: 20, b: 20 }
  it('Strecke durch das Rechteck', () => expect(kreuzt(0, 15, 30, 15, h)).toBe(true))
  it('Strecke daneben', () => expect(kreuzt(0, 0, 30, 5, h)).toBe(false))
  it('Strecke endet vor dem Rechteck', () => expect(kreuzt(0, 15, 8, 15, h)).toBe(false))
})

describe('beziehungText', () => {
  it('Pfeil zeigt zum Ziel', () => {
    expect(beziehungText('trägt', 100, 200)).toBe('trägt →')
    expect(beziehungText('prägt', 200, 100)).toBe('← prägt')
  })
})

describe('berechneLayout – Regeln des Kunden (Desktop)', () => {
  const ATMEN = 5 // so weit bewegt sich ein Knoten beim "Atmen" höchstens
  for (const seed of [1, 2, 3, 4, 5]) {
    const { punkte } = berechneLayout(DESKTOP, zufallMit(seed))
    it(`Startwert ${seed}: kein Knoten und keine Kante näher als 20 px am Text (inkl. Atmen)`, () => {
      const zone = erweitert(DESKTOP.text, REGELN.abstand + ATMEN)
      punkte.forEach((p, i) => {
        for (const h of zone) expect(ueberlappt(box(p, BREITEN[i]), h), KNOTEN[i].name).toBe(false)
      })
      for (const k of KANTEN) {
        const a = punkte[KNOTEN.findIndex((n) => n.name === k.von)]
        const b = punkte[KNOTEN.findIndex((n) => n.name === k.nach)]
        for (const h of zone) expect(kreuzt(a.x, a.y, b.x, b.y, h), `${k.von}–${k.nach}`).toBe(false)
      }
    })
    it(`Startwert ${seed}: oben und unten genau 40 px Rand`, () => {
      const oben = Math.min(...punkte.map((p) => p.y - 9))
      const unten = DESKTOP.hoehe - Math.max(...punkte.map((p) => p.y + 9))
      expect(oben).toBeCloseTo(40, 1)
      expect(unten).toBeCloseTo(40, 1)
    })
    it(`Startwert ${seed}: rechts mindestens 40 px Rand (Beschriftung eingeschlossen)`, () => {
      punkte.forEach((p, i) => expect(p.x + BREITEN[i], KNOTEN[i].name).toBeLessThanOrEqual(DESKTOP.breite - 40 + 0.01))
    })
    it(`Startwert ${seed}: unter der Headline nichts links vom "s"`, () => {
      punkte.forEach((p, i) => {
        if (p.y + 9 > DESKTOP.grenze.unten) expect(p.x - 9, KNOTEN[i].name).toBeGreaterThanOrEqual(DESKTOP.grenze.x)
      })
    })
    it(`Startwert ${seed}: alles innerhalb der Bühne`, () => {
      punkte.forEach((p, i) => {
        expect(p.x - 9).toBeGreaterThanOrEqual(0)
        expect(p.x + BREITEN[i]).toBeLessThanOrEqual(DESKTOP.breite)
      })
    })
  }
})

describe('berechneLayout – mobil', () => {
  it('keine Kante durch Text, alles innerhalb der Bühne', () => {
    const { punkte } = berechneLayout(MOBIL, zufallMit(7))
    const zone = erweitert(MOBIL.text, 8)
    for (const k of KANTEN) {
      const a = punkte[KNOTEN.findIndex((n) => n.name === k.von)]
      const b = punkte[KNOTEN.findIndex((n) => n.name === k.nach)]
      for (const h of zone) expect(kreuzt(a.x, a.y, b.x, b.y, h), `${k.von}–${k.nach}`).toBe(false)
    }
    for (const p of punkte) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(MOBIL.hoehe)
    }
  })
})

describe('platziere', () => {
  const punkte = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 0 }]
  const breiten = [40, 40, 40]
  it('weicht einer Begriff-Beschriftung in der Kantenmitte aus', () => {
    const [t] = platziere(punkte, breiten, [{ a: 0, b: 1, breite: 30 }], [0.5, 0.25, 0.75], null)
    expect(t).not.toBe(0.5)
  })
  it('liefert den Ersatzwert, wenn keine Stelle frei ist', () => {
    const [t] = platziere(punkte, breiten, [{ a: 0, b: 2, breite: 300 }], [0.5], null)
    expect(t).toBe(null)
  })
})

describe('platziere – Beschriftungen halten Abstand zum Text', () => {
  const punkte = [{ x: 0, y: 0 }, { x: 300, y: 0 }]
  const breiten = [20, 20]
  it('meidet eine Sperrzone (Text) in der Kantenmitte', () => {
    const sperr = [{ l: 120, t: -20, r: 180, b: 20 }]
    const [t] = platziere(punkte, breiten, [{ a: 0, b: 1, breite: 30 }], [0.5, 0.25, 0.75], null, sperr)
    expect(t).not.toBe(0.5)
  })
  it('setzt keine Beschriftung in die Sperrzone, auch nicht als Ersatz', () => {
    const sperr = [{ l: -50, t: -50, r: 350, b: 50 }]
    const [t] = platziere(punkte, breiten, [{ a: 0, b: 1, breite: 30 }], [0.5, 0.25, 0.75], 0.5, sperr)
    expect(t).toBe(null)
  })
  it('Hover (mit Ersatz): bei Platzmangel lieber an einen Begriff als in den Text', () => {
    const eng = [{ x: 0, y: 0 }, { x: 100, y: 0 }]
    const sperr = [{ l: 30, t: -20, r: 70, b: 20 }]
    const [t] = platziere(eng, [90, 20], [{ a: 0, b: 1, breite: 20 }], [0.5, 0.2, 0.85], 0.5, sperr)
    expect(t).toBe(0.85)
  })
  it('dauerhaft (ohne Ersatz): bei Platzmangel weglassen', () => {
    const eng = [{ x: 0, y: 0 }, { x: 100, y: 0 }]
    const sperr = [{ l: 30, t: -20, r: 70, b: 20 }]
    const [t] = platziere(eng, [90, 20], [{ a: 0, b: 1, breite: 20 }], [0.5, 0.2, 0.85], null, sperr)
    expect(t).toBe(null)
  })
})

// Gemessene Geometrie des Seitenkopfs der Beratungsseite (1440 px breit):
// Brotkrumen, zweizeilige Überschrift, Unterzeile. Kein "s"-Grenzfall.
const UNTERSEITE = {
  breite: 1425, hoehe: 362, schmal: false, rand: 20,
  text: [
    { l: 36.5, t: 50, r: 115.7, b: 66 }, { l: 139.6, t: 50, r: 218.8, b: 66 }, { l: 242.8, t: 50, r: 306.1, b: 66 },
    { l: 36.5, t: 91.4, r: 441.9, b: 159.4 }, { l: 36.5, t: 157.5, r: 580.9, b: 225.5 },
    { l: 36.5, t: 240.5, r: 512.9, b: 261.5 }, { l: 36.5, t: 271.1, r: 154.4, b: 292.1 }
  ],
  grenze: null,
  labelBreiten: BREITEN
}

describe('berechneLayout – Seitenkopf der Leistungsseiten', () => {
  for (const seed of [1, 2, 3]) {
    const { punkte } = berechneLayout(UNTERSEITE, zufallMit(seed))
    it(`Startwert ${seed}: oben und unten genau 20 px Rand`, () => {
      expect(Math.min(...punkte.map((p) => p.y - 9))).toBeCloseTo(20, 1)
      expect(UNTERSEITE.hoehe - Math.max(...punkte.map((p) => p.y + 9))).toBeCloseTo(20, 1)
    })
    it(`Startwert ${seed}: kein Knoten und keine Kante näher als 20 px am Text`, () => {
      const zone = erweitert(UNTERSEITE.text, REGELN.abstand)
      punkte.forEach((p, i) => {
        for (const h of zone) expect(ueberlappt(box(p, BREITEN[i]), h), KNOTEN[i].name).toBe(false)
      })
      for (const k of KANTEN) {
        const a = punkte[KNOTEN.findIndex((n) => n.name === k.von)]
        const b = punkte[KNOTEN.findIndex((n) => n.name === k.nach)]
        for (const h of zone) expect(kreuzt(a.x, a.y, b.x, b.y, h), `${k.von}–${k.nach}`).toBe(false)
      }
    })
  }
})

describe('Englische Begriffe für en/', () => {
  const { beschriftung, ENGLISCH } = globalThis.PvKgGraph
  it('jeder Begriff und jede Beziehung hat eine Übersetzung', () => {
    for (const k of KNOTEN) expect(ENGLISCH.namen[k.name], k.name).toBeTruthy()
    for (const k of KANTEN) expect(ENGLISCH.beziehungen[k.beziehung], k.beziehung).toBeTruthy()
  })
  it('beschriftung liefert je Sprache die Anzeige-Texte in Datenreihenfolge', () => {
    expect(beschriftung('de').namen.slice(0, 2)).toEqual(['KI', 'Mensch'])
    expect(beschriftung('en').namen.slice(0, 2)).toEqual(['AI', 'People'])
    expect(beschriftung('en').beziehungen[0]).toBe('is based on')
  })
})

describe('Teilnetz je Leistung (data-kg-fokus)', () => {
  const { FOKUS, fokusKanten } = globalThis.PvKgGraph
  it('vier Teilnetze aus gültigen Begriffen', () => {
    expect(Object.keys(FOKUS)).toEqual(['beratung', 'startup-creator', 'entwicklung', 'quickstart-ki'])
    const namen = new Set(KNOTEN.map((k) => k.name))
    for (const liste of Object.values(FOKUS)) for (const n of liste) expect(namen.has(n), n).toBe(true)
  })
  for (const [name, liste] of Object.entries(FOKUS)) {
    it(`${name}: zusammenhängend, damit jede Beziehung beschriftet werden kann`, () => {
      const kanten = fokusKanten(liste).map((i) => KANTEN[i])
      const erreicht = new Set([liste[0]])
      for (let runde = 0; runde < liste.length; runde++) {
        for (const k of kanten) {
          if (erreicht.has(k.von)) erreicht.add(k.nach)
          if (erreicht.has(k.nach)) erreicht.add(k.von)
        }
      }
      expect([...erreicht].sort()).toEqual([...liste].sort())
    })
    it(`${name}: Layout hält Text-Abstand und 20 px Rand ein`, () => {
      const { punkte } = berechneLayout({ ...UNTERSEITE, fokus: liste }, zufallMit(11))
      const zone = erweitert(UNTERSEITE.text, REGELN.abstand)
      punkte.forEach((p, i) => {
        for (const h of zone) expect(ueberlappt(box(p, BREITEN[i]), h), KNOTEN[i].name).toBe(false)
      })
      expect(Math.min(...punkte.map((p) => p.y - 9))).toBeCloseTo(20, 1)
      expect(UNTERSEITE.hoehe - Math.max(...punkte.map((p) => p.y + 9))).toBeCloseTo(20, 1)
    })
  }
})
