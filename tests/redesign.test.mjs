import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'

// Struktur- und Regeltests für das Redesign nach Mockup K
// (docs/superpowers/specs/2026-10-10-redesign-vorlage-k-design.md).

export const SEITEN = [
  'index.html',
  'leistungen/beratung.html',
  'leistungen/quickstart-ki.html',
  'leistungen/entwicklung.html',
  'leistungen/startup-creator.html',
  'impressum.html',
  'datenschutz.html'
]
const lies = (p) => readFileSync(p, 'utf8')
const css = (n) => lies(`css/${n}.css`)
const alle = (html, re) => [...html.matchAll(re)]

describe('Task 1: Grundlagen', () => {
  it('alle Radius-Tokens sind 0', () => {
    const t = css('tokens')
    for (const n of ['radius-sm', 'radius', 'radius-lg', 'radius-pill']) {
      expect(t, `--${n}`).toMatch(new RegExp(`--${n}:\\s*0;`))
    }
  })

  it('JetBrains Mono ist selbst gehostet und eingebunden', () => {
    const t = css('tokens')
    for (const f of ['latin-400', 'latin-700', 'latin-ext-400', 'latin-ext-700']) {
      expect(existsSync(`fonts/jetbrains-mono-${f}.woff2`), f).toBe(true)
      expect(t).toContain(`../fonts/jetbrains-mono-${f}.woff2`)
    }
    expect(t).toMatch(/--font-mono:\s*'JetBrains Mono'/)
  })

  it('keine Schrift von Google Fonts', () => {
    for (const p of [...SEITEN, 'css/tokens.css', 'css/base.css', 'css/components.css', 'css/pages.css']) {
      expect(lies(p), p).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
    }
  })

  it('Raster und Druckregel vorhanden', () => {
    const b = css('base')
    expect(b).toMatch(/body::before\s*\{[^}]*var\(--color-grid\)/s)
    expect(b).toMatch(/@media print\s*\{[^@]*body::before\s*\{\s*display:\s*none/s)
  })

  it('Struktur-Tokens haben die Werte aus K', () => {
    const t = css('tokens')
    expect(t).toMatch(/--color-border:\s*#D3DBE5/i)
    expect(t).toMatch(/--color-border-str:\s*#C4CED9/i)
    expect(t).toMatch(/--color-grid:\s*#EDF1F6/i)
    expect(t).toMatch(/--container:\s*1400px/)
  })
})

describe('Task 2: Header', () => {
  const ERWARTET = [
    ['01', 'Leistungen', 'leistungen'],
    ['02', 'Vorgehen', 'vorgehen'],
    ['03', 'Anspruch', 'anspruch'],
    ['04', 'Über uns', 'ueber-uns'],
    ['05', 'Kontakt', 'kontakt']
  ]
  for (const p of SEITEN) {
    it(`${p}: fünf nummerierte Menüpunkte, kein Kopf-Button`, () => {
      const html = lies(p)
      const kopf = html.match(/<header class="pv-header"[\s\S]*?<\/header>/)[0]
      const desktop = kopf.match(/<nav class="pv-nav"[\s\S]*?<\/nav>/)[0]
      const links = alle(desktop, /<a class="pv-nav__link" href="([^"]+)"><span class="pv-nav__num">(\d\d)<\/span> ([^<]+)<\/a>/g)
      expect(links.map((m) => [m[2], m[3], m[1].split('#')[1]])).toEqual(ERWARTET)
      expect(kopf).not.toContain('pv-header__cta')
      expect(kopf).not.toContain('>Startseite<')
      // Mobilmenü: dieselben fünf Punkte plus Kontakt-Button
      const mobil = kopf.match(/<nav class="pv-mobile-nav__panel"[\s\S]*?<\/nav>/)[0]
      expect(alle(mobil, /class="pv-nav__num"/g).length).toBe(5)
      expect(mobil).toContain('pv-btn pv-btn--primary')
    })
  }
  it('Startseite verlinkt Anker direkt, Unterseiten über index.html', () => {
    expect(lies('index.html')).toContain('href="#leistungen"><span class="pv-nav__num">01')
    expect(lies('leistungen/beratung.html')).toContain('href="../index.html#leistungen"><span class="pv-nav__num">01')
    expect(lies('impressum.html')).toContain('href="index.html#leistungen"><span class="pv-nav__num">01')
  })
  it('Logo 38 px, Menü in Mono', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-header__logo img\s*\{[^}]*height:\s*38px/s)
    expect(c).toMatch(/\.pv-nav__link\s*\{[^}]*font-family:\s*var\(--font-mono\)/s)
    expect(c).not.toContain('.pv-header__cta')
  })
  it('bis 900 px Hamburger statt Desktop-Menü (gekoppelt an nav.js)', () => {
    const c = css('components')
    expect(c).toMatch(/@media \(max-width: 900px\)\s*\{\s*\.pv-nav\s*\{\s*display:\s*none;\s*\}\s*\.pv-mobile-nav\s*\{\s*display:\s*block;/s)
    expect(c.match(/^\.pv-btn \{/gm)).toHaveLength(1)
  })
})

describe('Task 3: Netz', () => {
  it('Startseite: Knowledge Graph statt Netz in der Bühne', () => {
    const html = lies('index.html')
    expect(html).toMatch(/<section class="pv-hero">\s*<canvas class="pv-net pv-kg" aria-hidden="true"><\/canvas>/)
    expect(html).toContain('<script src="js/kg.js?v=10" defer></script>')
    expect(html).not.toContain('js/net.js')
  })
  for (const p of SEITEN.slice(1)) {
    it(`${p}: Canvas im Seitenkopf, Skript eingebunden`, () => {
      const html = lies(p)
      if (p.startsWith('leistungen/')) {
        // Leistungsseiten: Knowledge Graph wie auf der Startseite
        expect(html).toMatch(/<div class="pv-pagehead pv-pagehead--leistung">\s*<canvas class="pv-net pv-kg" data-kg-fokus="[a-z-]+" aria-hidden="true"><\/canvas>/)
        expect(html).toContain('<script src="../js/kg.js?v=10" defer></script>')
      } else {
        expect(html).toMatch(/<div class="pv-pagehead">\s*<canvas class="pv-net" aria-hidden="true"><\/canvas>/)
        expect(html).toContain('<script src="js/net.js?v=3" defer></script>')
      }
    })
  }
  it('Canvas nimmt keinen Platz ein und ist im Druck aus', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-net\s*\{[^}]*position:\s*absolute[^}]*pointer-events:\s*none/s)
    expect(c).toMatch(/@media print\s*\{[^@]*\.pv-net\s*\{\s*display:\s*none/s)
  })
})

describe('Task 4: Bühne und Seitenkopf', () => {
  it('Bühne ohne Buttons und ohne Zeilenumbruch in der Headline', () => {
    const hero = lies('index.html').match(/<section class="pv-hero">[\s\S]*?<\/section>/)[0]
    expect(hero).not.toContain('pv-hero__actions')
    expect(hero).not.toContain('<br>')
    expect(hero).toContain('pv-hero__accent--cyan')
    expect(hero).toContain('pv-hero__accent--magenta')
  })
  it('Bühne und Seitenkopf tragen das weiße Raster', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-hero\s*\{[^}]*var\(--color-grid-on-ink\)/s)
    expect(c).toMatch(/\.pv-pagehead\s*\{[^}]*var\(--color-grid-on-ink\)/s)
  })
  it('Brotkrumen und Badge in Mono', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-breadcrumb ol\s*\{[^}]*var\(--font-mono\)/s)
    expect(c).toMatch(/\.pv-badge\s*\{[^}]*var\(--font-mono\)/s)
  })
})

