/**
 * Fortschrittsbalken direkt unter den Vorgehen-Boxen (Startseite, übernommen
 * aus Mockup M). Hover auf eine Box füllt den Balken bis zu deren rechter
 * Kante, die Prozentzahl steht im letzten gefüllten Segment. Reine Dekoration
 * (aria-hidden): ohne dieses Skript bleibt der Balken verborgen.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer.

;(function () {
  'use strict'

  // Vom Kunden festgelegt: lieber viele kleine Schritte (40 Segmente); nur wenn
  // "100%" dann selbst in 10 px nicht in ein Segment passt, 20 Segmente.
  const REGELN = Object.freeze({ anzahlen: [40, 20], gap: 2, rand: 2, maxPx: 12, minPx: 10, schritt: 0.5 })

  /**
   * Segmentzahl und Schriftgröße so wählen, dass die Zahl in ein Segment passt.
   * @param {number} breite  Innenbreite des Balkens in px
   * @param {(px:number) => number} textBreite  Breite von "100%" bei Schriftgröße px
   * @returns {{n:number, px:number}}
   */
  function waehleSegmente(breite, textBreite) {
    const { anzahlen, gap, rand, maxPx, minPx, schritt } = REGELN
    for (const n of anzahlen) {
      const frei = breite / n - gap - 2 * rand
      for (let px = maxPx; px >= minPx; px -= schritt) {
        if (textBreite(px) <= frei) return { n, px }
      }
    }
    return { n: anzahlen[anzahlen.length - 1], px: minPx }
  }

  /** Füllstand nach Box i (0-basiert) von gesamt: genau auf einer Segmentgrenze */
  const anteil = (i, gesamt) => (i + 1) / gesamt

  /** Stehen alle Boxen in einer Reihe? (gleicher oberer Rand) */
  const nebeneinander = (oben) => oben.length > 0 && oben.every((y) => y === oben[0])

  globalThis.PvGauge = Object.freeze({ REGELN, waehleSegmente, anteil, nebeneinander })

  const balken = typeof document !== 'undefined' && document.querySelector('.pv-gauge')
  if (!balken) return

  const seg = balken.querySelector('.pv-gauge__seg')
  const wert = balken.querySelector('.pv-gauge__wert')
  const liste = balken.previousElementSibling
  const boxen = [...liste.querySelectorAll('.pv-steps__item')]
  let segment = 0, aktiv = -1

  function einrichten() {
    balken.hidden = !nebeneinander(boxen.map((b) => b.offsetTop))
    if (balken.hidden) return
    const breite = balken.clientWidth
    wert.textContent = '100%'
    wert.style.width = 'auto'
    const { n, px } = waehleSegmente(breite, (groesse) => { wert.style.fontSize = groesse + 'px'; return wert.scrollWidth })
    wert.style.fontSize = px + 'px'
    seg.style.setProperty('--n', n)
    segment = breite / n
    wert.style.width = (segment - REGELN.gap) + 'px'
    setze(aktiv)
  }

  function setze(i) {
    aktiv = i
    boxen.forEach((b, j) => b.classList.toggle('is-hover', j === i))
    if (i < 0) { balken.style.setProperty('--p', 0); balken.classList.remove('is-aktiv'); return }
    const a = anteil(i, boxen.length)
    balken.style.setProperty('--p', a)
    wert.textContent = Math.round(a * 100) + '%'
    wert.style.left = (a * balken.clientWidth - segment) + 'px'
    balken.classList.add('is-aktiv')
  }

  boxen.forEach((b, i) => b.addEventListener('pointerenter', () => setze(i)))
  liste.addEventListener('pointerleave', () => setze(-1))
  let warte
  window.addEventListener('resize', () => { clearTimeout(warte); warte = setTimeout(einrichten, 100) }, { passive: true })
  document.fonts.ready.then(einrichten)
})()
