/**
 * Navigationsverhalten. Alles hier ist Komfort - ohne dieses Skript
 * bleibt die Seite vollstaendig bedienbar.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const { aktiverLink } = globalThis.PvScrollspy

  // ---- Schatten am Header, sobald gescrollt wird ----
  const header = document.getElementById('pv-header')
  if (header) {
    const schattenPruefen = () => {
      header.classList.toggle('pv-header--scrolled', window.scrollY > 8)
    }
    schattenPruefen()
    window.addEventListener('scroll', schattenPruefen, { passive: true })
  }

  // ---- Mobilmenue: schliessen beim Klick auf einen Link, Scrollsperre ----
  const mobil = document.getElementById('pv-mobile-nav')
  if (mobil) {
    mobil.addEventListener('toggle', () => {
      document.body.style.overflow = mobil.open ? 'hidden' : ''
    })

    for (const link of mobil.querySelectorAll('a')) {
      link.addEventListener('click', () => {
        mobil.open = false
        document.body.style.overflow = ''
      })
    }

    // Escape schliesst das Menue - bei details sonst nicht vorgesehen.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobil.open) {
        mobil.open = false
        document.body.style.overflow = ''
        mobil.querySelector('summary')?.focus()
      }
    })

    // Wird das Fenster ueber die Umbruchbreite vergroessert, waehrend das Menue
    // offen ist, blendet CSS es aus - der Scrollsperre fehlt dann jeder Ausloeser
    // zum Zuruecksetzen, und die Seite bliebe unscrollbar. Der Umbruchpunkt
    // entspricht der Medienabfrage in components.css (max-width: 900px).
    const breiterAls900 = window.matchMedia('(min-width: 901px)')
    breiterAls900.addEventListener('change', (e) => {
      if (e.matches && mobil.open) {
        mobil.open = false
        document.body.style.overflow = ''
      }
    })
  }

  // ---- Scrollspy: den Link der sichtbaren Sektion hervorheben ----
  const linksNachId = new Map()
  for (const link of document.querySelectorAll('.pv-nav__link')) {
    const href = link.getAttribute('href') || ''
    if (!href.startsWith('#')) continue
    const id = href.slice(1)
    if (!linksNachId.has(id)) linksNachId.set(id, [])
    linksNachId.get(id).push(link)
  }

  const sektionen = [...linksNachId.keys()]
    .map((id) => document.getElementById(id))
    // Nur echte Abschnitte beobachten. Der Link "Startseite" zeigt auf
    // <main id="inhalt">, das die ganze Seite umspannt und jede Auswahl
    // gewinnen wuerde.
    .filter((el) => el && el.tagName === 'SECTION')

  // Das Ziel des Startseiten-Links: der eine Eintrag, der keine Sektion ist.
  // Nicht fest verdrahtet, damit eine Umbenennung von <main> nichts bricht.
  const startId =
    [...linksNachId.keys()].find((id) => {
      const el = document.getElementById(id)
      return el && el.tagName !== 'SECTION'
    }) ?? null

  if (sektionen.length > 0) {
    // Von hier an markiert der Spy immer genau einen Punkt. Die statische
    // Hervorhebung von aria-current wuerde daneben als zweite Markierung
    // stehen; dieses Merkmal schaltet sie im CSS ab. Ohne Skript bleibt sie
    // die einzige Markierung und damit richtig.
    document.documentElement.classList.add('pv-spy-aktiv')

    let aktiv = null

    const setzeAktiv = (id) => {
      if (id === aktiv) return
      aktiv = id
      for (const [key, links] of linksNachId) {
        for (const link of links) {
          link.classList.toggle('pv-nav__link--active', key === id)
        }
      }
    }

    const pruefen = () => {
      // Aktivierungslinie bei 35 % der Fensterhoehe: Eine Sektion gilt als
      // erreicht, sobald ihre Oberkante das obere Drittel durchlaeuft.
      const linie = window.innerHeight * 0.35
      const masse = sektionen.map((el) => ({
        id: el.id,
        top: el.getBoundingClientRect().top
      }))
      setzeAktiv(aktiverLink(masse, linie, startId))
    }

    pruefen()
    window.addEventListener('scroll', pruefen, { passive: true })
    window.addEventListener('resize', pruefen, { passive: true })
  }
})()