describe('Task 5: Leistungskarten', () => {
  const IO = {
    'beratung.html': ['„wo fangen wir überhaupt an?“', 'eine Roadmap mit belastbaren Use Cases'],
    'quickstart-ki.html': ['ein Team ohne KI-Praxis', 'das erste Ergebnis in Wochen'],
    'entwicklung.html': ['ein Use Case auf der Shortlist', 'ein System im Produktivbetrieb'],
    'startup-creator.html': ['eine Vision oder Idee', 'eine fertige Digitallösung']
  }
  const karten = (html) => alle(html, /<div class="pv-card">([\s\S]*?)<\/div>/g).map((m) => m[1])
  const pruefe = (k) => {
    const href = k.match(/class="pv-card__link" href="([^"]+)"/)[1].split('/').pop()
    expect(k).toContain(`<span class="pv-card__io-in">${IO[href][0]}</span>`)
    expect(k).toContain(`<span class="pv-card__io-out">${IO[href][1]}</span>`)
    expect(k).not.toContain('pv-card__icon')
    expect(k).not.toContain('pv-card__meta')
    // Reihenfolge = Subgrid-Zeilen
    const folge = alle(k, /class="(pv-card__title|pv-card__text|pv-card__io|pv-card__more)"/g).map((m) => m[1])
    expect(folge).toEqual(['pv-card__title', 'pv-card__text', 'pv-card__io', 'pv-card__more'])
  }
  it('Startseite: vier Karten mit In/Out', () => {
    const k = karten(lies('index.html'))
    expect(k).toHaveLength(4)
    k.forEach(pruefe)
  })
  for (const p of SEITEN.slice(1, 5)) {
    it(`${p}: drei Querverweis-Karten mit In/Out, ohne sich selbst`, () => {
      const k = karten(lies(p))
      expect(k).toHaveLength(3)
      k.forEach(pruefe)
      expect(k.join('')).not.toContain(`href="${p.split('/').pop()}"`)
    })
  }
  it('pa11y nimmt nur noch die Labels in/out aus (Texte erfüllen AA)', () => {
    const cfg = JSON.parse(lies('.pa11yci.json'))
    expect(cfg.defaults.hideElements).toBe('.pv-card__io-k')
  })
  it('In/Out-Texte in den dunklen Geschwistern, Bühne bleibt hell', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-card__io-in\s*\{[^}]*color:\s*var\(--color-io-in\)/s)
    expect(c).toMatch(/\.pv-card__io-out\s*\{[^}]*color:\s*var\(--color-io-out\)/s)
    expect(c).toMatch(/\.pv-hero__accent--cyan\s*\{[^}]*var\(--color-accent-cyan-on-ink\)/s)
  })
  it('Karten als Subgrid, In/Out ohne Umbruch', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-card\s*\{[^}]*grid-template-rows:\s*subgrid/s)
    expect(c).toMatch(/\.pv-card__io\s*\{[^}]*white-space:\s*nowrap/s)
  })
})

