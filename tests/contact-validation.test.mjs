import { describe, it, expect } from 'vitest'
import '../js/contact-validation.js' // klassisches Skript, setzt globalThis.PvKontakt
const {
  validateField,
  validateForm,
  buildMailtoHref,
  submitContact
} = globalThis.PvKontakt

const gueltig = {
  name: 'Erika Mustermann',
  email: 'erika@example.org',
  message: 'Wir möchten KI im Kundenservice einsetzen und suchen Begleitung.',
  privacy: true,
  website: ''
}

describe('validateField', () => {
  it('akzeptiert einen normalen Namen', () => {
    expect(validateField('name', 'Erika Mustermann')).toBeNull()
  })

  it('beanstandet einen zu kurzen Namen', () => {
    expect(validateField('name', 'E')).toMatch(/mindestens 2/i)
  })

  it('beanstandet einen leeren Namen', () => {
    expect(validateField('name', '   ')).toMatch(/Bitte/i)
  })

  it('beanstandet einen zu langen Namen', () => {
    expect(validateField('name', 'a'.repeat(101))).toMatch(/100/)
  })

  it('akzeptiert eine normale E-Mail-Adresse', () => {
    expect(validateField('email', 'erika@example.org')).toBeNull()
  })

  it('beanstandet eine Adresse ohne At-Zeichen', () => {
    expect(validateField('email', 'erika.example.org')).toMatch(/E-Mail/i)
  })

  it('beanstandet eine Adresse ohne Punkt in der Domain', () => {
    expect(validateField('email', 'erika@example')).toMatch(/E-Mail/i)
  })

  it('akzeptiert eine ausreichend lange Nachricht', () => {
    expect(validateField('message', 'Zehn Zeichen und mehr.')).toBeNull()
  })

  it('beanstandet eine zu kurze Nachricht', () => {
    expect(validateField('message', 'zu kurz')).toMatch(/mindestens 10/i)
  })

  it('beanstandet eine zu lange Nachricht', () => {
    expect(validateField('message', 'a'.repeat(5001))).toMatch(/5000/)
  })

  it('beanstandet eine nicht angehakte Datenschutz-Checkbox', () => {
    expect(validateField('privacy', false)).toMatch(/Datenschutz/i)
  })

  it('akzeptiert eine angehakte Datenschutz-Checkbox', () => {
    expect(validateField('privacy', true)).toBeNull()
  })

  it('schneidet Leerraum ab, bevor es misst', () => {
    expect(validateField('name', '  Li  ')).toBeNull()
  })

  it('erklärt einen Honeypot mit reinem Leerraum für ungültig', () => {
    expect(validateField('website', '   ')).toMatch(/Ungültige/i)
  })

  it('akzeptiert einen leeren Honeypot', () => {
    expect(validateField('website', '')).toBeNull()
  })
})

describe('validateForm', () => {
  it('erklaert einen vollstaendigen Datensatz fuer gueltig', () => {
    const r = validateForm(gueltig)
    expect(r.valid).toBe(true)
    expect(Object.keys(r.errors)).toHaveLength(0)
  })

  it('sammelt alle Fehler auf einmal', () => {
    const r = validateForm({ name: '', email: 'kaputt', message: 'x', privacy: false, website: '' })
    expect(r.valid).toBe(false)
    expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name', 'privacy'])
  })

  it('erklaert einen befuellten Honeypot fuer ungueltig', () => {
    const r = validateForm({ ...gueltig, website: 'http://spam.example' })
    expect(r.valid).toBe(false)
    expect(r.errors.website).toBeTruthy()
  })

  it('nennt das erste fehlerhafte Feld in Formularreihenfolge', () => {
    const r = validateForm({ ...gueltig, name: '', email: 'kaputt' })
    expect(Object.keys(r.errors)[0]).toBe('name')
  })
})

describe('buildMailtoHref', () => {
  it('erzeugt einen mailto-Link an die Kontaktadresse', () => {
    expect(buildMailtoHref(gueltig)).toMatch(/^mailto:kontakt@pivon\.ai\?/)
  })

  it('traegt den Namen in den Betreff ein', () => {
    expect(buildMailtoHref(gueltig)).toContain(encodeURIComponent('Erika Mustermann'))
  })

  it('traegt Nachricht und Absenderadresse in den Textkoerper ein', () => {
    const href = buildMailtoHref(gueltig)
    expect(href).toContain(encodeURIComponent('erika@example.org'))
    expect(href).toContain(encodeURIComponent('Kundenservice'))
  })

  it('kodiert Sonderzeichen korrekt', () => {
    const href = buildMailtoHref({ ...gueltig, name: 'Müller & Söhne' })
    expect(href).toContain(encodeURIComponent('Müller & Söhne'))
    expect(href).not.toContain(' ')
  })
})

describe('submitContact', () => {
  it('meldet, dass der Versand noch nicht umgesetzt ist', async () => {
    const r = await submitContact(gueltig)
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('not-implemented')
  })
})

describe('Englische Fassung (en/)', () => {
  it('Fehlertexte auf Englisch', () => {
    expect(validateField('name', '', 'en')).toBe('Please enter your name.')
    expect(validateField('email', 'x', 'en')).toBe('Please enter a valid email address.')
    expect(validateField('privacy', false, 'en')).toBe('Please accept the privacy policy.')
  })
  it('validateForm reicht die Sprache durch', () => {
    const { errors } = validateForm({ ...gueltig, message: '' }, 'en')
    expect(errors.message).toBe('Please write us a few lines.')
  })
  it('mailto-Betreff auf Englisch', () => {
    expect(decodeURIComponent(buildMailtoHref(gueltig, 'en'))).toContain('Enquiry via pivon.ai – Erika Mustermann')
  })
  it('ohne Angabe bleibt alles deutsch', () => {
    expect(validateField('name', '')).toBe('Bitte geben Sie Ihren Namen an.')
  })
})
