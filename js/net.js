/**
 * Netz-Graph hinter Bühne und Seitenkopf. Reine Dekoration: ohne dieses
 * Skript bleibt der dunkle Hintergrund, nichts fehlt.
 * Eckige Knoten treiben langsam, nahe Knoten verbinden sich, jeder Knoten
 * hat Brücken zu seinen nächsten Nachbarn, seltene Impulse laufen über Kanten,
 * der Mauszeiger ist selbst ein Knoten.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const {KONFIG, knotenAnzahl, naechsteNachbarn, kantenDeckkraft, brueckenDeckkraft,
    sollLaufen, reagiertAufZeiger, mussNeuAufbauen
  } = globalThis.PvNetGraph

  // Zeichenfarben des Canvas. CSS-Tokens sind hier ohne Stilabfrage zur
  // Laufzeit nicht lesbar; die Kommentare nennen das jeweilige Token.
  const FARBEN = ['#12B6F3', '#2F6BEC', '#7A3BE0', '#E5258E'] // Logo-Verlauf
  const KANTE = 'rgba(182, 198, 216, '                         // --color-on-ink-muted
  const HUB_FUELLUNG = '#16293F'                               // --color-ink
  const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const zufall = (a, b) => a + Math.random() * (b - a)

  function netz(cv) {
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const flaeche = cv.parentElement
    let B = 0, H = 0, knoten = [], impulse = [], laeuft = false, raf = 0, imBild = false
    const zeiger = { x: 0, y: 0, aktiv: false }

    function aufbauen() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      B = flaeche.clientWidth
      H = flaeche.clientHeight
      cv.width = B * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      knoten = []
      for (let i = 0, n = knotenAnzahl(B, H); i < n; i++) {
        const rechts = Math.sqrt(Math.random()) // dichter nach rechts, Text bleibt frei
        const hub = Math.random() < 0.12
        knoten.push({
          x: B * (0.15 + 0.85 * rechts) * zufall(0.85, 1.05),
          y: zufall(0, H),
          vx: zufall(-KONFIG.startV, KONFIG.startV),
          vy: zufall(-KONFIG.startV, KONFIG.startV),
          s: hub ? zufall(5, 7) : zufall(2, 3.5),
          hub,
          c: FARBEN[(Math.random() * FARBEN.length) | 0]
        })
      }
      impulse = []
    }

    function inReichweite(i) {
      const a = knoten[i], aus = []
      for (let j = 0; j < knoten.length; j++) {
        if (j !== i && Math.hypot(a.x - knoten[j].x, a.y - knoten[j].y) < KONFIG.kante) aus.push(j)
      }
      return aus
    }

    function schritt() {
      for (const n of knoten) {
        if (zeiger.aktiv) {
          const dx = zeiger.x - n.x, dy = zeiger.y - n.y, d2 = dx * dx + dy * dy
          if (d2 < KONFIG.zeiger ** 2 && d2 > 400) { n.vx += (dx / d2) * KONFIG.zug; n.vy += (dy / d2) * KONFIG.zug }
        }
        n.vx *= 0.995; n.vy *= 0.995
        const v = Math.hypot(n.vx, n.vy)
        if (v > KONFIG.maxV) { n.vx *= KONFIG.maxV / v; n.vy *= KONFIG.maxV / v }
        if (v < KONFIG.minV) { n.vx += zufall(-KONFIG.zittern, KONFIG.zittern); n.vy += zufall(-KONFIG.zittern, KONFIG.zittern) }
        n.x += n.vx; n.y += n.vy
        if (n.x < -20) n.x = B + 20; else if (n.x > B + 20) n.x = -20
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20
      }
      if (Math.random() < KONFIG.impulsRate && impulse.length < KONFIG.maxImpulse) {
        const i = (Math.random() * knoten.length) | 0, n = inReichweite(i)
        if (n.length) impulse.push({ von: i, zu: n[(Math.random() * n.length) | 0], t: 0, spruenge: 3 + ((Math.random() * 3) | 0) })
      }
      for (let k = impulse.length - 1; k >= 0; k--) {
        const p = impulse[k], a = knoten[p.von], b = knoten[p.zu]
        const len = Math.hypot(a.x - b.x, a.y - b.y)
        if (len > KONFIG.kante * 1.15) { impulse.splice(k, 1); continue }
        p.t += KONFIG.impulsTempo / Math.max(len, 1)
        if (p.t < 1) continue
        const weiter = inReichweite(p.zu).filter((j) => j !== p.von)
        if (--p.spruenge <= 0 || !weiter.length) { impulse.splice(k, 1); continue }
        p.von = p.zu; p.zu = weiter[(Math.random() * weiter.length) | 0]; p.t = 0
      }
    }

    function linie(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke() }

    function zeichnen() {
      ctx.clearRect(0, 0, B, H)
      ctx.lineWidth = 1
      for (let i = 0; i < knoten.length; i++) {
        const a = knoten[i]
        for (let j = i + 1; j < knoten.length; j++) {
          const o = kantenDeckkraft(Math.hypot(a.x - knoten[j].x, a.y - knoten[j].y))
          if (o > 0) { ctx.strokeStyle = `${KANTE}${o.toFixed(3)})`; linie(a, knoten[j]) }
        }
        for (const [d, j] of naechsteNachbarn(knoten, i, KONFIG.nachbarn)) {
          const o = brueckenDeckkraft(d)
          if (o > 0) { ctx.strokeStyle = `${KANTE}${o.toFixed(3)})`; linie(a, knoten[j]) }
        }
        if (zeiger.aktiv) {
          const d = Math.hypot(a.x - zeiger.x, a.y - zeiger.y)
          if (d < KONFIG.zeiger) {
            ctx.strokeStyle = a.c; ctx.globalAlpha = (1 - d / KONFIG.zeiger) * 0.7
            linie(a, zeiger); ctx.globalAlpha = 1
          }
        }
      }
      for (const p of impulse) {
        const a = knoten[p.von], b = knoten[p.zu]
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t
        ctx.strokeStyle = b.c; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9
        linie(a, { x, y }); ctx.globalAlpha = 1; ctx.lineWidth = 1
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 2, y - 2, 4, 4)
      }
      for (const n of knoten) {
        const h = n.s / 2
        if (n.hub) {
          ctx.fillStyle = HUB_FUELLUNG; ctx.fillRect(n.x - h, n.y - h, n.s, n.s)
          ctx.strokeStyle = n.c; ctx.lineWidth = 1.5; ctx.strokeRect(n.x - h, n.y - h, n.s, n.s); ctx.lineWidth = 1
        } else {
          ctx.fillStyle = n.c; ctx.fillRect(n.x - h, n.y - h, n.s, n.s)
        }
      }
      if (zeiger.aktiv) {
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5
        ctx.strokeRect(zeiger.x - 5, zeiger.y - 5, 10, 10); ctx.lineWidth = 1
      }
    }

    function schleife() { schritt(); zeichnen(); raf = requestAnimationFrame(schleife) }
    // Ein Ort für die Entscheidung: Intersection, Tab-Wechsel und Start fragen
    // alle sollLaufen() mit dem aktuellen Stand.
    function pruefen() {
      const soll = sollLaufen({ imBild, tabVerborgen: document.hidden, reduziert })
      if (soll && !laeuft) { laeuft = true; raf = requestAnimationFrame(schleife) }
      if (!soll && laeuft) { laeuft = false; cancelAnimationFrame(raf) }
    }

    if (reagiertAufZeiger(reduziert)) {
      flaeche.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect()
        zeiger.x = e.clientX - r.left; zeiger.y = e.clientY - r.top; zeiger.aktiv = true
      })
      flaeche.addEventListener('pointerleave', () => { zeiger.aktiv = false })
    }

    let warte
    window.addEventListener('resize', () => {
      clearTimeout(warte)
      warte = setTimeout(() => {
        if (!mussNeuAufbauen({ b: B, h: H }, { b: flaeche.clientWidth, h: flaeche.clientHeight })) return
        aufbauen(); zeichnen()
      }, 150)
    }, { passive: true })

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { imBild = e.isIntersecting; pruefen() }).observe(flaeche)
    } else {
      imBild = true
    }
    document.addEventListener('visibilitychange', pruefen)

    aufbauen()
    zeichnen() // bei reduzierter Bewegung bleibt dieses Standbild
    pruefen()
  }

  for (const cv of document.querySelectorAll('canvas.pv-net')) netz(cv)
})()