describe('Task 6: Vorgehen und Anspruch', () => {
  const html = () => lies('index.html')
  it('fünf Schritte in der richtigen Reihenfolge, Konzeption an dritter Stelle', () => {
    const v = html().match(/<section[^>]*id="vorgehen"[\s\S]*?<\/section>/)[0]
    const titel = alle(v, /<h3 class="pv-steps__title">([^<]+)<\/h3>/g).map((m) => m[1])
    expect(titel).toEqual(['Kontakt', 'Auftragsklärung', 'Konzeption', 'Umsetzung', 'Abschluss'])
    expect(v).toContain('In fünf klaren Schritten zum Ziel.')
    // Nummern kommen aus dem CSS-Zähler, nicht aus dem HTML
    expect(alle(v, /<span class="pv-steps__num" aria-hidden="true"><\/span>/g)).toHaveLength(5)
  })
  it('Triade mit Tag-Labels statt Icons', () => {
    const a = html().match(/<section[^>]*id="anspruch"[\s\S]*?<\/section>/)[0]
    expect(alle(a, /<span class="pv-triad__tag">(Mensch|Organisation|Technologie)<\/span>/g)).toHaveLength(3)
    expect(a).not.toContain('pv-triad__icon')
  })
  it('Schritte: fünf Spalten mit Zähler', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-steps\s*\{[^}]*repeat\(5, 1fr\)[^}]*counter-reset:\s*schritt/s)
    expect(c).toMatch(/\.pv-steps__num::before\s*\{[^}]*counter\(schritt, decimal-leading-zero\)/s)
  })
  it('keine Browser-Listennummern neben den Schritten (ol)', () => {
    expect(css('components')).toMatch(/\.pv-steps\s*\{[^}]*list-style:\s*none/s)
  })
})

describe('Task 7: Über uns, CTA, Kontakt', () => {
  const html = () => lies('index.html')
  it('zwei Team-Boxen mit Namen, Rolle und sechs Pins', () => {
    const u = html().match(/<section[^>]*id="ueber-uns"[\s\S]*?<\/section>/)[0]
    // Zerlegen an den Box-Anfängen – ein Regex bis "</li>" schnitte an der
    // verschachtelten Pin-Liste zu früh ab.
    const boxen = u.split(/<li class="pv-ic pv-ic--[lr]">/).slice(1)
    expect(boxen).toHaveLength(2)
    expect(boxen[0]).toContain('<h3 class="pv-ic__name">Alexander Quadt</h3>')
    expect(boxen[1]).toContain('<h3 class="pv-ic__name">Andreas Steiert</h3>')
    // Platzhalter fürs Profilfoto vor dem Namen, keine farbigen Ecken mehr
    for (const b of boxen) {
      expect(b.indexOf('pv-ic__foto')).toBeGreaterThan(-1)
      expect(b.indexOf('pv-ic__foto')).toBeLessThan(b.indexOf('pv-ic__name'))
      expect(b).not.toContain('pv-ic__corner')
    }
    for (const b of boxen) expect(alle(b, /<li>[^<]+<\/li>/g)).toHaveLength(6)
    expect(u).toContain('<h2 id="ueber-uns-titel">Wer wir sind.</h2>')
  })
  it('Formular-Kennungen unverändert', () => {
    for (const id of ['pv-contact-form', 'pv-form-notice', 'pv-form-status', 'pv-name', 'pv-email', 'pv-message', 'pv-privacy', 'pv-website']) {
      expect(html(), id).toContain(`id="${id}"`)
    }
  })
  it('Kontaktkopf steht in der linken Spalte', () => {
    expect(html()).toMatch(/<div class="pv-contact__side">\s*<div class="pv-section__head pv-reveal">/)
  })
})

