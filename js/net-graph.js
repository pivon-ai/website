/**
 * Rechenregeln der Netz-Animation. Ohne DOM-Zugriff, damit sie ohne Browser
 * testbar sind - dasselbe Muster wie scrollspy.js.
 * Werte = ruhige Fassung aus Mockup I/K.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const KONFIG = Object.freeze({
    flaeche: 17000,    // px² je Knoten
    maxKnoten: 70,
    minKnoten: 24,
    startV: 0.07,      // Starttempo je Achse, px/Frame
    maxV: 0.22,        // Höchsttempo, px/Frame
    minV: 0.03,        // darunter bekommt ein Knoten einen kleinen Anstoß
    zittern: 0.008,    // Größe dieses Anstoßes
    impulsRate: 0.012, // Wahrscheinlichkeit je Frame für einen neuen Impuls
    maxImpulse: 3,
    impulsTempo: 0.9,  // px/Frame entlang einer Kante
    zug: 0.25,         // Anziehung durch den Mauszeiger
    kante: 200,        // max. Kantenlänge, px
    nachbarn: 3,       // Brücken zu so vielen nächsten Nachbarn
    bruecke: 340,      // max. Brückenlänge, px
    zeiger: 190        // Reichweite des Mauszeigers, px
  })

  function knotenAnzahl(breite, hoehe) {
    const n = Math.round((breite * hoehe) / KONFIG.flaeche)
    return Math.min(KONFIG.maxKnoten, Math.max(KONFIG.minKnoten, n))
  }

  function naechsteNachbarn(knoten, i, k) {
    const a = knoten[i]
    const liste = []
    for (let j = 0; j < knoten.length; j++) {
      if (j === i) continue
      liste.push([Math.hypot(a.x - knoten[j].x, a.y - knoten[j].y), j])
    }
    liste.sort((p, q) => p[0] - q[0])
    return liste.slice(0, k)
  }

  function kantenDeckkraft(abstand) {
    if (abstand >= KONFIG.kante) return 0
    return (1 - abstand / KONFIG.kante) * 0.38
  }

  function brueckenDeckkraft(abstand) {
    if (abstand <= KONFIG.kante || abstand >= KONFIG.bruecke) return 0
    return (1 - (abstand - KONFIG.kante) / (KONFIG.bruecke - KONFIG.kante)) * 0.16
  }

  function sollAnimieren(reduziert) {
    return !reduziert
  }

  /**
   * Läuft die Schleife? Nur wenn die Fläche im Bild ist, der Tab vorn liegt und
   * keine reduzierte Bewegung gewünscht ist. Alle drei Auslöser (Intersection,
   * Tab-Wechsel, Start) fragen hier – sonst startet ein Tab-Wechsel die Schleife
   * auch dann, wenn die Bühne weit oberhalb des Bildausschnitts liegt.
   */
  // "bereit": das Layout ist berechnet. Der Knowledge Graph wartet dafür auf
  // die Schrift; meldet sich der IntersectionObserver vorher, darf die Schleife
  // noch nicht starten (sonst zeichnet sie einen leeren Graphen und stürzt ab).
  function sollLaufen({ imBild, tabVerborgen, reduziert, bereit = true }) {
    return bereit && imBild && !tabVerborgen && sollAnimieren(reduziert)
  }

  /** Bei reduzierter Bewegung folgt auch nichts dem Mauszeiger (WCAG 2.3.3). */
  function reagiertAufZeiger(reduziert) {
    return !reduziert
  }

  /**
   * Neu aufbauen nur bei echter Größenänderung. Mobile Browser feuern resize,
   * wenn beim Scrollen die Adressleiste ein- und ausfährt; die Bühne behält
   * dabei ihre Maße, und das Netz soll nicht neu gewürfelt werden.
   */
  function mussNeuAufbauen(alt, neu) {
    return alt.b !== neu.b || alt.h !== neu.h
  }

  globalThis.PvNetGraph = Object.freeze({ KONFIG, knotenAnzahl, naechsteNachbarn, kantenDeckkraft, brueckenDeckkraft, sollAnimieren, sollLaufen, reagiertAufZeiger, mussNeuAufbauen })
})()
