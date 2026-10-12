/**
 * DOM-Anbindung des Kontaktformulars.
 * Die Regeln selbst liegen in contact-validation.js.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const {
    validateField,
    validateForm,
    buildMailtoHref,
    submitContact,
    FELDER,
    KONTAKT_MAIL,
    KONTAKT_TEL
  } = globalThis.PvKontakt

  // Sprache der Seite (<html lang>): deutsche und englische Fassung teilen dieses Skript
  const SPRACHE = document.documentElement.lang === 'en' ? 'en' : 'de'
  const MELDUNG = {
    de: {
      danke: 'Vielen Dank. Wir melden uns zeitnah bei Ihnen.',
      inaktiv: 'Der Formularversand ist noch nicht aktiv.',
      fehler: 'Die Nachricht konnte nicht gesendet werden.',
      textInaktiv: `Ihre Eingaben bleiben stehen. Schreiben Sie uns bitte direkt oder rufen Sie an: ${KONTAKT_TEL}`,
      textFehler: `Ihre Eingaben bleiben stehen. Bitte versuchen Sie es später erneut, schreiben Sie uns direkt oder rufen Sie an: ${KONTAKT_TEL}`,
      mail: `Als E-Mail an ${KONTAKT_MAIL} öffnen`
    },
    en: {
      danke: 'Thank you. We will get back to you shortly.',
      inaktiv: 'Sending the form is not active yet.',
      fehler: 'Your message could not be sent.',
      textInaktiv: `Your entries have been kept. Please write to us directly or call: ${KONTAKT_TEL}`,
      textFehler: `Your entries have been kept. Please try again later, write to us directly or call: ${KONTAKT_TEL}`,
      mail: `Open as email to ${KONTAKT_MAIL}`
    }
  }[SPRACHE]

  const form = document.getElementById('pv-contact-form')
  if (form) {
    const status = document.getElementById('pv-form-status')

    // Der Ersatzhinweis steht im HTML sichtbar, das Formular verborgen. Erst
    // hier wird getauscht. Dadurch ist der Hinweis in JEDEM Fall zu sehen, in
    // dem diese Datei nicht laeuft - abgeschaltetes JavaScript, Ladefehler,
    // Aufruf ueber file://. Ein <noscript>-Block haette nur den ersten Fall
    // abgedeckt: Er erscheint nicht, wenn Skripte erlaubt sind, aber scheitern.
    document.getElementById('pv-form-notice')?.remove()
    form.hidden = false

    const feldEl = (name) => form.elements.namedItem(name)
    const fehlerEl = (name) => document.getElementById(`pv-${name}-error`)

    const wertVon = (name) => {
      const el = feldEl(name)
      if (!el) return ''
      return el.type === 'checkbox' ? el.checked : el.value
    }

    const datenLesen = () =>
      Object.fromEntries(FELDER.map((name) => [name, wertVon(name)]))

    function fehlerZeigen(name, text) {
      const el = feldEl(name)
      const ziel = fehlerEl(name)
      if (!ziel) return
      ziel.textContent = text || ''
      if (el) el.setAttribute('aria-invalid', text ? 'true' : 'false')
      const feld = el?.closest('.pv-form__field')
      if (feld) feld.classList.toggle('pv-form__field--invalid', Boolean(text))
    }

    function alleFehlerLoeschen() {
      for (const name of FELDER) fehlerZeigen(name, '')
    }

    // Beim Verlassen eines Feldes pruefen - aber erst, wenn etwas drinstand.
    for (const name of ['name', 'email', 'message']) {
      const el = feldEl(name)
      if (!el) continue
      el.addEventListener('blur', () => {
        if (el.value.trim() === '') return
        fehlerZeigen(name, validateField(name, el.value, SPRACHE))
      })
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') {
          fehlerZeigen(name, validateField(name, el.value, SPRACHE))
        }
      })
    }

    const check = feldEl('privacy')
    if (check) {
      check.addEventListener('change', () => {
        fehlerZeigen('privacy', validateField('privacy', check.checked, SPRACHE))
      })
    }

    form.addEventListener('submit', async (ereignis) => {
      ereignis.preventDefault()
      status.className = 'pv-form__status'
      status.textContent = ''
      alleFehlerLoeschen()

      const daten = datenLesen()
      const { valid, errors } = validateForm(daten, SPRACHE)

      if (!valid) {
        for (const [name, text] of Object.entries(errors)) fehlerZeigen(name, text)
        const ersterFehler = Object.keys(errors)[0]
        feldEl(ersterFehler)?.focus()
        return
      }

      const ergebnis = await submitContact(daten)

      if (ergebnis.ok) {
        // Noch nicht erreichbar. Vorbereitet fuer den Tag, an dem
        // submitContact durch einen echten Versand ersetzt wird.
        status.className = 'pv-form__status pv-form__status--ok'
        status.textContent = MELDUNG.danke
        form.reset()
        return
      }

      // Zwei verschiedene Fehlschläge, zwei verschiedene Aussagen.
      // 'not-implemented' heißt: Es gibt noch gar keinen Versand.
      // Alles andere heißt: Der Versand existiert, dieser Versuch schlug fehl.
      const nichtUmgesetzt = ergebnis.reason === 'not-implemented'

      status.className = 'pv-form__status pv-form__status--info'
      status.replaceChildren()

      const titel = document.createElement('strong')
      titel.textContent = nichtUmgesetzt
        ? MELDUNG.inaktiv
        : MELDUNG.fehler

      const text = document.createElement('p')
      text.textContent = nichtUmgesetzt
        ? MELDUNG.textInaktiv
        : MELDUNG.textFehler

      const link = document.createElement('a')
      link.className = 'pv-btn pv-btn--primary pv-form__mailto'
      link.href = buildMailtoHref(daten, SPRACHE)
      link.textContent = MELDUNG.mail

      status.append(titel, text, link)
      status.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }
})()