describe('Task 8: Unterseiten', () => {
  it('Themenblöcke sind eckige Boxen mit Mono-Pins', () => {
    const p = css('pages')
    expect(p).toMatch(/\.pv-topic\s*\{[^}]*border:\s*1px solid var\(--color-border\)/s)
    expect(p).toMatch(/\.pv-topic__list li\s*\{[^}]*font-family:\s*var\(--font-mono\)/s)
    expect(p).not.toMatch(/text-align:\s*center/)
  })
  it('jede Leistungsseite hat Themenblöcke mit Stichwortlisten', () => {
    for (const s of SEITEN.slice(1, 5)) {
      expect(alle(lies(s), /class="pv-topic pv-reveal"/g).length, s).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('Abschluss-Review', () => {
  it('Druck: Bühne und Seitenkopf ohne Raster (Spec §7)', () => {
    expect(css('components')).toMatch(/@media print\s*\{[^@]*\.pv-hero,\s*\.pv-pagehead\s*\{\s*background:\s*var\(--color-ink\)/s)
  })
})

describe('Überschriften etwas kleiner (Kundenwunsch nach Vergleich)', () => {
  it('Section-Überschriften 28–42 px', () => {
    expect(css('base')).toMatch(/\nh2 \{[^}]*font-size:\s*clamp\(1\.75rem, 1rem \+ 2\.4vw, 2\.625rem\)/s)
  })
  it('CTA-Überschrift 30–48 px', () => {
    expect(css('components')).toMatch(/\.pv-cta__title\s*\{[^}]*font-size:\s*clamp\(1\.875rem, 1rem \+ 3vw, 3rem\)/s)
  })
})

describe('Vorgehen-Nummern kleiner, Anspruch ohne "Wir sind…"', () => {
  it('Schrittnummern 44 px', () => {
    expect(css('components')).toMatch(/\.pv-steps__num\s*\{[^}]*font-size:\s*2\.75rem/s)
  })
  it('Anspruch-Einleitung endet ohne "Wir sind…"', () => {
    const a = lies('index.html').match(/<section[^>]*id="anspruch"[\s\S]*?<\/section>/)[0]
    expect(a).not.toMatch(/Wir sind/)
    expect(a).toContain('durch die Herausforderungen der Zeit navigieren.</p>')
  })
})

describe('Team-Boxen ohne Ecken, kleinere Namen', () => {
  it('keine Eck-Regeln mehr, Namen 24–30 px, Foto-Platzhalter eckig', () => {
    const c = css('components')
    expect(c).not.toContain('pv-ic__corner')
    expect(c).toMatch(/\.pv-ic__name\s*\{[^}]*font-size:\s*clamp\(1\.5rem, 1\.1rem \+ 1vw, 1\.875rem\)/s)
    // Feldgröße: siehe „Foto-Feld 176 px“ (Kundenwunsch 2026-10-11, vorher 88 px)
  })
})

describe('Knowledge Graph auf der Bühne (Übernahme Mockup L)', () => {
  it('Bühne 600 px hoch, Graph ohne Links-Ausblendung', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-hero\s*\{[^}]*min-height:\s*min\(70vh, 600px\)/s)
    expect(c).toMatch(/\.pv-kg\s*\{[^}]*mask-image:\s*none/s)
  })
  it('Impressum und Datenschutz behalten das Netz', () => {
    for (const p of SEITEN.filter((x) => !x.startsWith('leistungen/') && x !== 'index.html')) {
      expect(lies(p), p).toContain('js/net.js')
      expect(lies(p), p).not.toContain('pv-kg')
    }
  })
})

describe('Netz und Knowledge Graph laufen auch ohne Server (file://)', () => {
  // Chrome blockiert ES-Module über file:// (CORS). Klassische Skripte mit
  // defer laufen dort und behalten die Reihenfolge: erst Logik, dann Zeichnung.
  const DATEIEN = ['js/net-graph.js', 'js/net.js', 'js/kg-graph.js', 'js/kg.js',
    'js/scrollspy.js', 'js/nav.js', 'js/contact-validation.js', 'js/contact-form.js']
  it('keine Seite lädt mehr ein ES-Modul', () => {
    for (const p of SEITEN) expect(lies(p), p).not.toMatch(/<script[^>]*type="module"/)
  })
  it('Startseite: alle Skripte klassisch mit defer, Logik vor Anbindung', () => {
    const tags = alle(lies('index.html'), /<script src="js\/([a-z-]+)\.js\?v=\d+" defer><\/script>/g).map((m) => m[1])
    expect(tags).toEqual(['scrollspy', 'nav', 'net-graph', 'kg-graph', 'kg', 'gauge', 'contact-validation', 'contact-form'])
  })
  it('keine import/export-Anweisungen in den Skripten', () => {
    for (const d of DATEIEN) expect(lies(d), d).not.toMatch(/^\s*(import|export)\s/m)
  })
  it('Startseite: klassische Skripte in fester Reihenfolge', () => {
    const html = lies('index.html')
    const tags = alle(html, /<script src="js\/(net-graph|kg-graph|kg)\.js\?v=\d+" defer><\/script>/g).map((m) => m[1])
    expect(tags).toEqual(['net-graph', 'kg-graph', 'kg'])
    expect(html).not.toMatch(/type="module" src="js\/(kg|net)/)
  })
  for (const p of SEITEN.slice(1)) {
    it(`${p}: Netz bzw. Graph als klassische Skripte`, () => {
      const html = lies(p)
      const pre = p.startsWith('leistungen/') ? '../' : ''
      const zeichnung = p.startsWith('leistungen/') ? [`${pre}js/kg-graph.js`, `${pre}js/kg.js`] : [`${pre}js/net.js`]
      // alle defer-Skripte in Reihenfolge, Versionsparameter abgeschnitten
      const tags = alle(html, /<script src="([^"?]+)\?v=\d+" defer><\/script>/g).map((m) => m[1])
      expect(tags).toEqual([`${pre}js/scrollspy.js`, `${pre}js/nav.js`, `${pre}js/net-graph.js`, ...zeichnung])
      expect(html).not.toMatch(/type="module" src="(\.\.\/)?js\/net\.js/)
    })
  }
})

describe('Menü: immer nur eine Linie', () => {
  // Fehler: Hover unterstrich den Text, der aktive Punkt hatte eine Rahmenlinie –
  // nach dem Klick (aktiv + Hover) waren zwei Linien zu sehen.
  const c = () => css('components')
  it('kein Text-Unterstrich im Menü', () => {
    const regeln = alle(c(), /([^{}]*\.pv-nav__link[^{}]*)\{([^}]*)\}/g)
    for (const [, sel, rumpf] of regeln) expect(rumpf, sel.trim()).not.toMatch(/text-decoration:\s*underline/)
  })
  it('Hover zeigt die Rahmenlinie, aktiver Punkt bleibt beim Hover blau', () => {
    expect(c()).toMatch(/\.pv-nav \.pv-nav__link:not\(\.pv-nav__link--active\):hover\s*\{[^}]*border-bottom-color:\s*var\(--color-ink\)/s)
    expect(c()).toMatch(/\.pv-nav__link--active\s*\{[^}]*border-bottom-color:\s*var\(--color-action\)/s)
  })
  it('aktiver Punkt bleibt beim Hover auch im Text blau', () => {
    expect(c()).not.toMatch(/^\.pv-nav__link:hover\s*\{/m)
    expect(c()).toMatch(/\.pv-nav__link:not\(\.pv-nav__link--active\):hover\s*\{[^}]*color:\s*var\(--color-ink\)/s)
  })
})

describe('Leistungen: Reihenfolge der Karten', () => {
  it('Beratung, Startup Creator, Entwicklung, Quickstart KI', () => {
    const titel = alle(lies('index.html'), /<h3 class="pv-card__title"><a class="pv-card__link" href="[^"]+">([^<]+)<\/a><\/h3>/g).map((m) => m[1])
    expect(titel).toEqual(['Beratung.', 'Startup Creator.', 'Entwicklung.', 'Quickstart KI.'])
  })
})

describe('Weitere Leistungen: gleiche Reihenfolge wie auf der Startseite', () => {
  const REIHENFOLGE = ['beratung.html', 'startup-creator.html', 'entwicklung.html', 'quickstart-ki.html']
  for (const p of SEITEN.slice(1, 5)) {
    it(`${p}`, () => {
      const hrefs = alle(lies(p), /<a class="pv-card__link" href="([^"]+)">/g).map((m) => m[1])
      expect(hrefs).toEqual(REIHENFOLGE.filter((s) => s !== p.split('/').pop()))
    })
  }
})

describe('Menü: Leistungen klappt auf', () => {
  const UNTER = [['beratung', 'Beratung'], ['startup-creator', 'Startup Creator'], ['entwicklung', 'Entwicklung'], ['quickstart-ki', 'Quickstart KI']]
  for (const p of SEITEN) {
    it(`${p}: Desktop und mobil führen direkt zu den vier Leistungsseiten`, () => {
      const kopf = lies(p).match(/<header class="pv-header"[\s\S]*?<\/header>/)[0]
      const basis = p.startsWith('leistungen/') ? '' : 'leistungen/'
      for (const nav of [/<nav class="pv-nav"[\s\S]*?<\/nav>/, /<nav class="pv-mobile-nav__panel"[\s\S]*?<\/nav>/]) {
        const n = kopf.match(nav)[0]
        const sub = n.match(/<ul class="pv-nav__sub">([\s\S]*?)<\/ul>/)
        expect(sub, `${p} ${nav}`).not.toBeNull()
        const links = alle(sub[1], /<a class="pv-nav__sublink" href="([^"]+)"( aria-current="page")?>([^<]+)<\/a>/g)
        expect(links.map((m) => [m[1], m[3]])).toEqual(UNTER.map(([d, t]) => [`${basis}${d}.html`, t]))
        // die aktuelle Leistungsseite ist markiert, sonst keine
        const aktuell = links.filter((m) => m[2]).map((m) => m[1])
        expect(aktuell).toEqual(p.startsWith('leistungen/') ? [p.split('/').pop()] : [])
      }
    })
  }
  it('Untermenü öffnet bei Hover und Tastaturfokus, ohne JavaScript', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-nav__item--sub:hover \.pv-nav__sub,\s*\.pv-nav__item--sub:focus-within \.pv-nav__sub\s*\{[^}]*display:\s*block/s)
  })
})

describe('Über uns: Foto Andreas, Felder doppelt so groß', () => {
  const ueber = () => lies('index.html').match(/<section[^>]*id="ueber-uns"[\s\S]*?<\/section>/)[0]
  it('Andreas mit Foto (1x/2x), Alexander weiter mit Platzhalter', () => {
    const [, alex, andreas] = ueber().split(/<li class="pv-ic pv-ic--[lr]">/)
    expect(andreas).toMatch(/<img class="pv-ic__foto" src="images\/andreas-steiert-176\.jpg" srcset="images\/andreas-steiert-176\.jpg 1x, images\/andreas-steiert-352\.jpg 2x" width="176" height="176" alt="" loading="lazy">/)
    expect(alex).toContain('<span class="pv-ic__foto" aria-hidden="true">AQ</span>')
  })
  it('Fotodateien klein und vorhanden', () => {
    for (const g of [176, 352]) {
      const f = `images/andreas-steiert-${g}.jpg`
      expect(existsSync(f), f).toBe(true)
      expect(readFileSync(f).length, f).toBeLessThan(40000)
    }
  })
  it('Foto-Feld 176 px (vorher 88 px), mobil kleiner', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-ic__foto\s*\{[^}]*width:\s*176px;[^}]*height:\s*176px/s)
    expect(c).toMatch(/@media \(max-width: 480px\)\s*\{\s*\.pv-ic__foto\s*\{[^}]*width:\s*112px/s)
  })
})

