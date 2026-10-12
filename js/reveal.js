/**
 * Sanftes Einblenden beim Scrollen.
 * Respektiert prefers-reduced-motion und faellt ohne IntersectionObserver
 * auf "alles sofort sichtbar" zurueck.
 *
 * ACHTUNG, zwei bewusste Abweichungen vom Rest des Projekts:
 *
 * 1. Dies ist KEIN ES-Modul, sondern ein klassisches Skript, und es wird im
 *    <head> ohne defer geladen. Nur so laeuft die erste Zeile, bevor der
 *    Browser den Body zeichnet. Ein Modul ist immer deferred; das Merkmal
 *    kaeme dann erst nach dem ersten Malen, und der Inhalt blitzte kurz
 *    sichtbar auf, bevor er versteckt und neu eingeblendet wird. Unter
 *    gedrosselter CPU und Slow 3G gemessen: vier Sekunden lang.
 *
 * 2. Das Verstecken haengt an .pv-js, das diese Datei selbst setzt - nicht
 *    an @media (scripting: enabled). Die Abfrage sagt nur, ob Skripte
 *    erlaubt sind, nicht ob DIESES Skript laeuft. Ueber file:// blockiert
 *    der Browser ES-Module per CORS, waehrend Skripting als aktiv gilt:
 *    Der halbe Seiteninhalt blieb dauerhaft unsichtbar. Auf dem Server
 *    traefe dasselbe bei jedem Ladefehler zu.
 *
 * Kurz: Laeuft diese Datei nicht, wird nichts versteckt.
 */

// Erste Anweisung. Alles Weitere wartet auf den fertigen DOM.
document.documentElement.classList.add('pv-js')

function einblendenEinrichten() {
  const elemente = document.querySelectorAll('.pv-reveal')
  if (elemente.length === 0) return

  const wenigerBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (wenigerBewegung || !('IntersectionObserver' in window)) {
    for (const el of elemente) el.classList.add('pv-reveal--in')
    return
  }

  const beobachter = new IntersectionObserver(
    (eintraege, selbst) => {
      for (const eintrag of eintraege) {
        if (!eintrag.isIntersecting) continue
        eintrag.target.classList.add('pv-reveal--in')
        selbst.unobserve(eintrag.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  )
  for (const el of elemente) beobachter.observe(el)
}

// Im <head> geladen, der Body existiert hier noch nicht.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', einblendenEinrichten)
} else {
  einblendenEinrichten()
}
