/**
 * Reine Validierungs- und Aufbereitungsfunktionen fuer das Kontaktformular.
 * Kein DOM-Zugriff - dadurch ohne Browser testbar.
 */
// Klassisches Skript (kein ES-Modul): Chrome blockiert Module beim Öffnen
// direkt aus dem Ordner (file://, CORS). Laden mit defer, Reihenfolge beachten.

;(function () {
  'use strict'

  const KONTAKT_MAIL = 'kontakt@pivon.ai'
  // Geschuetzte Leerzeichen (U+00A0): Dieser Wert landet per JavaScript in
  // sichtbarem Text, wo die Rufnummer sonst mitten im Umbruch zerreissen kann.
  // html-validate prueft nur statisches Markup und kann das hier nicht sehen.
  const KONTAKT_TEL = '+49 151 62809266'

  const GRENZEN = {
    name: { min: 2, max: 100 },
    message: { min: 10, max: 5000 },
    email: { max: 254 }
  }

  // Bewusst nachsichtig: etwas@etwas.tld. Strengere Muster lehnen gueltige
  // Adressen ab, und ohne Versand bringt Strenge hier ohnehin nichts.
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  const text = (v) => (typeof v === 'string' ? v.trim() : '')

  // Fehlertexte je Sprache; die Seite wählt über <html lang> (contact-form.js)
  const TEXTE = {
    de: {
      nameLeer: 'Bitte geben Sie Ihren Namen an.',
      nameKurz: 'Der Name muss mindestens 2 Zeichen lang sein.',
      nameLang: 'Der Name darf höchstens 100 Zeichen lang sein.',
      emailLeer: 'Bitte geben Sie Ihre E-Mail-Adresse an.',
      emailLang: 'Die E-Mail-Adresse ist zu lang.',
      emailFalsch: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
      nachrichtLeer: 'Bitte schreiben Sie uns ein paar Zeilen.',
      nachrichtKurz: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
      nachrichtLang: 'Die Nachricht darf höchstens 5000 Zeichen lang sein.',
      datenschutz: 'Bitte stimmen Sie der Datenschutzerklärung zu.',
      ungueltig: 'Ungültige Eingabe.',
      betreff: 'Anfrage über pivon.ai',
      email: 'E-Mail'
    },
    en: {
      nameLeer: 'Please enter your name.',
      nameKurz: 'Your name must be at least 2 characters long.',
      nameLang: 'Your name must not exceed 100 characters.',
      emailLeer: 'Please enter your email address.',
      emailLang: 'The email address is too long.',
      emailFalsch: 'Please enter a valid email address.',
      nachrichtLeer: 'Please write us a few lines.',
      nachrichtKurz: 'Your message must be at least 10 characters long.',
      nachrichtLang: 'Your message must not exceed 5000 characters.',
      datenschutz: 'Please accept the privacy policy.',
      ungueltig: 'Invalid input.',
      betreff: 'Enquiry via pivon.ai',
      email: 'Email'
    }
  }
  const t = (sprache) => TEXTE[sprache] || TEXTE.de

  /**
   * Prueft ein einzelnes Feld.
   * @returns {string|null} Fehlertext oder null, wenn alles in Ordnung ist.
   */
  function validateField(name, value, sprache = 'de') {
    const T = t(sprache)
    switch (name) {
      case 'name': {
        const v = text(value)
        if (!v) return T.nameLeer
        if (v.length < GRENZEN.name.min) return T.nameKurz
        if (v.length > GRENZEN.name.max) return T.nameLang
        return null
      }
      case 'email': {
        const v = text(value)
        if (!v) return T.emailLeer
        if (v.length > GRENZEN.email.max) return T.emailLang
        if (!EMAIL.test(v)) return T.emailFalsch
        return null
      }
      case 'message': {
        const v = text(value)
        if (!v) return T.nachrichtLeer
        if (v.length < GRENZEN.message.min) return T.nachrichtKurz
        if (v.length > GRENZEN.message.max) return T.nachrichtLang
        return null
      }
      case 'privacy':
        return value === true ? null : T.datenschutz
      case 'website':
        // Honeypot: fuer Menschen unsichtbar und nicht fokussierbar, muss exakt
        // leer bleiben. Bewusst OHNE trim() - reiner Leerraum ist kein Mensch.
        return value === '' || value === undefined || value === null
          ? null
          : T.ungueltig
      default:
        return null
    }
  }

  /** Reihenfolge wie im Formular - bestimmt, welches Feld den Fokus bekommt. */
  const FELDER = ['name', 'email', 'message', 'privacy', 'website']

  /**
   * Prueft den gesamten Datensatz.
   * @returns {{valid: boolean, errors: Record<string, string>}}
   */
  function validateForm(data, sprache = 'de') {
    const errors = {}
    for (const feld of FELDER) {
      const fehler = validateField(feld, data[feld], sprache)
      if (fehler) errors[feld] = fehler
    }
    return { valid: Object.keys(errors).length === 0, errors }
  }

  /**
   * Baut einen mailto-Link mit vorbefuelltem Betreff und Text.
   * Damit ist das Dummy fuer den Besucher nicht nutzlos.
   */
  function buildMailtoHref(data, sprache = 'de') {
    const T = t(sprache)
    const name = text(data.name)
    const email = text(data.email)
    const message = text(data.message)

    const subject = `${T.betreff} – ${name}`
    const body = [
      message,
      '',
      '—',
      `Name: ${name}`,
      `${T.email}: ${email}`
    ].join('\r\n')

    const params = new URLSearchParams({ subject, body })
    // URLSearchParams kodiert Leerzeichen als +, in mailto sind %20 verlaesslicher.
    return `mailto:${KONTAKT_MAIL}?${params.toString().replace(/\+/g, '%20')}`
  }

  /**
   * Attrappe. Es gibt keinen Endpunkt und keinen Mailversand.
   *
   * Wenn Hosting und Versandweg feststehen, wird GENAU DIESE FUNKTION ersetzt -
   * etwa durch einen POST auf den gewaehlten Endpunkt. Alles andere, auch die
   * Zustandslogik in contact-form.js, bleibt unberuehrt.
   */
  async function submitContact(data) {
    void data
    return { ok: false, reason: 'not-implemented' }
  }

  globalThis.PvKontakt = Object.freeze({ KONTAKT_MAIL, KONTAKT_TEL, validateField, FELDER, validateForm, buildMailtoHref, submitContact })
})()
