/**
 * Knowledge Graph auf der Bühne der Startseite und im Seitenkopf der
 * Leistungsseiten. Reine Dekoration: ohne dieses Skript bleibt der dunkle
 * Hintergrund mit Raster, nichts fehlt.
 * Benannte Begriffe, feste Beziehungen, einige dauerhaft beschriftet; beim
 * Hover erscheinen alle Beziehungen eines Begriffs. Der Graph umfließt den
 * Text (Badge bzw. Brotkrumen, Headline, Unterzeile) mit Abstand (Regeln in
 * kg-graph.js).
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const { KNOTEN, KANTEN, KANTEN_INDEX, REGELN, FOKUS, fokusKanten, beschriftung, beziehungText, berechneLayout, platziere } = globalThis.PvKgGraph
  // Begriffe in der Sprache der Seite (<html lang>)
  const { namen: NAME, beziehungen: BEZIEHUNG } = beschriftung(document.documentElement.lang === 'en' ? 'en' : 'de')
  const { sollLaufen, reagiertAufZeiger, mussNeuAufbauen } = globalThis.PvNetGraph

  const cv = document.querySelector('.pv-hero canvas.pv-kg, .pv-pagehead canvas.pv-kg')
  const ctx = cv && cv.getContext('2d')

  if (ctx) {
    const flaeche = cv.parentElement
    // Seitenkopf der Leistungsseiten: eigener Rand oben und unten (REGELN.randUnterseite)
    const rand = flaeche.classList.contains('pv-pagehead') ? REGELN.randUnterseite : REGELN.rand
    // Leistungsseiten: das Teilnetz der Leistung steht vorn, der Rest tritt zurück
    const fokusNamen = FOKUS[cv.dataset.kgFokus] || null
    const fokus = fokusNamen ? new Set(fokusNamen.map((n) => KNOTEN.findIndex((k) => k.name === n))) : null
    const fokusListe = fokusNamen ? fokusKanten(fokusNamen) : []
    const imFokus = (i) => !fokus || fokus.has(i)
    const kanteImFokus = (k) => !!fokus && fokus.has(k.a) && fokus.has(k.b)
    const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Zeichenfarben des Canvas; CSS-Tokens sind hier ohne Stilabfrage zur
    // Laufzeit nicht lesbar – die Kommentare nennen das jeweilige Token.
    const FARBE = { ki: '#2F6BEC', mensch: '#E5258E', orga: '#7A3BE0', tech: '#12B6F3' } // Logo-Verlauf
    const TEXT = 'rgba(182, 198, 216, '   // --color-on-ink-muted
    const NAVY = '#16293F'                 // --color-ink
    const WEISS = '#FFFFFF'                // --color-on-ink
    const MONO = '"JetBrains Mono", ui-monospace, monospace'

    const nachbarn = KNOTEN.map(() => new Set())
    for (const k of KANTEN_INDEX) { nachbarn[k.a].add(k.b); nachbarn[k.b].add(k.a) }
    const phasen = KNOTEN.map(() => [Math.random() * 6.28, Math.random() * 6.28])

    let B = 0, H = 0, schmal = false, punkte = [], breiten = [], immerT = new Map(), fokusT = new Map(), textZonen = []
    let laeuft = false, raf = 0, imBild = false, hover = -1, hoverT = new Map(), impulse = []
    const t0 = performance.now()

    const relativ = (r, r0) => ({ l: r.left - r0.left, t: r.top - r0.top, r: r.right - r0.left, b: r.bottom - r0.top })

    // Zeilenrechtecke des Textes (relativ zum Canvas): Startseite Badge,
    // Headline, Unterzeile; Leistungsseiten Brotkrumen, Headline, Unterzeile
    const TEXT_TEILE = ['.pv-badge', '.pv-hero__title', '.pv-hero__lead',
      '.pv-breadcrumb', '.pv-pagehead__title', '.pv-pagehead__lead']
    function textRechtecke() {
      const r0 = cv.getBoundingClientRect(), rects = []
      for (const sel of TEXT_TEILE) {
        const el = flaeche.querySelector(sel)
        if (!el) continue
        // Badge hat einen Rahmen: Abstand gilt ab dem Kasten
        if (sel === '.pv-badge') { rects.push(relativ(el.getBoundingClientRect(), r0)); continue }
        // sonst nur echte Textzeilen messen: Blockelemente (z. B. die Liste der
        // Brotkrumen) lieferten sonst ein Rechteck über die ganze Breite
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.data.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(n)
          for (const r of range.getClientRects()) rects.push(relativ(r, r0))
        }
      }
      return rects
    }

    // Linke Kante des "s" von "umsetzen" und Unterkante der Headline (nur Startseite).
    // Wort und Buchstabe stehen in data-kg-grenze (Wort:Index), damit die
    // englische Fassung ihre eigene Stelle hat; Standard "umsetzen:2".
    function grenzeUnterHeadline() {
      const h1 = flaeche.querySelector('.pv-hero__title')
      if (!h1) return null
      const [wort, stelle] = (h1.dataset.kgGrenze || 'umsetzen:2').split(':')
      const idx = Number(stelle) || 0
      const r0 = cv.getBoundingClientRect()
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const i = n.data.indexOf(wort)
        if (i < 0) continue
        const range = document.createRange()
        range.setStart(n, i + idx)
        range.setEnd(n, i + idx + 1)
        return { x: range.getBoundingClientRect().left - r0.left, unten: h1.getBoundingClientRect().bottom - r0.top }
      }
      return null
    }

    function labelBreite(k, i) {
      ctx.font = k.hub ? `700 12px ${MONO}` : `11px ${MONO}`
      return (k.hub ? 14 : 10) + ctx.measureText(k.hub ? NAME[i].toUpperCase() : NAME[i]).width + 4
    }

    // Breite eines Teilnetz-Beziehungstexts samt Pfeil (Leserichtung erst nach dem Layout bekannt)
    function fokusTextBreite(i) {
      ctx.font = `10px ${MONO}`
      return ctx.measureText(`← ${BEZIEHUNG[i]}`).width + 8
    }

    function aufbauen() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      B = flaeche.clientWidth; H = flaeche.clientHeight
      cv.width = B * dpr; cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      schmal = B < 760
      breiten = KNOTEN.map(labelBreite)
      const zeilen = textRechtecke()
      // Auch Beziehungs-Beschriftungen halten den Mindestabstand zum Text
      const m = schmal ? REGELN.mobilAbstand : REGELN.abstand + REGELN.atmen
      textZonen = zeilen.map((h) => ({ l: h.l - m, t: h.t - m, r: h.r + m, b: h.b + m }))
      punkte = berechneLayout({
        breite: B, hoehe: H, schmal,
        text: zeilen,
        grenze: schmal ? null : grenzeUnterHeadline(),
        labelBreiten: breiten,
        rand,
        fokus: fokusNamen,
        // mobil werden Beziehungen nicht beschriftet – dann braucht es dafür auch keinen Platz
        fokusBeschriftung: schmal ? [] : fokusListe.map((i) => ({ ...KANTEN_INDEX[i], breite: fokusTextBreite(i) }))
      }).punkte
      ctx.font = `10px ${MONO}`
      // Teilnetz: alle seine Beziehungen beschriftet (mit Leserichtung), notfalls mittig
      fokusT = new Map()
      if (fokus) {
        const t = platziere(punkte, breiten,
          fokusListe.map((i) => ({ ...KANTEN_INDEX[i], breite: ctx.measureText(text(i)).width + 8 })),
          [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75], 0.5, textZonen, REGELN.atmen)
        fokusListe.forEach((i, j) => fokusT.set(i, t[j]))
      }
      // dauerhafte Beschriftungen: nur wo frei, sonst weglassen (nicht neben einem Teilnetz)
      const immer = fokus ? [] : KANTEN.map((k, i) => ({ k, i })).filter(({ k }) => k.immer)
      const t = platziere(punkte, breiten,
        immer.map(({ i }) => ({ ...KANTEN_INDEX[i], breite: ctx.measureText(BEZIEHUNG[i]).width + 8 })),
        [0.5, 0.38, 0.62, 0.28, 0.72], null, textZonen)
      immerT = new Map(immer.map(({ i }, j) => [i, t[j]]))
      hoverPlatzieren()
      impulse = []
    }

    // Beim Hover: alle Beziehungen des Begriffs, kollisionsarm entlang der Kante
    function hoverPlatzieren() {
      hoverT = new Map()
      if (hover < 0) return
      ctx.font = `10px ${MONO}`
      const eigene = KANTEN_INDEX.map((k, i) => ({ ...k, i })).filter((k) => k.a === hover || k.b === hover)
      const t = platziere(punkte, breiten,
        eigene.map((k) => ({ a: k.a, b: k.b, breite: ctx.measureText(text(k.i)).width + 10 })),
        [0.5, 0.4, 0.6, 0.32, 0.68, 0.25, 0.75], 0.5, textZonen)
      eigene.forEach((k, j) => hoverT.set(k.i, t[j]))
    }

    const text = (i) => beziehungText(BEZIEHUNG[i], punkte[KANTEN_INDEX[i].a].x, punkte[KANTEN_INDEX[i].b].x)

    // leichtes "Atmen" (±5 px); bei reduzierter Bewegung steht alles still
    function lage(i, t) {
      const p = punkte[i]
      if (reduziert) return [p.x, p.y]
      return [p.x + Math.sin(t * 0.35 + phasen[i][0]) * 5, p.y + Math.cos(t * 0.28 + phasen[i][1]) * 4]
    }

    function zeichnen(t) {
      ctx.clearRect(0, 0, B, H)
      const p = KNOTEN.map((_, i) => lage(i, t))
      const aktiv = (i) => (hover < 0 ? imFokus(i) : i === hover || nachbarn[hover].has(i))
      const kanteAktiv = (k) => hover >= 0 && (k.a === hover || k.b === hover)

      // Kanten
      KANTEN_INDEX.forEach((k) => {
        const hell = kanteAktiv(k)
        const vorn = hover < 0 && kanteImFokus(k)
        ctx.strokeStyle = hell ? FARBE[KNOTEN[hover].gruppe]
          : vorn ? `${TEXT}0.8)`
          : `${TEXT}${hover >= 0 ? 0.1 : fokus ? 0.12 : 0.3})`
        ctx.lineWidth = hell || vorn ? 1.5 : 1
        ctx.beginPath(); ctx.moveTo(...p[k.a]); ctx.lineTo(...p[k.b]); ctx.stroke()
      })

      // Beziehungen (nicht auf schmalen Bildschirmen)
      if (!schmal) {
        ctx.font = `10px ${MONO}`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        KANTEN_INDEX.forEach((k, i) => {
          let anteil, beschriftung, hell
          if (hover >= 0) {
            if (!kanteAktiv(k)) return
            anteil = hoverT.get(i)
            if (anteil === undefined || anteil === null) return // kein Platz außerhalb des Textes
            beschriftung = text(i); hell = true
          } else if (fokus) {
            anteil = fokusT.get(i)
            if (anteil === undefined || anteil === null) return
            beschriftung = text(i); hell = false
          } else {
            anteil = immerT.get(i)
            if (anteil === undefined || anteil === null) return
            beschriftung = BEZIEHUNG[i]; hell = false
          }
          const mx = p[k.a][0] + (p[k.b][0] - p[k.a][0]) * anteil
          const my = p[k.a][1] + (p[k.b][1] - p[k.a][1]) * anteil
          const w = ctx.measureText(beschriftung).width + (hell ? 10 : 8)
          ctx.fillStyle = NAVY; ctx.fillRect(mx - w / 2, my - (hell ? 8 : 7), w, hell ? 16 : 14)
          if (hell) {
            ctx.strokeStyle = FARBE[KNOTEN[hover].gruppe]; ctx.lineWidth = 1
            ctx.strokeRect(mx - w / 2 + 0.5, my - 7.5, w - 1, 15)
          }
          ctx.fillStyle = `${TEXT}${hell || fokus ? 1 : 0.6})`
          ctx.fillText(beschriftung, mx, my + 0.5)
        })
      }

      // Impulse entlang von Kanten
      for (const im of impulse) {
        const k = KANTEN_INDEX[im.k], [ax, ay] = p[k.a], [bx, by] = p[k.b]
        ctx.fillStyle = WEISS; ctx.fillRect(ax + (bx - ax) * im.t - 2, ay + (by - ay) * im.t - 2, 4, 4)
      }

      // Begriffe; Beschriftungen auf Navy, damit keine Linie durch Buchstaben läuft
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
      KNOTEN.forEach((n, i) => {
        const [x, y] = p[i]
        ctx.globalAlpha = aktiv(i) ? 1 : hover >= 0 ? 0.25 : 0.3
        if (n.hub) {
          ctx.fillStyle = NAVY; ctx.fillRect(x - 8, y - 8, 16, 16)
          ctx.strokeStyle = FARBE[n.gruppe]; ctx.lineWidth = 2; ctx.strokeRect(x - 8, y - 8, 16, 16)
          ctx.fillStyle = FARBE[n.gruppe]; ctx.fillRect(x - 3, y - 3, 6, 6)
          ctx.font = `700 12px ${MONO}`
          const name = NAME[i].toUpperCase(), tw = ctx.measureText(name).width
          ctx.fillStyle = NAVY; ctx.fillRect(x + 11, y - 8, tw + 6, 16)
          ctx.fillStyle = WEISS; ctx.fillText(name, x + 14, y + 0.5)
        } else {
          const s = i === hover ? 9 : 7
          ctx.fillStyle = FARBE[n.gruppe]; ctx.fillRect(x - s / 2, y - s / 2, s, s)
          if (!schmal || i === hover || (fokus && fokus.has(i))) {
            ctx.font = `11px ${MONO}`
            const tw = ctx.measureText(NAME[i]).width
            ctx.fillStyle = NAVY; ctx.fillRect(x + 7, y - 7, tw + 6, 14)
            ctx.fillStyle = i === hover ? WEISS : `${TEXT}0.85)`
            ctx.fillText(NAME[i], x + 10, y + 0.5)
          }
        }
        ctx.globalAlpha = 1
      })
    }

    function schritt() {
      // Impulse laufen auf Leistungsseiten nur durch das Teilnetz
      const wahl = fokusListe.length ? fokusListe : KANTEN_INDEX.map((_, i) => i)
      if (Math.random() < 0.008 && impulse.length < 2) impulse.push({ k: wahl[(Math.random() * wahl.length) | 0], t: 0 })
      for (let i = impulse.length - 1; i >= 0; i--) {
        impulse[i].t += 0.008
        if (impulse[i].t >= 1) impulse.splice(i, 1)
      }
    }

    function schleife(now) { schritt(); zeichnen((now - t0) / 1000); raf = requestAnimationFrame(schleife) }

    // Ein Ort für die Entscheidung: Intersection, Tab-Wechsel und Start
    // Mobil blendet das CSS den Graph aus (display: none) – dann weder rechnen noch zeichnen
    const sichtbar = () => cv.offsetWidth > 0

    function pruefen() {
      const soll = sollLaufen({ imBild: imBild && sichtbar(), tabVerborgen: document.hidden, reduziert, bereit: punkte.length > 0 })
      if (soll && !laeuft) { laeuft = true; raf = requestAnimationFrame(schleife) }
      if (!soll && laeuft) { laeuft = false; cancelAnimationFrame(raf) }
    }

    // Hover: nächster Begriff im Umkreis von 22 px; nicht bei reduzierter Bewegung
    if (reagiertAufZeiger(reduziert)) {
      flaeche.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect()
        const mx = e.clientX - r.left, my = e.clientY - r.top
        let best = -1, bestD = 22
        punkte.forEach((pt, i) => {
          const d = Math.hypot(pt.x - mx, pt.y - my)
          if (d < bestD) { bestD = d; best = i }
        })
        if (best !== hover) { hover = best; hoverPlatzieren() }
        flaeche.style.cursor = best >= 0 ? 'pointer' : ''
      })
      flaeche.addEventListener('pointerleave', () => { hover = -1; hoverPlatzieren(); flaeche.style.cursor = '' })
    }

    let warte
    window.addEventListener('resize', () => {
      clearTimeout(warte)
      warte = setTimeout(() => {
        if (!sichtbar()) { pruefen(); return }
        if (punkte.length && !mussNeuAufbauen({ b: B, h: H }, { b: flaeche.clientWidth, h: flaeche.clientHeight })) return
        aufbauen(); zeichnen((performance.now() - t0) / 1000); pruefen()
      }, 150)
    }, { passive: true })

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { imBild = e.isIntersecting; pruefen() }).observe(flaeche)
    } else {
      imBild = true
    }
    document.addEventListener('visibilitychange', pruefen)

    // Die Schrift muss geladen sein, bevor Beschriftungen gemessen und gezeichnet werden
    document.fonts.ready.then(() => { if (sichtbar()) { aufbauen(); zeichnen(0) } pruefen() })
  }
})()