describe('Über uns: keine Kennung oben rechts', () => {
  it('weder „IC · …“-Text im HTML noch die Regel im CSS', () => {
    expect(lies('index.html')).not.toContain('pv-ic__pn')
    expect(lies('index.html')).not.toMatch(/IC · (ALX|AND)/)
    expect(css('components')).not.toContain('pv-ic__pn')
  })
})

describe('Vorgehen: Beschreibungstext unter der Überschrift', () => {
  it('Lead-Absatz direkt nach der h2, wie bei den anderen Sektionen', () => {
    const v = lies('index.html').match(/<section[^>]*id="vorgehen"[\s\S]*?<\/section>/)[0]
    expect(v).toMatch(/<h2 id="vorgehen-titel">[^<]+<\/h2>\s*(<!--[^>]*-->\s*)?<p class="pv-section__lead">[^<]{40,}<\/p>/)
  })
})

describe('Leistungsseiten: Knowledge Graph, Überschrift in der Bühne, Kickoff', () => {
  const UEBERSCHRIFT = {
    'leistungen/beratung.html': 'Beratung ist ein Dialog, kein Monolog',
    'leistungen/quickstart-ki.html': 'Der Dreiklang gilt auch beim Einstieg',
    'leistungen/entwicklung.html': 'Vom Prototyp zur verlässlichen Lösung',
    'leistungen/startup-creator.html': 'Eine gute Idee ist der Anfang, nicht das Geschäft'
  }
  for (const [p, titel] of Object.entries(UEBERSCHRIFT)) {
    it(`${p}: bisherige Section-Überschrift ist die h1 im Seitenkopf`, () => {
      const html = lies(p)
      expect(html).toContain(`<h1 class="pv-pagehead__title">${titel}</h1>`)
      expect(html).not.toContain('einleitung-titel')
      expect(html.match(/<h1[ >]/g)).toHaveLength(1)
    })
    it(`${p}: Kickoff ist die zweite Section, Hintergründe wechseln weiter ab`, () => {
      const html = lies(p)
      const sections = alle(html.match(/<main[\s\S]*?<\/main>/)[0], /<section class="([^"]+)"([^>]*)>/g)
        .map((m) => ({ alt: m[1].includes('pv-section--alt'), cta: m[1].includes('pv-cta'), attr: m[2] }))
        .filter((x) => !x.cta)
      expect(sections[0].attr).toContain('aria-label="Einleitung"')
      expect(sections[1].attr).toContain('aria-labelledby="kickoff-titel"')
      sections.forEach((x, i) => expect(x.alt, `Section ${i + 1}`).toBe(i % 2 === 1))
      expect(html).toMatch(/<!-- PLATZHALTER: Blindtext Kickoff[^>]*-->/)
      expect(html).toContain('<h2 class="pv-topic__title" id="kickoff-titel">Kickoff</h2>')
    })
  }
  it('Seitenkopf-Überschrift schmal wie auf der Startseite, Platz für den Graph', () => {
    expect(css('components')).toMatch(/\.pv-pagehead__title\s*\{[^}]*max-width:\s*19ch/s)
  })
  it('kg.js findet den Graph in Bühne und Seitenkopf, eigener Rand im Seitenkopf', () => {
    const js = lies('js/kg.js')
    expect(js).toContain(".pv-pagehead canvas.pv-kg")
    expect(js).toContain('REGELN.randUnterseite')
    expect(js).toContain("'.pv-breadcrumb', '.pv-pagehead__title', '.pv-pagehead__lead'")
  })
})

