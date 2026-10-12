/**
 * Auswahlregel des Scrollspys. Bewusst ohne DOM-Zugriff, damit sie
 * ohne Browser testbar ist - dasselbe Muster wie bei contact-validation.js.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  /**
   * Waehlt die aktive Sektion.
   *
   * Aktiv ist die UNTERSTE Sektion, deren Oberkante noch oberhalb der
   * Aktivierungslinie liegt. Die naheliegende Regel "oberste sichtbare"
   * waere falsch: Springt man zu einer Sektion, ragt die vorherige meist
   * noch wenige Pixel in den sichtbaren Bereich und wuerde gewinnen.
   *
   * @param {Array<{id: string, top: number}>} sektionen Oberkanten relativ zum Viewport
   * @param {number} linie Aktivierungslinie in Pixeln vom oberen Viewportrand
   * @returns {string|null} id der aktiven Sektion, oder null
   */
  function aktiveSektion(sektionen, linie) {
    let treffer = null
    for (const s of sektionen) {
      if (s.top > linie) continue
      if (treffer === null || s.top > treffer.top) treffer = s
    }
    return treffer ? treffer.id : null
  }

  /**
   * Waehlt den zu markierenden Navigationspunkt.
   *
   * Oberhalb der ersten Sektion liefert aktiveSektion() null. Ohne Rueckfall
   * markiert die Navigation dort nichts - waehrend die statische Regel fuer
   * aria-current weiterlaeuft und "Startseite" hervorhebt. Zusammen mit der
   * ersten erreichten Sektion saehen dann ZWEI Punkte aktiv aus.
   *
   * Mit dem Rueckfall markiert der Spy immer genau einen Punkt, und die
   * statische Hervorhebung darf abgeschaltet werden, solange er laeuft.
   *
   * @param {Array<{id: string, top: number}>} sektionen Oberkanten relativ zum Viewport
   * @param {number} linie Aktivierungslinie in Pixeln vom oberen Viewportrand
   * @param {string|null} startId id des Startseiten-Ziels, oder null
   * @returns {string|null} id des zu markierenden Ziels, oder null
   */
  function aktiverLink(sektionen, linie, startId) {
    const sektion = aktiveSektion(sektionen, linie)
    if (sektion !== null) return sektion
    return startId === undefined ? null : startId
  }

  globalThis.PvScrollspy = Object.freeze({ aktiveSektion, aktiverLink })
})()
