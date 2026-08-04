# Pivon — Content Integration & DE/EN Toggle

**Date:** 2026-08-04 · **Status:** approved, ready to plan
**Target:** `index.html` (single portable static file, no build step)
**Source content:** `content-texte.md`

---

## 1. What this does

`content-texte.md` holds German website copy extracted from an older Next.js
project whose section structure (Leistungen / Vorgehen / Unser Anspruch / Über
uns / Kontakt) does not match the live page (SEC.00–SEC.08, the "F1 Flagship"
design). This work folds that German copy into the live page **without changing
its structure or design**, and adds a DE/EN toggle so both languages ship.

German is the default language. English is the translated counterpart of
whatever German ends up on the page.

### Decisions taken

| Question | Decision |
|---|---|
| Language | Both — DE default, EN via toggle |
| Structure | Live page's SEC.00–08 kept intact; German copy remapped into it |
| Service depth | Expandable detail panel per quadrant cell |
| Toggle mechanism | `data-i18n` keys + inline JS dictionary, one file |
| Contact details | `kontakt@pivon.ai` everywhere; phone number **not** published |
| Legal | Footer links to `impressum.html` / `datenschutz.html`; pages not built this pass |
| Hero words | `DENKEN → PLANEN → BAUEN → 0→100` (DE) / unchanged (EN) |

### Out of scope

- Creating `impressum.html` and `datenschutz.html`. The footer links to them; they will 404 until built.
- A contact form. Booking stays a `mailto:` CTA, so the doc's form fields go unused.
- Publishing the phone number `+49 151 99 99 788`.
- Any change to the visual design system: tokens, layout, instruments, and animations are untouched except for the additive elements listed in §4.

---

## 2. i18n architecture

### 2.1 Storage

A single object inlined in the existing `<script>` block, above the IIFE:

```js
const I18N = {
  de: { 'hero.h1': '…', 's01.beratung.title': '…', … },
  en: { 'hero.h1': '…', 's01.beratung.title': '…', … }
};
```

Keys are namespaced by section: `nav.*`, `hero.*`, `s00.*` … `s08.*`, `foot.*`.
No external file and no `fetch` — the page must keep working over `file://`.

### 2.2 Binding

Three forms, because the existing markup needs all three:

- **`data-i18n="key"`** — sets `innerHTML`. Required, not optional: many strings
  carry inline markup (`<span class="hl">`, `<b>` gradient spans, `<br>`).
  Values are author-written constants in the same file, so `innerHTML` adds no
  injection surface. Any key whose value contains markup is flagged in the key
  inventory.
- **`data-i18n-attr="placeholder:key;aria-label:key"`** — semicolon-separated
  `attribute:key` pairs.
- **Document-level, handled in code, not markup** — `<html lang>`,
  `<title>`, `<meta name="description">`.

### 2.3 JS-owned strings

Three string sets currently live inside the script closure and must read from
the dictionary instead:

- `WORDS` — the four particle words.
- `CAPS` — the four hero captions (contain `<b>` markup).
- The assembly status line in SEC.03.

On language switch the code re-reads all three and calls `assign(cur)` so the
particle field re-samples the new word. The morph must survive a switch that
happens mid-scroll while the hero is pinned.

### 2.4 Control

A `DE / EN` segmented toggle in the nav bar, styled to match `.nav-l`: mono,
`.72rem`, hairline border, active half filled with `var(--grad)`. It sits in
`.nav-in` **outside** `.nav-l`, because `.nav-l` is `display:none` below 760px
and the toggle must stay reachable on mobile.

Resolution order on load:

1. `?lang=de|en` query parameter
2. `localStorage.getItem('pivon.lang')`
3. `de` (default)

The German strings are rendered directly into the served markup, so the default
language needs no JS and there is no flash of English. Switching writes
`localStorage` and updates the query parameter via `history.replaceState`.

### 2.5 Known breakage points

These are the three ways this change can break the page. Each needs explicit
handling and explicit verification.

1. **ScrollTrigger offsets.** Expanding a `.q-detail` panel changes document
   height, invalidating the pin offsets of both the hero (`#stage`, `+=2400`)
   and the assembly stage (`.asm-stage`, `+=2000`). Every panel expand/collapse
   **and** every language switch must call `ScrollTrigger.refresh()`.
2. **Reduced-motion early return.** The IIFE returns early when
   `prefers-reduced-motion: reduce` matches. i18n initialisation must run
   **before** that return, or reduced-motion users get a page frozen in one
   language with a dead toggle.
3. **Key drift.** A dev-only assertion compares `Object.keys(I18N.de)` against
   `Object.keys(I18N.en)` and logs any symmetric difference, so a missed string
   surfaces as a console warning rather than as an English orphan in the German
   page.

### 2.6 Layout risk

German runs 20–30% longer than English. The tight spots, all of which are
verification targets rather than assumptions:

- `.steps` — four columns, drops to 2×2 below 820px.
- `.q-cell h3` — clamped to 2.3rem; "Startup Creator." and "Quickstart KI." are
  the long ones.