describe('Section „Bereit für den nächsten Schritt?“', () => {
  const cta = (p) => lies(p).match(/<section class="pv-cta"[\s\S]*?<\/section>/)[0]
  it('Startseite: nur Überschrift, keine Unterzeile, kein Button', () => {
    expect(cta('index.html')).toContain('<h2 id="cta-titel" class="pv-cta__title">Bereit für den nächsten Schritt?</h2>')
    expect(cta('index.html')).not.toContain('pv-cta__text')
    expect(cta('index.html')).not.toContain('pv-btn')
  })
  it.each(SEITEN.filter((x) => x.startsWith('leistungen/')))('%s: Überschrift, Unterzeile und Button zum Kontakt', (p) => {
    expect(cta(p)).toContain('<p class="pv-cta__text">')
    expect(cta(p)).toContain('<a class="pv-btn pv-btn--primary" href="../index.html#kontakt">Erstgespräch vereinbaren</a>')
  })
})

describe('Leistungsseiten: Überschrift im Seitenkopf etwas kleiner', () => {
  it('eigene Größe nur für die Leistungsseiten (max. 2,875rem statt 3,5rem)', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-pagehead--leistung \.pv-pagehead__title\s*\{[^}]*font-size:\s*clamp\(1\.875rem, 1\.1rem \+ 2\.8vw, 2\.875rem\)/s)
    expect(c).toMatch(/\.pv-pagehead__title\s*\{[^}]*font-size:\s*clamp\(2\.125rem, 1\.2rem \+ 3\.6vw, 3\.5rem\)/s)
  })
})

describe('Leistungsseiten: Seitenkopf ohne Unterzeile', () => {
  it.each(SEITEN.filter((x) => x.startsWith('leistungen/')))('%s: nur Brotkrumen und Überschrift', (p) => {
    const kopf = lies(p).match(/<div class="pv-pagehead[^"]*">[\s\S]*?<\/h1>\s*<\/div>/)
    expect(kopf, 'Überschrift schließt den Seitenkopf ab').not.toBeNull()
    expect(lies(p)).not.toContain('pv-pagehead__lead')
  })
})

// ---------------------------------------------------------------------------
// Englische Fassung, Sprachschalter, Fortschrittsbalken (Übernahme Mockup M)
// ---------------------------------------------------------------------------
const PAARE = {
  'index.html': 'en/index.html',
  'impressum.html': 'en/legal-notice.html',
  'datenschutz.html': 'en/privacy.html',
  'leistungen/beratung.html': 'en/services/consulting.html',
  'leistungen/startup-creator.html': 'en/services/startup-creator.html',
  'leistungen/entwicklung.html': 'en/services/development.html',
  'leistungen/quickstart-ki.html': 'en/services/quickstart-ai.html'
}
const relativ = (von, nach) => {
  const a = von.split('/').slice(0, -1), b = nach.split('/')
  while (a.length && b.length > 1 && a[0] === b[0]) { a.shift(); b.shift() }
  return [...a.map(() => '..'), ...b].join('/')
}
const sichtbar = (html) => html.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<head>[\s\S]*?<\/head>/g, '')

