/**
 * Rechenregeln des Knowledge Graph auf der Bühne. Ohne DOM-Zugriff, damit sie
 * ohne Browser testbar sind - dasselbe Muster wie net-graph.js und scrollspy.js.
 * Abgenommen als Mockup L (mockups/l-knowledge-graph.html).
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  // Begriffe: Gruppe bestimmt die Farbe (Triade + KI), Hubs sind größer
  const KNOTEN = [
    ['KI', 'ki', true], ['Mensch', 'mensch', true], ['Organisation', 'orga', true], ['Technologie', 'tech', true],
    ['Use Case', 'ki'], ['Mehrwert', 'ki'], ['Prototyp', 'ki'],
    ['Strategie', 'orga'], ['Roadmap', 'orga'], ['Prozesse', 'orga'], ['Governance', 'orga'],
    ['Daten', 'tech'], ['LLM', 'tech'], ['RAG', 'tech'], ['Agenten', 'tech'],
    ['Integration', 'tech'], ['Architektur', 'tech'], ['Betrieb', 'tech'],
    ['Kompetenzen', 'mensch'], ['Mindset', 'mensch'], ['Adoption', 'mensch']
  ].map(([name, gruppe, hub]) => ({ name, gruppe, hub: !!hub }))

  // Beziehungen, gelesen "von  Beziehung  nach"; "immer" = auch ohne Hover sichtbar
  const KANTEN = [
    ['KI', 'Technologie', 'basiert auf'], ['KI', 'Mensch', 'unterstützt'], ['KI', 'Organisation', 'verändert'],
    ['KI', 'Use Case', 'wird konkret im'],
    ['Use Case', 'Mehrwert', 'erzeugt', true], ['Use Case', 'Prototyp', 'wird erprobt als'], ['Use Case', 'Roadmap', 'steht auf'],
    ['Mensch', 'Kompetenzen', 'braucht'], ['Mensch', 'Mindset', 'prägt'], ['Mensch', 'Adoption', 'trägt', true],
    ['Organisation', 'Prozesse', 'gestaltet'], ['Organisation', 'Governance', 'regelt durch'], ['Organisation', 'Strategie', 'folgt'],
    ['Strategie', 'Roadmap', 'plant', true],
    ['Technologie', 'LLM', 'nutzt'], ['Technologie', 'RAG', 'nutzt'], ['Technologie', 'Integration', 'erfordert'],
    ['Technologie', 'Architektur', 'folgt'],
    ['Daten', 'RAG', 'speist', true], ['Daten', 'Governance', 'unterliegt'], ['Daten', 'Prozesse', 'entstehen in'],
    ['LLM', 'Agenten', 'treibt'], ['Agenten', 'Prozesse', 'automatisiert', true],
    ['Prototyp', 'Betrieb', 'wird zu', true], ['Integration', 'Betrieb', 'ermöglicht'], ['Architektur', 'Integration', 'strukturiert'],
    ['Kompetenzen', 'Adoption', 'fördern'], ['Adoption', 'Mehrwert', 'sichert']
  ].map(([von, nach, beziehung, immer]) => ({ von, nach, beziehung, immer: !!immer }))

  // Leistungsseiten: Teilnetz, das zur Leistung gehört (data-kg-fokus am Canvas).
  // Jedes Teilnetz ist zusammenhängend, damit seine Beziehungen beschriftet werden können.
  const FOKUS = Object.freeze({
    beratung: ['KI', 'Organisation', 'Strategie', 'Roadmap', 'Use Case', 'Mehrwert'],
    'startup-creator': ['KI', 'Use Case', 'Prototyp', 'Betrieb', 'Mehrwert', 'Adoption'],
    entwicklung: ['Technologie', 'LLM', 'RAG', 'Daten', 'Agenten', 'Integration', 'Architektur', 'Betrieb'],
    'quickstart-ki': ['KI', 'Mensch', 'Kompetenzen', 'Mindset', 'Adoption', 'Mehrwert']
  })

  /** Indizes der Kanten, deren beide Enden im Teilnetz liegen */
  function fokusKanten(namen) {
    const drin = new Set(namen)
    return KANTEN.map((k, i) => (drin.has(k.von) && drin.has(k.nach) ? i : -1)).filter((i) => i >= 0)
  }

  // Englische Fassung (en/): Anzeige-Namen und Beziehungen; Schlüssel bleiben deutsch
  const ENGLISCH = Object.freeze({
    namen: {
      KI: 'AI', Mensch: 'People', Organisation: 'Organisation', Technologie: 'Technology',
      'Use Case': 'Use case', Mehrwert: 'Value', Prototyp: 'Prototype',
      Strategie: 'Strategy', Roadmap: 'Roadmap', Prozesse: 'Processes', Governance: 'Governance',
      Daten: 'Data', LLM: 'LLM', RAG: 'RAG', Agenten: 'Agents',
      Integration: 'Integration', Architektur: 'Architecture', Betrieb: 'Operations',
      Kompetenzen: 'Skills', Mindset: 'Mindset', Adoption: 'Adoption'
    },
    beziehungen: {
      'basiert auf': 'is based on', 'unterstützt': 'supports', 'verändert': 'changes',
      'wird konkret im': 'becomes concrete in', 'erzeugt': 'creates', 'wird erprobt als': 'is tested as',
      'steht auf': 'is on', 'braucht': 'needs', 'prägt': 'shapes', 'trägt': 'drives',
      'gestaltet': 'designs', 'regelt durch': 'governs through', 'folgt': 'follows', 'plant': 'plans',
      'nutzt': 'uses', 'erfordert': 'requires', 'speist': 'feeds', 'unterliegt': 'is subject to',
      'entstehen in': 'arise in', 'treibt': 'powers', 'automatisiert': 'automates', 'wird zu': 'becomes',
      'ermöglicht': 'enables', 'strukturiert': 'structures', 'fördern': 'foster', 'sichert': 'secures'
    }
  })

  /** Anzeige-Texte je Sprache, in der Reihenfolge von KNOTEN bzw. KANTEN */
  function beschriftung(sprache) {
    const en = sprache === 'en'
    return {
      namen: KNOTEN.map((k) => (en ? ENGLISCH.namen[k.name] : k.name)),
      beziehungen: KANTEN.map((k) => (en ? ENGLISCH.beziehungen[k.beziehung] : k.beziehung))
    }
  }

  // Vom Kunden festgelegt: Mindestabstand zum Text; Rand zur Bühne oben, unten und rechts (Desktop).
  // "randUnterseite" = Rand oben und unten im Seitenkopf der Leistungsseiten (rechts bleibt "rand").
  // "atmen" = Reserve für die leichte Bewegung der Knoten (±5 px) beim Zeichnen.
  const REGELN = Object.freeze({ abstand: 20, atmen: 6, rand: 40, randUnterseite: 20, mobilAbstand: 10 })

  const INDEX = new Map(KNOTEN.map((k, i) => [k.name, i]))
  const KANTEN_INDEX = KANTEN.map((k) => ({ a: INDEX.get(k.von), b: INDEX.get(k.nach) }))

  /** Schneidet die Strecke a–b das Rechteck h? (Liang-Barsky) */
  function kreuzt(ax, ay, bx, by, h) {
    const dx = bx - ax, dy = by - ay
    let t0 = 0, t1 = 1
    for (const [p, q] of [[-dx, ax - h.l], [dx, h.r - ax], [-dy, ay - h.t], [dy, h.b - ay]]) {
      if (p === 0) { if (q < 0) return false; continue }
      const t = q / p
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t }
      else { if (t < t0) return false; if (t < t1) t1 = t }
    }
    return true
  }

  /** Beziehung mit Pfeil in Leserichtung: Der Pfeil zeigt zum Ziel. */
  function beziehungText(beziehung, vonX, nachX) {
    return nachX >= vonX ? `${beziehung} →` : `← ${beziehung}`
  }

  const erweitert = (rects, m) => rects.map((h) => ({ l: h.l - m, t: h.t - m, r: h.r + m, b: h.b + m }))

  /**
   * Kräfte-Layout um den Text herum; beste von bis zu 24 Varianten.
   * @param {{breite:number, hoehe:number, schmal:boolean,
   *          text:Array<{l,t,r,b}>, grenze:{x:number, unten:number}|null,
   *          labelBreiten:number[], rand?:number, fokus?:string[]}} buehne  Maße relativ zum Canvas;
   *          fokus = Begriffe des Teilnetzes (Leistungsseiten): bekommen mehr Raum und liegen mittiger;
   *          fokusBeschriftung = [{a, b, breite}] Beziehungstexte des Teilnetzes, die Platz brauchen;
   *          rand = Abstand oben/unten (Standard REGELN.rand)
   * @param {() => number} zufall  Zufallsquelle (für Tests einspeisbar)
   * @returns {{punkte: Array<{x:number,y:number}>, wertung:number}}
   *          wertung 0 = keine Regel verletzt, keine Überlappung
   */
  function berechneLayout(buehne, zufall = Math.random) {
    const { breite: B, hoehe: H, schmal, text, grenze, labelBreiten, rand = REGELN.rand, fokus = null, fokusBeschriftung = [] } = buehne
    const imFokus = fokus ? new Set(fokus.map((n) => INDEX.get(n))) : null
    const vorn = (i) => !!imFokus && imFokus.has(i)
    const m = schmal ? REGELN.mobilAbstand : REGELN.abstand + REGELN.atmen
    const hin = erweitert(text, m)                // Knoten ↔ Text
    const kantenHin = erweitert(text, m)          // Kanten ↔ Text
    // Unter der Headline nichts links vom "s" von "umsetzen" (nur nach rechts verlassen)
    if (grenze) hin.push({ l: -1e4, t: grenze.unten - 6, r: grenze.x, b: 1e4, nurRechts: true })

    const x0 = B * 0.025, x1 = schmal ? B * 0.985 : B - REGELN.rand, y0 = H * 0.04, y1 = H * 0.96
    const textRechts = text.length ? Math.max(...text.map((h) => h.r)) + m : B * 0.4
    const cx = schmal ? B / 2 : grenze ? grenze.x + (x1 - grenze.x) * 0.5 : Math.min((textRechts + x1) / 2, x1 - 170)
    let cy = grenze ? y0 + (y1 - y0) * 0.55 : (y0 + y1) / 2
    let freiHoehe = y1 - y0
    if (schmal && text.length) {
      const oben = Math.min(...text.map((h) => h.t)) - m - y0
      const unten = y1 - (Math.max(...text.map((h) => h.b)) + m)
      cy = oben > unten ? y0 + oben / 2 : y1 - unten / 2
      freiHoehe = Math.max(oben, unten)
    }
    const L = schmal ? Math.max(Math.min(B, freiHoehe) / 3.4, 40)
      : Math.min(x1 - (grenze ? grenze.x : textRechts) + 120, y1 - y0) / 3.4

    // Startlage: Mensch unter der Headline (rechts vom "s"), Organisation oben
    // rechts, Technologie unten rechts – so laufen keine Kanten durch die Headline
    const hubPos = grenze
      ? { ki: [cx, cy - L * 0.1], mensch: [grenze.x + L * 0.8, y1 - L * 0.5], orga: [x1 - L * 1.1, y0 + L * 0.45], tech: [cx + L * 0.7, cy + L * 0.8] }
      : { ki: [cx, cy], mensch: [cx - L * 0.9, cy - L * 0.7], orga: [cx + L * 0.7, cy - L * 0.8], tech: [cx, cy + L * 0.9] }

    const knoten = KNOTEN.map((k, i) => ({ ...k, w: labelBreiten[i], x: 0, y: 0 }))
    const kanten = KANTEN_INDEX

    function startpositionen() {
      for (const n of knoten) {
        const [hx, hy] = hubPos[n.name === 'KI' ? 'ki' : n.gruppe]
        n.x = n.hub ? hx : hx + (zufall() - 0.5) * L
        n.y = n.hub ? hy : hy + (zufall() - 0.5) * L
      }
    }

    function begrenzen(n) {
      n.x = Math.max(x0, Math.min(x1 - n.w, n.x))
      n.y = Math.max(y0, Math.min(y1, n.y))
    }

    // Oberster und unterster Knoten (±9 px samt Quadrat/Beschriftung) liegen genau
    // "rand" vom Bühnenrand entfernt. Nur Desktop – mobil steht der Graph in der
    // freien Fläche unter dem Text.
    function senkrechtVerteilen() {
      if (schmal) return
      const oben = Math.min(...knoten.map((n) => n.y - 9))
      const unten = Math.max(...knoten.map((n) => n.y + 9))
      const f = (H - 2 * rand) / Math.max(unten - oben, 1)
      for (const n of knoten) n.y = rand + (n.y - 9 - oben) * f + 9
    }

    function simulieren() {
      for (let it = 0, temp = 1; it < 700; it++, temp *= 0.993) {
        const fx = new Float64Array(knoten.length), fy = new Float64Array(knoten.length)
        // Abstoßung zwischen Beschriftungsmitten; waagerecht zählt weniger,
        // weil Beschriftungen breit und flach sind
        for (let i = 0; i < knoten.length; i++) {
          for (let j = i + 1; j < knoten.length; j++) {
            const a = knoten[i], b = knoten[j]
            const dx = ((a.x + a.w / 2) - (b.x + b.w / 2)) / 1.7, dy = a.y - b.y
            const d2 = Math.max(dx * dx + dy * dy, 25), d = Math.sqrt(d2)
            // Teilnetz: mehr Abstand, damit seine Beschriftungen Platz finden
            const f = (L * L * 0.4) / d2 * (vorn(i) || vorn(j) ? 1.8 : 1)
            fx[i] += (dx / d) * f; fy[i] += (dy / d) * f
            fx[j] -= (dx / d) * f; fy[j] -= (dy / d) * f
          }
        }
        // Federn entlang der Kanten
        for (const k of kanten) {
          const a = knoten[k.a], b = knoten[k.b]
          const rest = ((a.hub && b.hub) ? L * 1.0 : L * 0.62) * (vorn(k.a) && vorn(k.b) ? 1.6 : 1)
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(Math.hypot(dx, dy), 1)
          const f = (d - rest) * 0.08
          fx[k.a] += (dx / d) * f; fy[k.a] += (dy / d) * f
          fx[k.b] -= (dx / d) * f; fy[k.b] -= (dy / d) * f
        }
        for (let i = 0; i < knoten.length; i++) {
          const n = knoten[i]
          fx[i] += (cx - n.x) * (vorn(i) ? 0.006 : 0.002)
          if (vorn(i)) fy[i] += (cy - n.y) * 0.004
          const len = Math.hypot(fx[i], fy[i]) || 1
          const step = Math.min(len, 12 * temp + 0.4)
          n.x += (fx[i] / len) * step; n.y += (fy[i] / len) * step
        }
        // jeden Schritt senkrecht verteilen, danach erst Text-Abstände durchsetzen –
        // so pendeln sich beide Bedingungen gemeinsam ein
        senkrechtVerteilen()
        for (const n of knoten) {
          // Knoten samt Beschriftung aus dem Text herausschieben (kürzester Weg)
          for (const h of hin) {
            const l = n.x - 9, r = n.x + n.w, t = n.y - 10, b = n.y + 10
            if (r < h.l || l > h.r || b < h.t || t > h.b) continue
            const wege = [['x', h.r - l], ['y', h.t - b], ['y', h.b - t], ['x', h.l - r]]
              .filter(([ach, v]) => (h.nurRechts ? ach === 'x' && v > 0 : ach === 'y' || n.x + v >= x0))
            const [ach, v] = wege.reduce((min, w) => (Math.abs(w[1]) < Math.abs(min[1]) ? w : min))
            if (ach === 'x') n.x += v; else n.y += v
          }
          begrenzen(n)
        }
        // Kanten, die durch Text laufen, vom Text wegschieben
        for (const k of kanten) {
          const a = knoten[k.a], b = knoten[k.b]
          for (const h of kantenHin) {
            if (!kreuzt(a.x, a.y, b.x, b.y, h)) continue
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
            const px = Math.max(h.l, Math.min(h.r, mx)), py = Math.max(h.t, Math.min(h.b, my))
            let dx = mx - px, dy = my - py
            if (dx === 0 && dy === 0) dx = 1 // Mitte liegt im Text: nach rechts
            const d = Math.hypot(dx, dy)
            a.x += (dx / d) * 2.5; a.y += (dy / d) * 2.5
            b.x += (dx / d) * 2.5; b.y += (dy / d) * 2.5
            begrenzen(a); begrenzen(b)
          }
        }
      }
    }

    // Regelverstöße wiegen schwer (10), Kanten durch fremde Beschriftungen mittel
    // (3, beim Zeichnen ohnehin verdeckt), enge Beschriftungen leicht (1)
    function bewerten() {
      let s = 0, hart = 0   // hart = Regelverstöße und fehlende Teilnetz-Beschriftungen
      for (const n of knoten) {
        for (const h of hin) if (!(n.x + n.w < h.l || n.x - 9 > h.r || n.y + 10 < h.t || n.y - 10 > h.b)) { s += 10; hart++ }
      }
      for (const k of kanten) {
        const a = knoten[k.a], b = knoten[k.b]
        for (const h of kantenHin) if (kreuzt(a.x, a.y, b.x, b.y, h)) { s += 10; hart++ }
        knoten.forEach((n, i) => {
          if (i === k.a || i === k.b) return
          if (kreuzt(a.x, a.y, b.x, b.y, { l: n.x + 6, r: n.x + n.w, t: n.y - 8, b: n.y + 8 })) s += 3
        })
      }
      for (let i = 0; i < knoten.length; i++) {
        for (let j = i + 1; j < knoten.length; j++) {
          const a = knoten[i], b = knoten[j]
          if (!(a.x + a.w < b.x - 9 || b.x + b.w < a.x - 9 || Math.abs(a.y - b.y) > 20)) s += 1
        }
      }
      // Teilnetz: alle Beziehungstexte müssen frei unterkommen (echte Platzierung
      // samt Atmen-Reserve durchgespielt); jeder, der keinen Platz findet, wiegt schwer
      if (fokusBeschriftung.length) {
        const pkt = knoten.map((n) => ({ x: n.x, y: n.y }))
        const t = platziere(pkt, labelBreiten, fokusBeschriftung, [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75], null, hin, REGELN.atmen)
        const fehlt = t.filter((x) => x === null).length
        s += 20 * fehlt; hart += fehlt
      }
      return { s, hart }
    }

    let beste = null, besteWertung = Infinity, besteHart = Infinity
    // Startseite: bis ein Layout ganz ohne Abzug gefunden ist. Leistungsseiten (Teilnetz):
    // mehr Versuche, aber Schluss, sobald nach ein paar Varianten nichts Hartes mehr stört
    // (spart auf langsamen Geräten spürbar Rechenzeit)
    for (let versuch = 0; versuch < (imFokus ? 32 : 24) && besteWertung > 0; versuch++) {
      startpositionen()
      simulieren()
      senkrechtVerteilen() // exakt "rand" oben und unten; Verstöße fängt bewerten() ab
      const { s: w, hart } = bewerten()
      if (w < besteWertung) { besteWertung = w; besteHart = hart; beste = knoten.map((n) => ({ x: n.x, y: n.y })) }
      if (imFokus && besteHart === 0 && versuch >= 3) break
    }
    return { punkte: beste, wertung: besteWertung, hart: besteHart }
  }

  /**
   * Stelle entlang einer Kante für eine Beschriftung.
   * Harte Grenze: Sperrzonen (Text samt Abstand) – dort landet nie eine
   * Beschriftung, auch nicht als Ersatz. Weiche Grenze: Begriff-Beschriftungen
   * und schon platzierte Beschriftungen. Ohne Ersatz (dauerhafte Beschriftung)
   * wird bei Platzmangel weggelassen; mit Ersatz (Hover) darf die Beschriftung
   * notfalls einen Begriff berühren, aber nie in eine Sperrzone.
   * @param {Array<{x,y}>} punkte  Knotenpositionen
   * @param {number[]} breiten  Breite der Begriff-Beschriftungen
   * @param {Array<{a:number,b:number,breite:number}>} eintraege  zu beschriftende Kanten
   * @param {number[]} kandidaten  Anteile entlang der Kante, in Wunschreihenfolge
   * @param {number|null} ersatz  Wert, wenn keine Stelle frei ist (nur außerhalb der Sperrzonen)
   * @param {Array<{l,t,r,b}>} [sperr]  Sperrzonen
   * @param {number} [luft]  zusätzlicher Abstand zu Begriff-Beschriftungen (Reserve fürs Atmen)
   * @returns {Array<number|null>} gewählter Anteil je Eintrag, null = nicht beschriften
   */
  function platziere(punkte, breiten, eintraege, kandidaten, ersatz, sperr = [], luft = 0) {
    const boxen = punkte.map((p, i) => ({ l: p.x - 10 - luft, r: p.x + breiten[i] + luft, t: p.y - 11 - luft, b: p.y + 11 + luft }))
    const frei = (r, liste) => liste.every((o) => r.r < o.l || r.l > o.r || r.b < o.t || r.t > o.b)
    const belegt = []
    return eintraege.map(({ a, b, breite }) => {
      const pa = punkte[a], pb = punkte[b]
      const rechteck = (t) => {
        const mx = pa.x + (pb.x - pa.x) * t, my = pa.y + (pb.y - pa.y) * t
        return { l: mx - breite / 2, r: mx + breite / 2, t: my - 9, b: my + 9 }
      }
      const nehmen = (t) => { belegt.push(rechteck(t)); return t }
      for (const t of kandidaten) {
        const r = rechteck(t)
        if (frei(r, sperr) && frei(r, boxen) && frei(r, belegt)) return nehmen(t)
      }
      // dauerhafte Beschriftungen (ersatz = null): lieber weglassen als eng setzen
      if (ersatz === null) return null
      // Hover-Beschriftungen: notfalls an einem Begriff, aber nie im Text
      if (frei(rechteck(ersatz), sperr)) return nehmen(ersatz)
      for (const t of kandidaten) if (frei(rechteck(t), sperr)) return nehmen(t)
      return null
    })
  }

  globalThis.PvKgGraph = Object.freeze({ KNOTEN, KANTEN, REGELN, KANTEN_INDEX, FOKUS, fokusKanten, ENGLISCH, beschriftung, kreuzt, beziehungText, berechneLayout, platziere })
})()