- `.sec-bar` — mono uppercase with `.16em` tracking wraps early.
- `.book .sun h2` — `max-width:12ch` inside a fixed-diameter circle.

---

## 3. Content mapping

Source markers: **[doc]** verbatim from `content-texte.md` · **[trans]**
existing English translated · **[new]** written because the doc leaves it blank.

### Nav

Five slots, ids unchanged, relabelled: `01 Leistungen` (`#services`),
`02 Vorgehen` (`#approach`), `03 Live-Aufbau` (`#build`), `04 Referenzen`
(`#work`), `07 Über uns` (`#team`). CTA `ERSTGESPRÄCH()` / `BOOK_CALL()`. The
brand link is the doc's "Startseite"; "Unser Anspruch" and "Kontakt" appear in
the footer nav, which is where the doc lists the full six items.

### Hero (`.stage`)

| Slot | Content | Source |
|---|---|---|
| `.meta` centre | `KI-BERATUNG & ENTWICKLUNG` (the doc's Badge) | [doc] |
| `h1` | `KI strategisch denken und pragmatisch umsetzen` — gradient span on "pragmatisch umsetzen" | [doc] |
| **new** `.sub` | `Wir helfen Ihnen Ihre Ideen mit messbarem Erfolg umzusetzen.` | [doc] |
| `.sticks` | three brand stickers, translated | [trans] |
| `WORDS` | `DENKEN` `PLANEN` `BAUEN` `0→100` | [new] |
| `CAPS` | four captions matching the words | [new] |
| `.hint` | scroll/cursor hint | [trans] |

The doc lists its five Traits under Hero *and* under Unser Anspruch. They go to
SEC.00 in full rather than being arbitrarily cut to three sticker slots.

### SEC.00 — Unser Anspruch (`id="anspruch"` added)

- `.big` — the doc's Anspruch text **[doc]**, retaining the `.hl` / `.hl2`
  paste-up highlights on *Mensch* · *Organisation* · *Technologie*.
- `.stamp` — `KEINE FOLIEN`.
- `.spec` three cells — mapped onto the Dreiklang: Mensch / Organisation /
  Technologie, one line of value copy each **[new]**.
- **new** — the sentence ends "Wir sind…" and runs into all five Traits as
  `.stick` chips **[doc]**. Reuses the existing sticker component; no new CSS.

### SEC.01 — Leistungen (`#services`)

- **new** intro paragraph above `.quad-wrap` — the doc's Titel and Beschreibung **[doc]**.
- Axis labels translated **[trans]**.
- Four cells, replotted so the scope × time axes stay honest:

| Cell | Service | Position | `in` / `out` |
|---|---|---|---|
| 1 | Beratung | ganzes Unternehmen / Wochen | from Kurzbeschreibung [doc] |
| 2 | Startup Creator | ganzes Unternehmen / ein Quartal | from Kurzbeschreibung [doc] |
| 3 | Quickstart KI | ein Workflow / Wochen | from Kurzbeschreibung [doc] |
| 4 | Entwicklung | ein Workflow / ein Quartal | from Kurzbeschreibung [doc] |

The `.co` coordinate readouts (`x=… y=…`) are recomputed to match each cell's
new quadrant position. The `S/01`–`S/04` sticker indexes follow the new order,
and the single gradient sticker (`.stick.g`, currently on cell 2) moves to
**Beratung**, which is the doc's lead service and the entry point to everything
else.

- **new** `.q-detail` panels, one per service, below the grid:

| Service | Panel content | Source |
|---|---|---|
| Beratung | full text + four sub-blocks (Ist-Soll-Analyse, Use Case, Tech Advisory, Executive Beratung), each with its paragraph and its keyword list as mono chips | [doc] |
| Quickstart KI | full text [doc] + three sub-blocks Mensch / Organisation / Technologie [new] | mixed |
| Entwicklung | full detail text | [new] |
| Startup Creator | full detail text | [new] |

Panel behaviour: cells become `<button>`-semantic toggles with
`aria-expanded` / `aria-controls`, keyboard operable, all collapsed on load, one
open at a time. Each panel ends with an "Erstgespräch vereinbaren →" CTA to
`#book`. Keyword chips reuse the existing `.pin` style. Expand and collapse both
call `ScrollTrigger.refresh()`.

### SEC.02 — Vorgehen (`#approach`)

Gauge unchanged. The four `.step` cards become the doc's four steps verbatim
**[doc]**: Kontakt / Auftragsklärung / Umsetzung / Übergabe, keeping the
`T+00 … T+100` labels. Step 1 carries `kontakt@pivon.ai` as a mono `mailto:`
link, as the doc specifies. No phone number.

### SEC.03 — Live-Aufbau (`#build`)

No doc counterpart. Status line, the chat exchange, the input placeholder and
the `60% resolved without a human` badge are translated **[trans]**.

### SEC.04 — Referenzen (`#work`)

No doc counterpart. The four illustrative cases and their metric labels
translated **[trans]**. The `illustrativ` sticker and the disclaimer stay
prominent — these are illustrative engagements, not client claims, and the
German must say so as plainly as the English does.

### SEC.05 — Zusammenarbeit

No doc counterpart. Translated **[trans]**. YAML keys (`mode:`, `in:`, `out:`,
`scope:`, `exit:`, `portable:`) stay English because they are code-styled;
values and the `#` comments translate. Durations become `2 WOCHEN`,
`6–10 WOCHEN`, `EIN QUARTAL`.

### SEC.06 — Haltung (POV)

No doc counterpart. Three takes translated **[trans]**. `CRIT` / `WARN` / `RULE`
badges unchanged — mono log tokens, not prose.

### SEC.07 — Über uns (`#team`)

The two real IC cards stay; names unchanged, roles and descriptions translated
**[trans]**. Lead line uses the second half of the doc's Über-uns text —
"Wir lernen uns am liebsten im persönlichen Gespräch kennen." **[doc]** — plus
its "Kontakt aufnehmen" CTA to `#book`.

The doc's "Ausführliche Informationen zu unserem Team folgen in Kürze" is
**dropped**: it contradicts the two named personnel cards directly beneath it.

### SEC.08 — Kontakt (`#book`)

- `.mono-line` — `$ pivon book --duration 30m --agenda "die ehrliche Version"`.
- `.sun h2` — `Lassen Sie uns sprechen.` **[doc]**
- `.sun p` — the doc's Kontakt Beschreibung **[doc]**
- CTA — `ERSTGESPRÄCH() →`, `mailto:kontakt@pivon.ai` with a German subject.
- `.base` footer expands to carry the doc's footer **[doc]**: the Claim, the
  five-item nav (Leistungen, Vorgehen, Unser Anspruch, Über uns, Kontakt),
  `kontakt@pivon.ai`, Impressum and Datenschutz links, the German copyright
  line, and the retained `CASES = ILLUSTRATIVE` disclaimer.

### Address change

`hello@pivon.ai` → `kontakt@pivon.ai` in all four places it appears: the two
`mailto:` hrefs and the two display strings.

### Deliberately unused doc content

The contact form fields and "Nachricht senden" button, the phone number, and the
"folgen in Kürze" placeholder. Recorded here so their absence reads as a
decision rather than an oversight.

---

## 4. Additive markup

The design is otherwise untouched. These are the only new elements:

1. Nav language toggle (`.lang`).
2. Hero subline (`.stage .head .sub`).
3. Five Trait chips in SEC.00, reusing `.stick`.
4. Intro paragraph in SEC.01.
5. Four `.q-detail` panels in SEC.01, reusing `.pin` for keyword chips.
6. `id="anspruch"` on SEC.00.
7. Expanded `.base` footer in SEC.08.

Each needs CSS consistent with the existing token set — `--mono` for labels,
`--line` hairlines, `--grad` for accents — and each must respect the existing
`prefers-reduced-motion` block.

---

## 5. Work split

Sub-agents, in three phases. Content agents never touch `index.html`; only the
integrator writes to it. This is what keeps parallel work from clobbering a
single 40 KB file.

**Phase 0 — key inventory (sequential).** Produce `keys.md`: every key, its
section, its source marker, and an inline-HTML flag. Every downstream agent
works from this list, so it must be complete before Phase 1 starts.

**Phase 1 — content, four agents in parallel.** Each writes one JSON fragment
to the scratchpad with both `de` and `en` values for its assigned keys:

| Agent | Scope |
|---|---|
| 1 | nav, hero, SEC.00, SEC.08 + footer |
| 2 | SEC.01 Leistungen — four cells and four detail panels (largest, most [new] copy) |
| 3 | SEC.02 Vorgehen, SEC.07 Über uns |
| 4 | SEC.03–SEC.06 — translation-only |

**Phase 2 — integration (sequential, one agent).** Merge the fragments into
`I18N`, annotate the markup with `data-i18n` / `data-i18n-attr`, render the
German strings inline as the default, add the seven elements from §4 with their
CSS, wire the switch engine and the JS-owned strings, and add the key-parity
assertion.

**Phase 3 — verification (sequential).** §6.

---

## 6. Verification

Evidence from the browser preview, not assertion. All of the following must pass
before the work is called done:

- [ ] Toggle switches every visible string; no English orphan in DE mode and no German orphan in EN mode.
- [ ] Key-parity assertion logs nothing.
- [ ] `<html lang>`, `<title>`, and `<meta name="description">` all swap.
- [ ] Choice survives reload via `localStorage`; `?lang=en` forces English on a cold load.
- [ ] Hero particle morph re-samples correctly when the language is switched mid-scroll with the hero pinned.
- [ ] Detail panels open and close by mouse and by keyboard; `aria-expanded` tracks state; pinned sections still align after several open/close cycles.
- [ ] `ScrollTrigger` pins for `#stage` and `.asm-stage` behave after both a panel toggle and a language switch.
- [ ] Reduced-motion path renders correctly and its toggle still works.
- [ ] No horizontal overflow and no clipped text at 375 / 768 / 1280 in **both** languages.
- [ ] Console clean of errors.
- [ ] Screenshots of both languages at desktop and mobile.