describe('Englische Fassung und Sprachschalter', () => {
  for (const [de, en] of Object.entries(PAARE)) {
    it(`${de} ↔ ${en}: Schalter verlinkt die Gegenseite, aktive Sprache markiert`, () => {
      const d = lies(de), e = lies(en)
      const name = (p) => p.split('/').pop()
      expect(d).toContain(`<a class="pv-lang__link" href="${name(de)}" lang="de" hreflang="de" aria-current="true">DE</a>`)
      expect(d).toContain(`<a class="pv-lang__link" href="${relativ(de, en)}" lang="en" hreflang="en">EN</a>`)
      expect(e).toContain(`<a class="pv-lang__link" href="${relativ(en, de)}" lang="de" hreflang="de">DE</a>`)
      expect(e).toContain(`<a class="pv-lang__link" href="${name(en)}" lang="en" hreflang="en" aria-current="true">EN</a>`)
    })
    it(`${en}: lang="en", hreflang-Paar im Kopf, gleiche Struktur wie DE`, () => {
      const d = lies(de), e = lies(en)
      expect(e).toMatch(/<html lang="en">/)
      for (const h of [d, e]) {
        expect(h).toMatch(/<link rel="alternate" hreflang="de" href="https:\/\/pivon\.ai\/[^"]*">/)
        expect(h).toMatch(/<link rel="alternate" hreflang="en" href="https:\/\/pivon\.ai\/en\/[^"]*">/)
        expect(h).toMatch(/<link rel="alternate" hreflang="x-default" href="https:\/\/pivon\.ai\/[^"]*">/)
      }
      const ids = (h) => alle(h, /\sid="([^"]+)"/g).map((m) => m[1])
      expect(ids(e)).toEqual(ids(d))
      const klassen = (h) => alle(h, /<(section|h[1-3]|ul|ol)\b[^>]*class="([^"]+)"/g).map((m) => m[1] + '.' + m[2])
      expect(klassen(e)).toEqual(klassen(d))
      const skripte = (h) => alle(h, /<script src="(?:\.\.\/)*(js\/[^"?]+)/g).map((m) => m[1])
      expect(skripte(e)).toEqual(skripte(d))
    })
    it(`${en}: kein deutscher Fließtext mehr (außer Verweis aufs deutsche Original)`, () => {
      const text = sichtbar(lies(en))
        .replace(/<a [^>]*lang="de"[^>]*>[^<]*<\/a>/g, '')
        .replace(/Franz-Schubert-Str\. 5|79189 Bad Krozingen/g, '')
      expect(text).not.toMatch(/[äöüÄÖÜß]/)
      expect(text).not.toMatch(/>[^<]*\b(und|der|die|Sie|nicht|für)\b[^<]*</)
    })
  }
  it('Rechtsseiten EN: Hinweis, dass nur die deutsche Fassung gilt', () => {
    expect(lies('en/legal-notice.html')).toContain('Only the German version is legally binding: <a href="../impressum.html" hreflang="de" lang="de">Impressum</a>')
    expect(lies('en/privacy.html')).toContain('Only the German version is legally binding: <a href="../datenschutz.html" hreflang="de" lang="de">Datenschutzerklärung</a>')
  })
  it('Schalter eckig, aktive Sprache im Verlauf wie pivon.ai; mobil neben dem Menü-Knopf', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-lang__link\[aria-current="true"\]\s*\{[^}]*background:\s*var\(--gradient-akzent\)/s)
    expect(c).toMatch(/\.pv-lang \+ \.pv-mobile-nav\s*\{\s*margin-left:\s*0/s)
    expect(css('tokens')).toMatch(/--gradient-akzent:\s*linear-gradient\(100deg, #2F6BEC, #E5258E\)/)
  })
  it('Graph-Grenze der EN-Bühne steht im Markup', () => {
    expect(lies('en/index.html')).toMatch(/<h1 class="pv-hero__title" data-kg-grenze="pragmatically:\d+">/)
  })
})

describe('Fortschrittsbalken unter Vorgehen', () => {
  for (const p of ['index.html', 'en/index.html']) {
    it(`${p}: direkt nach den Boxen, ohne Skript verborgen, dekorativ`, () => {
      const v = lies(p).match(/<section[^>]*id="vorgehen"[\s\S]*?<\/section>/)[0]
      expect(v).toMatch(/<\/ol>\s*<div class="pv-gauge" aria-hidden="true" hidden>\s*<div class="pv-gauge__fill"><\/div>\s*<div class="pv-gauge__seg"><\/div>\s*<span class="pv-gauge__wert">0%<\/span>\s*<\/div>/)
      expect(lies(p)).toMatch(/<script src="(\.\.\/)?js\/gauge\.js\?v=\d+" defer><\/script>/)
    })
  }
  it('CSS: 16 px hoch, teilt die Linie mit den Boxen, Zahl nie umbrochen', () => {
    const c = css('components')
    expect(c).toMatch(/\.pv-gauge\s*\{[^}]*height:\s*16px[^}]*border-top:\s*0/s)
    expect(c).toMatch(/\.pv-gauge__wert\s*\{[^}]*white-space:\s*nowrap/s)
    expect(c).toMatch(/\.pv-gauge__seg\s*\{[^}]*--n:\s*40/s)
  })
})

describe('Leistungsseiten: Graph sagt pro Leistung etwas aus', () => {
  const FOKUS = {
    beratung: ['leistungen/beratung.html', 'en/services/consulting.html'],
    'startup-creator': ['leistungen/startup-creator.html', 'en/services/startup-creator.html'],
    entwicklung: ['leistungen/entwicklung.html', 'en/services/development.html'],
    'quickstart-ki': ['leistungen/quickstart-ki.html', 'en/services/quickstart-ai.html']
  }
  for (const [name, seiten] of Object.entries(FOKUS)) {
    for (const p of seiten) {
      it(`${p}: Teilnetz „${name}“ am Canvas`, () => {
        expect(lies(p)).toContain(`<canvas class="pv-net pv-kg" data-kg-fokus="${name}" aria-hidden="true"></canvas>`)
      })
    }
  }
  it('Startseite ohne Teilnetz: zeigt das ganze Bild', () => {
    expect(lies('index.html')).not.toContain('data-kg-fokus')
    expect(lies('en/index.html')).not.toContain('data-kg-fokus')
  })
})

describe('Hosting bei Vercel und Sitemap', () => {
  it('Datenschutz DE/EN nennt Vercel als Hosting-Anbieter, kein Platzhalter mehr für den Namen', () => {
    for (const p of ['datenschutz.html', 'en/privacy.html']) {
      const h = lies(p)
      expect(h, p).toContain('Vercel Inc.<br>')
      expect(h, p).toMatch(/Data Privacy Framework/)
      expect(h, p).not.toMatch(/\[Name (und vollständige Anschrift des Hosting-Anbieters|and full address of the hosting provider)\]/)
      expect(h, p).not.toMatch(/(unserem eigenen|our own) server/i)
    }
  })
  it('sitemap.xml: alle sichtbaren Seiten mit Sprachpaar (ohne ausgeblendetes Quickstart), robots.txt verweist darauf', () => {
    const s = lies('sitemap.xml')
    const locs = alle(s, /<loc>https:\/\/pivon\.ai\/([^<]*)<\/loc>/g).map((m) => m[1] || 'index.html')
    const erwartet = Object.entries(PAARE).flat().map((p) => p.replace(/^en\/index\.html$/, 'en/'))
      .filter((p) => !/quickstart/.test(p))
    expect(locs.sort()).toEqual(erwartet.sort())
    expect(s.match(/hreflang="en"/g)).toHaveLength(12)
    expect(lies('robots.txt')).toContain('Sitemap: https://pivon.ai/sitemap.xml')
  })
})

describe('Quickstart KI ausgeblendet, nicht gelöscht', () => {
  const ALLE = Object.entries(PAARE).flat()
  const KOMMENTAR = '<!-- Quickstart KI vorübergehend ausgeblendet: zum Wiedereinblenden "hidden" entfernen -->'
  for (const p of ALLE) {
    it(`${p}: Menüeinträge (Desktop + mobil) tragen hidden, mit Hinweis`, () => {
      const h = lies(p)
      const eintraege = alle(h, /<li( hidden)?><a class="pv-nav__sublink" href="[^"]*quickstart-(?:ki|ai)\.html"/g)
      expect(eintraege).toHaveLength(2)
      for (const e of eintraege) expect(e[1]).toBe(' hidden')
      expect(h.split(KOMMENTAR).length - 1).toBeGreaterThanOrEqual(2)
    })
    it(`${p}: Quickstart-Karten (falls vorhanden) tragen hidden`, () => {
      const karten = alle(lies(p), /<li( hidden)?>\s*<div class="pv-card">\s*<h3 class="pv-card__title"><a class="pv-card__link" href="[^"]*quickstart-(?:ki|ai)\.html">/g)
      for (const k of karten) expect(k[1]).toBe(' hidden')
    })
  }
  it('Startseiten DE/EN: drei sichtbare Leistungskarten, Quickstart-Karte bleibt im HTML', () => {
    for (const p of ['index.html', 'en/index.html']) {
      const h = lies(p)
      expect(alle(h, /<li>\s*<div class="pv-card">/g), p).toHaveLength(3)
      expect(alle(h, /<li hidden>\s*<div class="pv-card">/g), p).toHaveLength(1)
    }
  })
  it('Seiten und Inhalte von Quickstart bestehen weiter', () => {
    expect(existsSync('leistungen/quickstart-ki.html')).toBe(true)
    expect(existsSync('en/services/quickstart-ai.html')).toBe(true)
  })
  it('CSS: hidden schlägt display, Raster mit ausgeblendeter Leistung 3 bzw. 2 Spalten über die volle Breite', () => {
    expect(css('base')).toMatch(/\[hidden\]\s*\{\s*display:\s*none !important/)
    const c = css('components')
    expect(c).toMatch(/\.pv-cards:has\(> li\[hidden\]\)\s*\{\s*grid-template-columns:\s*repeat\(3, 1fr\)/)
    expect(c).toMatch(/\.pv-related:has\(> li\[hidden\]\)\s*\{\s*grid-template-columns:\s*repeat\(2, 1fr\)/)
  })
})

describe('Mobil: kein Knowledge Graph', () => {
  it('CSS blendet den Graph unter 760 px aus und nimmt Bühne/Seitenkopf die Mindesthöhe', () => {
    const c = css('components')
    expect(c).toMatch(/@media \(max-width: 759px\)\s*\{\s*\.pv-kg\s*\{\s*display:\s*none/s)
    expect(c).toMatch(/\.pv-hero:has\(> \.pv-kg\),\s*\.pv-pagehead:has\(> \.pv-kg\)\s*\{\s*min-height:\s*0/s)
  })
  it('kg.js rechnet und animiert nicht, solange der Graph ausgeblendet ist', () => {
    const js = lies('js/kg.js')
    expect(js).toContain('const sichtbar = () => cv.offsetWidth > 0')
    expect(js).toContain('imBild: imBild && sichtbar()')
    expect(js).toContain('if (sichtbar()) { aufbauen(); zeichnen(0) }')
  })
})

describe('Bühne der Leistungsseiten (Mockup N)', () => {
  it('ab 760 px: Text vertikal mittig, Bühne 440 px', () => {
    expect(css('components')).toMatch(/@media \(min-width: 760px\)\s*\{\s*\.pv-pagehead--leistung\s*\{\s*align-items:\s*center;\s*min-height:\s*440px/s)
  })
})
