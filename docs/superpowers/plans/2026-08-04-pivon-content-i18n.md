# Pivon Content Integration & DE/EN Toggle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fold the German copy in `content-texte.md` into `index.html` without changing its SEC.00–08 structure or design, and add a DE/EN toggle with German as the default.

**Architecture:** All copy moves into a single JSON dictionary embedded in `index.html` as `<script type="application/json" id="i18n-dict">`. Markup elements carry `data-i18n` keys; an inline engine swaps `innerHTML`, attributes, `<html lang>`, `<title>`, and `<meta description>`. German is rendered inline as the served default so there is no flash of English. A dependency-free Node test suite reads `index.html` as text and enforces key parity, key coverage, German-default rendering, and contact-detail rules.

**Tech Stack:** Vanilla HTML/CSS/JS, GSAP + ScrollTrigger (already present, via CDN), Node 24 built-in test runner (`node --test`), no npm dependencies, no build step.

**Spec:** `docs/superpowers/specs/2026-08-04-pivon-content-i18n-design.md`

## Deviations from the spec

Two, both flagged deliberately:

- **D1 — dictionary format.** Spec §2.1 says a JS object literal. This plan uses `<script type="application/json" id="i18n-dict">` instead. Every property the spec asked for is preserved (one file, no `fetch`, works over `file://`, no build step), and the dictionary becomes machine-checkable by a text-level test without an HTML parser or any npm dependency.
- **D2 — work split.** Spec §5 has four content agents producing fragments in parallel plus a separate integrator. This plan makes each section group a single sequential task owning both its copy and its markup. The anti-clobbering guarantee is the same — only one agent writes `index.html` at a time — and every task becomes independently testable and independently rejectable at review, which the fragment scheme did not allow.

## Global Constraints

- `index.html` stays a **single portable static file**. No `fetch`, no external data file, no build step. It must work opened directly from disk.
- **German is the default.** Every `data-i18n` element's inline content in the served markup is the German string, byte-identical to its `de` dictionary value.
- Dictionary values are written **exactly as they appear in the markup**, including HTML entities (`&amp;`, `&nbsp;`) and inline tags (`<b>`, `<span class="grad">`, `<br>`).
- No dictionary value may contain the literal `</script`.
- Contact address is `kontakt@pivon.ai`. `hello@pivon.ai` must not appear anywhere. The phone number `+49 151 99 99 788` must not appear anywhere.
- Illustrative work stays labelled illustrative in both languages. No client claims.
- Design tokens, layout, instruments and animations are untouched except the seven additive elements in spec §4.
- Every new element respects the existing `@media (prefers-reduced-motion:reduce)` block.
- Key naming: `nav.*`, `hero.*`, `s00.*`–`s08.*`, `foot.*`. Lowercase, dot-separated.
- Test command is always `npm test` (which runs `node --test "tests/**/*.test.mjs"`). Run it from `C:/DEV/pivon.ai/website`. Do **not** use `node --test tests/` — passing a bare directory misbehaves on Node 24 / Windows and reports a spurious failure.

---

### Task 1: Test harness and the i18n engine

Proves the whole mechanism end-to-end with a single key before any copy exists.

**Files:**
- Create: `package.json`
- Create: `tests/helpers.mjs`
- Create: `tests/i18n.test.mjs`
- Modify: `index.html` — `<head>` (title/meta), `nav` (`.nav-in`), `<style>` (toggle CSS), `<script>` (dictionary block + engine)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `tests/helpers.mjs` exports `html: string`, `dict(): {de:Record<string,string>, en:Record<string,string>}`, `markupKeys(): string[]`, `attrKeys(): string[]`.
  - `index.html` gains `<script type="application/json" id="i18n-dict">` and, inside the IIFE, `applyLang(lang: 'de'|'en'): void` plus `currentLang(): 'de'|'en'`.
  - Every later task adds keys to the dictionary and `data-i18n` attributes to markup.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "pivon-website",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test \"tests/**/*.test.mjs\""
  }
}
```

- [ ] **Step 2: Write the test helper**

Create `tests/helpers.mjs`:

```js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const html = readFileSync(join(root, 'index.html'), 'utf8');

/** Keys whose values live only in the dictionary (read by JS), never inline in markup. */
export const JS_OWNED = /^(hero\.word[1-4]|hero\.cap[1-4])$/;

export function dict() {
  const m = html.match(
    /<script type="application\/json" id="i18n-dict">([\s\S]*?)<\/script>/
  );
  if (!m) throw new Error('i18n-dict script block not found in index.html');
  return JSON.parse(m[1]);
}

export function markupKeys() {
  return [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
}

export function attrKeys() {
  const out = [];
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const pair of m[1].split(';').filter(Boolean)) {
      out.push(pair.split(':')[1]);
    }
  }
  return out;
}
```

- [ ] **Step 3: Write the failing tests**

Create `tests/i18n.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { dict, markupKeys, attrKeys, html, JS_OWNED } from './helpers.mjs';

test('dictionary block exists and parses', () => {
  const d = dict();
  assert.ok(d.de, 'missing de');
  assert.ok(d.en, 'missing en');
});

test('de and en have identical key sets', () => {
  const d = dict();
  const de = Object.keys(d.de).sort();
  const en = Object.keys(d.en).sort();
  assert.deepEqual(de, en);
});

test('no dictionary value is empty', () => {
  const d = dict();
  for (const lang of ['de', 'en']) {
    for (const [k, v] of Object.entries(d[lang])) {
      assert.ok(v.trim().length > 0, `${lang}.${k} is empty`);
    }
  }
});

test('no dictionary value contains a closing script tag', () => {
  const d = dict();
  for (const lang of ['de', 'en']) {
    for (const [k, v] of Object.entries(d[lang])) {
      assert.ok(!v.includes('</script'), `${lang}.${k} contains </script`);
    }
  }
});

test('every key used in markup exists in both languages', () => {
  const d = dict();
  for (const k of [...markupKeys(), ...attrKeys()]) {
    assert.ok(k in d.de, `de is missing ${k}`);
    assert.ok(k in d.en, `en is missing ${k}`);
  }
});

test('german is rendered inline as the default', () => {
  const d = dict();
  for (const k of markupKeys()) {
    if (JS_OWNED.test(k)) continue;
    assert.ok(
      html.includes(d.de[k]),
      `de.${k} is not rendered inline in the markup: ${d.de[k]}`
    );
  }
});

test('document defaults to german', () => {
  assert.match(html, /<html lang="de">/);
});

test('contact address is kontakt@pivon.ai only', () => {
  assert.ok(!html.includes('hello@pivon.ai'), 'hello@pivon.ai still present');
  assert.ok(html.includes('kontakt@pivon.ai'), 'kontakt@pivon.ai missing');
});

test('phone number is not published', () => {
  assert.ok(!/\+49\s*151/.test(html), 'phone number present');
});
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `i18n-dict script block not found in index.html`, and the `kontakt@pivon.ai` / `<html lang="de">` assertions fail too.

- [ ] **Step 5: Add the dictionary block and the engine to `index.html`**

Change `<html lang="en">` to `<html lang="de">` (line 2).

Insert immediately before the closing `</body>`'s `<script>` block — i.e. directly after the GSAP `<script src>` tags at lines 415–416, before the existing `<script>`:

```html
<script type="application/json" id="i18n-dict">
{
  "de": { "nav.cta": "ERSTGESPR\u00c4CH()" },
  "en": { "nav.cta": "BOOK_CALL()" }
}
</script>
```

Then, at the **very top of the existing IIFE** — above the `const RM=` line, so it runs before the reduced-motion early return:

```js
  /* ── i18n ─────────────────────────────────────────────── */
  const I18N=JSON.parse(document.getElementById('i18n-dict').textContent);
  const DOC={
    de:{title:'pivon | KI strategisch denken, pragmatisch umsetzen',
        desc:'pivon ber\u00e4t und begleitet Sie ganzheitlich bei der Einf\u00fchrung und Entwicklung von KI-L\u00f6sungen \u2013 menschenzentriert, transparent und praxisorientiert.'},
    en:{title:'Pivon | Think AI strategically, ship it pragmatically',
        desc:'Pivon consults on and delivers AI solutions end to end \u2014 human-centred, transparent, and grounded in practice.'}
  };
  let LANG='de';
  let onLangChange=null;   /* Task 3 assigns this once the hero is initialised */
  function currentLang(){return LANG;}
  function applyLang(lang){
    if(!I18N[lang])return;
    LANG=lang;
    const t=I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const v=t[el.dataset.i18n];
      if(v!=null)el.innerHTML=v;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      el.dataset.i18nAttr.split(';').filter(Boolean).forEach(pair=>{
        const [attr,key]=pair.split(':');
        if(t[key]!=null)el.setAttribute(attr,t[key]);
      });
    });
    document.documentElement.lang=lang;
    document.title=DOC[lang].title;
    const md=document.querySelector('meta[name="description"]');
    if(md)md.setAttribute('content',DOC[lang].desc);
    document.querySelectorAll('.lang button').forEach(b=>
      b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));
    try{localStorage.setItem('pivon.lang',lang);}catch(e){}
    const u=new URL(location.href);
    u.searchParams.set('lang',lang);
    history.replaceState(null,'',u);
    if(onLangChange)onLangChange();
    if(window.ScrollTrigger)ScrollTrigger.refresh();
  }
  (function initLang(){
    const q=new URL(location.href).searchParams.get('lang');
    let stored=null;
    try{stored=localStorage.getItem('pivon.lang');}catch(e){}
    const want=(q==='de'||q==='en')?q:((stored==='de'||stored==='en')?stored:'de');
    document.querySelectorAll('.lang button').forEach(b=>
      b.addEventListener('click',()=>applyLang(b.dataset.lang)));
    applyLang(want);
  })();
```

Note the dev-only parity warning, appended right after `initLang`:

```js
  (function checkKeys(){
    const de=Object.keys(I18N.de),en=Object.keys(I18N.en);
    const miss=[...de.filter(k=>!(k in I18N.en)).map(k=>'en:'+k),
                ...en.filter(k=>!(k in I18N.de)).map(k=>'de:'+k)];
    if(miss.length)console.warn('[i18n] key drift:',miss);
  })();
```

- [ ] **Step 6: Add the toggle markup and CSS**

In `.nav-in`, between `.nav-l` and the CTA link:

```html
      <div class="lang" role="group" aria-label="Sprache / Language">
        <button type="button" data-lang="de" aria-pressed="true">DE</button>
        <button type="button" data-lang="en" aria-pressed="false">EN</button>
      </div>
```

Add the CTA key: `<a href="#book" class="cta" data-i18n="nav.cta">ERSTGESPRÄCH()</a>`

CSS, appended after the `.cta:hover` rule in the nav block:

```css
.lang{display:flex;border:1px solid var(--line);border-radius:6px;overflow:hidden;margin-left:auto;margin-right:1rem}
.lang button{font-family:var(--mono);font-size:.7rem;letter-spacing:.08em;background:transparent;color:var(--mist);
  border:0;padding:.45em .7em;cursor:pointer;line-height:1}
.lang button[aria-pressed="true"]{background:var(--grad);color:#fff}
@media(max-width:760px){.lang{margin-left:0}}
```

- [ ] **Step 7: Sweep the contact address**

Replace every occurrence of `hello@pivon.ai` in `index.html` with `kontakt@pivon.ai`. There are four: the booking CTA's `mailto:` href (~line 404), the footer link's href and its display text (~line 409), and any remaining display string. Verify none are left:

```bash
grep -c "hello@pivon.ai" index.html
```

Expected: `0`.

- [ ] **Step 8: Run the tests to verify they pass**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 9: Commit**

```bash
git add package.json tests index.html && git commit -m "feat: add i18n engine, DE/EN toggle, and test harness"
```

---

### Task 2: Key inventory

The single list every later task works from. Written as JSON so the test suite can enforce it.

**Files:**
- Create: `tests/fixtures/key-inventory.json`
- Modify: `tests/i18n.test.mjs`
- Modify: `tests/helpers.mjs`

**Interfaces:**
- Consumes: `dict()` from Task 1.
- Produces: `inventory()` in `tests/helpers.mjs` returning `{ [key: string]: { section: string, source: 'doc'|'trans'|'new', html: boolean } }`. Later tasks assert their own section's keys against it.

- [ ] **Step 1: Write the inventory fixture**

Create `tests/fixtures/key-inventory.json`. Enumerate every key the design needs, one entry each, using the section mapping in spec §3. `source` records where the copy comes from (`doc` = verbatim from `content-texte.md`, `trans` = existing English translated, `new` = written fresh); `html` marks values carrying inline markup.

The full key set, by section:

- **nav** — `nav.brandv`, `nav.01`, `nav.02`, `nav.03`, `nav.04`, `nav.07`, `nav.cta`
- **hero** — `hero.meta.l`, `hero.meta.m`, `hero.meta.r`, `hero.h1` *(html)*, `hero.sub`, `hero.stick1`, `hero.stick2`, `hero.stick3`, `hero.hint`, `hero.word1`–`hero.word4`, `hero.cap1`–`hero.cap4` *(html)*
- **s00** — `s00.bar.l` *(html)*, `s00.bar.r` *(html)*, `s00.big` *(html)*, `s00.stamp`, `s00.spec1.k`, `s00.spec1.v`, `s00.spec2.k`, `s00.spec2.v`, `s00.spec3.k`, `s00.spec3.v`, `s00.trait1`–`s00.trait5`
- **s01** — `s01.bar.l` *(html)*, `s01.bar.r` *(html)*, `s01.intro` *(html)*, `s01.ax.n`, `s01.ax.s`, `s01.ax.w`, `s01.ax.e`; per cell `n` = 1..4: `s01.c{n}.title`, `s01.c{n}.in`, `s01.c{n}.out`; per panel `n` = 1..4: `s01.d{n}.title`, `s01.d{n}.lead`, `s01.d{n}.cta`, and per block `b` (4 blocks for panel 1, 3 for panels 2–4): `s01.d{n}.b{b}.title`, `s01.d{n}.b{b}.text`, `s01.d{n}.b{b}.keys`
- **s02** — `s02.bar.l` *(html)*, `s02.bar.r` *(html)*; per step `n` = 1..4: `s02.s{n}.title`, `s02.s{n}.text` *(step 1's is html — it contains the mailto link)*
- **s03** — `s03.bar.l` *(html)*, `s03.bar.r` *(html)*, `s03.status.pre`, `s03.status.post`, `s03.chrome`, `s03.msg`, `s03.reply` *(html)*, `s03.input`, `s03.badge` *(html)*
- **s04** — `s04.bar.l` *(html)*, `s04.bar.r` *(html)*, `s04.sticker`, `s04.disc`; per row `n` = 1..4: `s04.r{n}.title`, `s04.r{n}.k`
- **s05** — `s05.bar.l` *(html)*, `s05.bar.r` *(html)*, `s05.note`; per file `n` = 1..3: `s05.f{n}.name`, `s05.f{n}.dur`, `s05.f{n}.body` *(html)*
- **s06** — `s06.bar.l` *(html)*, `s06.bar.r` *(html)*, `s06.t1`–`s06.t3` *(html)*
- **s07** — `s07.bar.l` *(html)*, `s07.bar.r` *(html)*, `s07.lead`, `s07.cta`, `s07.a.role`, `s07.a.bio`, `s07.a.pin1`–`s07.a.pin4`, `s07.b.role`, `s07.b.bio`, `s07.b.pin1`–`s07.b.pin4`
- **s08** — `s08.bar.l` *(html)*, `s08.bar.r` *(html)*, `s08.mono` *(html)*, `s08.h2`, `s08.p`, `s08.cta`, `s08.cta.subject` *(attribute key)*
- **foot** — `foot.claim`, `foot.nav1`–`foot.nav5`, `foot.mail`, `foot.impressum`, `foot.datenschutz`, `foot.copy`, `foot.disc`

Shape:

```json
{
  "nav.cta":   { "section": "nav",  "source": "trans", "html": false },
  "hero.h1":   { "section": "hero", "source": "doc",   "html": true  },
  "s00.trait1":{ "section": "s00",  "source": "doc",   "html": false }
}
```

- [ ] **Step 2: Add the inventory accessor to `tests/helpers.mjs`**

```js
export function inventory() {
  return JSON.parse(
    readFileSync(join(root, 'tests/fixtures/key-inventory.json'), 'utf8')
  );
}

/** Assert every inventory key for one section is present, non-empty, in both languages. */
export function assertSection(assert, d, section) {
  const keys = Object.entries(inventory())
    .filter(([, meta]) => meta.section === section)
    .map(([k]) => k);
  assert.ok(keys.length > 0, `inventory has no keys for section ${section}`);
  for (const k of keys) {
    assert.ok(k in d.de && d.de[k].trim(), `de.${k} missing or empty`);
    assert.ok(k in d.en && d.en[k].trim(), `en.${k} missing or empty`);
  }
}
```

- [ ] **Step 3: Write the failing test**

Append to `tests/i18n.test.mjs`:

```js
import { inventory } from './helpers.mjs';

test('inventory keys are unique and well-formed', () => {
  const inv = inventory();
  for (const [k, meta] of Object.entries(inv)) {
    assert.match(k, /^[a-z0-9]+(\.[a-z0-9]+)+$/, `bad key name: ${k}`);
    assert.ok(['doc', 'trans', 'new'].includes(meta.source), `bad source on ${k}`);
    assert.equal(typeof meta.html, 'boolean', `bad html flag on ${k}`);
    assert.ok(meta.section, `missing section on ${k}`);
  }
});

test('the dictionary introduces no key outside the inventory', () => {
  const inv = inventory();
  for (const k of Object.keys(dict().de)) {
    assert.ok(k in inv, `${k} is in the dictionary but not the inventory`);
  }
});
```

- [ ] **Step 4: Run the tests**

```bash
npm test
```

Expected: PASS. `nav.cta` from Task 1 is in the inventory; nothing else is in the dictionary yet.

- [ ] **Step 5: Commit**

```bash
git add tests && git commit -m "test: add i18n key inventory fixture and coverage checks"
```

---

### Task 3: Nav and hero

**Files:**
- Modify: `index.html` — `nav` (lines ~263–271), `header.stage` (lines ~274–291), `<style>` (`.stage .head .sub`), `<script>` (`WORDS`, `CAPS`, `setWord`)
- Modify: `tests/sections.test.mjs` (create)

**Interfaces:**
- Consumes: `applyLang`, `I18N`, `assertSection` from Tasks 1–2.
- Produces: `WORDS` and `CAPS` read from the dictionary; `applyLang` additionally calls `refreshHeroWords()` so the particle field re-samples on switch.

**Copy sources.** `content-texte.md` lines 18–24 (Badge, Headline, Subline) and line 30 (nav items). `hero.word1`–`4` are `DENKEN`, `PLANEN`, `BAUEN`, `0→100` (EN: `CONSULT`, `DESIGN`, `BUILD`, `0→100`). `hero.cap1`–`4` are new German captions; EN keeps the four strings currently in `CAPS` verbatim:

```
de cap1: zuerst <b>denken</b> — wo Sie stehen, und was sich wirklich lohnt
de cap2: dann <b>planen</b> — Use Cases bewertet, priorisiert und kalkuliert
de cap3: dann <b>bauen</b> — in Ihren Stack integriert und im Betrieb bewährt
de cap4: bis Sie bei <b>100</b> sind — und ohne uns weitermachen
```

Nav labels: `Leistungen`, `Vorgehen`, `Live-Aufbau`, `Referenzen`, `Über uns` (EN: `Services`, `Approach`, `Build`, `Work`, `Team`). `nav.brandv`: `v3.0 / KI-BERATUNG` (EN `v3.0 / AI CONSULTING`). Hero meta: `DOK / PIVON · REV 3.0` / `KI-BERATUNG &amp; ENTWICKLUNG` / `SEIT 2026`. Stickers translated: `zwei Gründer`, `keine Folien`, `seit 2026`.

- [ ] **Step 1: Write the failing test**

Create `tests/sections.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { dict, assertSection, html } from './helpers.mjs';

test('nav section is complete', () => assertSection(assert, dict(), 'nav'));
test('hero section is complete', () => assertSection(assert, dict(), 'hero'));

test('hero words and captions are read from the dictionary, not hardcoded', () => {
  assert.ok(!/const WORDS=\['CONSULT'/.test(html), 'WORDS is still hardcoded');
  assert.ok(!/'first we <b>consult<\/b>/.test(html), 'CAPS is still hardcoded');
});

test('hero headline is the german one from content-texte.md', () => {
  assert.match(dict().de['hero.h1'], /KI strategisch denken/);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.nav.01 missing or empty`, `WORDS is still hardcoded`.

- [ ] **Step 3: Add the nav and hero keys to the dictionary**

Add all `nav.*` and `hero.*` entries to both `de` and `en` in the `i18n-dict` block, matching the inventory exactly.

- [ ] **Step 4: Annotate the markup and add the subline**

Nav links get `data-i18n="nav.01"` … `nav.07`; the brand version span gets `data-i18n="nav.brandv"`. Hero `.meta` spans get `hero.meta.l/m/r`; `h1` gets `hero.h1`; the three `.stick` spans get `hero.stick1/2/3`; `.hint` gets `hero.hint`. All inline content is replaced with the German string.

New subline element, inside `.head` directly after the `h1`:

```html
    <p class="sub" data-i18n="hero.sub">Wir helfen Ihnen Ihre Ideen mit messbarem Erfolg umzusetzen.</p>
```

CSS, appended after the `.stage .head h1` rule:

```css
.stage .head .sub{font-size:clamp(.92rem,1.7vw,1.05rem);color:var(--slate);margin:.9rem auto 0;max-width:44ch}
```

- [ ] **Step 5: Wire the JS-owned strings**

**Ordering matters here.** `applyLang` runs during `initLang` at the very top of the IIFE, before the hero's `W`, `H`, `cur` and `cap` bindings exist. Reaching them from `applyLang` — even behind a `typeof` guard — throws `ReferenceError`, because `typeof` does not protect against the temporal dead zone of a `let`/`const` that is declared later in the same scope. The engine therefore calls the `onLangChange` hook from Task 1, and Task 3 assigns that hook only once the hero is live.

Replace the hardcoded `const WORDS=[…]` and `const CAPS=[…]` with mutable bindings declared alongside the existing hero state. Move the existing `let cur=0` into this declaration so there is exactly one:

```js
  let WORDS=[],CAPS=[];
  function refreshHeroWords(){
    const t=I18N[currentLang()];
    WORDS=[t['hero.word1'],t['hero.word2'],t['hero.word3'],t['hero.word4']];
    CAPS=[t['hero.cap1'],t['hero.cap2'],t['hero.cap3'],t['hero.cap4']];
    const c=document.getElementById('wordCap');
    if(c)c.innerHTML=CAPS[cur];
  }
```

`refreshHeroWords` reads `#wordCap` via `getElementById` rather than closing over the later `const cap`, for the same TDZ reason.

Then, inside the existing `document.fonts.ready.then(...)` callback — the point at which the hero is fully initialised — populate the arrays, build the targets, and only then arm the hook:

```js
  document.fonts.ready.then(()=>{
    refreshHeroWords();
    buildTargets();
    frame();
    onLangChange=()=>{refreshHeroWords();buildTargets();};
  });
```

`buildTargets()` re-samples the particle targets for the new words and calls `assign(cur)` internally, so a mid-scroll switch picks up the new word without losing scroll position. Because the hook is armed last, the `applyLang` call during `initLang` is a no-op for the hero — which is correct, since `refreshHeroWords` runs a moment later with the language already resolved.

- [ ] **Step 6: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html tests && git commit -m "feat: german nav and hero copy with DE/EN keys"
```

---

### Task 4: SEC.00 — Unser Anspruch

**Files:**
- Modify: `index.html` — `section.sec.pos` (lines ~293–302), `<style>` (`.pos .traits`)
- Modify: `tests/sections.test.mjs`

**Interfaces:**
- Consumes: `assertSection`.
- Produces: `id="anspruch"` on the SEC.00 section, referenced by Task 10's footer nav.

**Copy sources.** `content-texte.md` lines 107–112 (Titel, Text, Traits). The `.big` paragraph is the doc's Anspruch text with `.hl` on *Mensch*, `.hl2` on *Organisation*, and a `<b>` gradient span on *Technologie*, ending in "Wir sind…". The three `.spec` cells are new:

```
Mensch        — Kompetenzen, Mindset und Akzeptanz: KI wirkt erst, wenn Menschen sie nutzen.
Organisation  — Prozesse, Governance und Datenbasis: der Rahmen, in dem KI tragfähig wird.
Technologie   — Architektur, Modelle und Integration: ohne Bindung an einen Anbieter.
```

Stamp: `KEINE FOLIEN` (EN `NO SLIDEWARE`). Traits verbatim from line 112.

- [ ] **Step 1: Write the failing test**

Append to `tests/sections.test.mjs`:

```js
test('s00 section is complete', () => assertSection(assert, dict(), 's00'));

test('s00 carries all five traits from content-texte.md', () => {
  const d = dict().de;
  const traits = [1, 2, 3, 4, 5].map((n) => d[`s00.trait${n}`]);
  assert.deepEqual(traits, [
    'menschenzentriert', 'transparent', 'flexibel',
    'technologieunabhängig', 'praxisorientiert'
  ]);
});

test('s00 has an anchor id for the footer nav', () => {
  assert.match(html, /<section class="sec pos reveal" id="anspruch">/);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s00.big missing or empty`.

- [ ] **Step 3: Add the `s00.*` keys to the dictionary**

- [ ] **Step 4: Annotate the markup and add the trait chips**

Add `id="anspruch"` to the section. Annotate `.sec-bar` spans, `.big`, `.stamp`, and the six `.spec` key/value nodes. Then, directly after the `.spec` grid:

```html
  <div class="traits">
    <span class="stick" data-i18n="s00.trait1">menschenzentriert</span>
    <span class="stick" data-i18n="s00.trait2">transparent</span>
    <span class="stick g" data-i18n="s00.trait3">flexibel</span>
    <span class="stick" data-i18n="s00.trait4">technologieunabhängig</span>
    <span class="stick" data-i18n="s00.trait5">praxisorientiert</span>
  </div>
```

CSS, appended after the `.spec` rules:

```css
.pos .traits{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}
.pos .traits .stick:nth-child(odd){transform:rotate(-1.5deg)}
.pos .traits .stick:nth-child(even){transform:rotate(1.5deg)}
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: SEC.00 Unser Anspruch with Dreiklang spec cells and traits"
```

---

### Task 5: SEC.01 — Leistungen quadrant

Cells only. The detail panels are Task 6.

**Files:**
- Modify: `index.html` — `section#services` (lines ~304–320)
- Modify: `tests/sections.test.mjs`

**Interfaces:**
- Consumes: `assertSection`.
- Produces: cells carry `data-panel="1".."4"`, consumed by Task 6's toggle wiring.

**Copy sources.** `content-texte.md` lines 38–40 (Titel + Beschreibung → `s01.intro`), 43, 65, 73, 78 (the four Kurzbeschreibungen → the `in`/`out` lines).

**Replot.** DOM order maps to quadrant position: cell 1 top-left, 2 top-right, 3 bottom-left, 4 bottom-right, against axes `n = ganzes Unternehmen`, `s = ein Workflow`, `w = Wochen`, `e = ein Quartal`.

| Cell | Service | Position | `.co` readout | sticker |
|---|---|---|---|---|
| 1 | Beratung | ganzes Unternehmen / Wochen | `x=.22 y=.84` | `S/01` **gradient** |
| 2 | Startup Creator | ganzes Unternehmen / ein Quartal | `x=.86 y=.91` | `S/04` |
| 3 | Quickstart KI | ein Workflow / Wochen | `x=.18 y=.42` | `S/02` |
| 4 | Entwicklung | ein Workflow / ein Quartal | `x=.74 y=.47` | `S/03` |

The `.stick.g` class moves from cell 2 to cell 1.

- [ ] **Step 1: Write the failing test**

```js
test('s01 quadrant cells are complete', () => {
  const d = dict();
  for (const n of [1, 2, 3, 4]) {
    for (const part of ['title', 'in', 'out']) {
      const k = `s01.c${n}.${part}`;
      assert.ok(d.de[k]?.trim(), `de.${k} missing`);
      assert.ok(d.en[k]?.trim(), `en.${k} missing`);
    }
  }
});

test('s01 cells are plotted in the documented order', () => {
  const d = dict().de;
  assert.match(d['s01.c1.title'], /Beratung/);
  assert.match(d['s01.c2.title'], /Startup/);
  assert.match(d['s01.c3.title'], /Quickstart/);
  assert.match(d['s01.c4.title'], /Entwicklung/);
});

test('the gradient sticker sits on Beratung', () => {
  const cells = html.split('<a class="q-cell"');
  assert.match(cells[1], /stick g/, 'cell 1 has no gradient sticker');
  assert.ok(!/stick g/.test(cells[2]), 'cell 2 still has the gradient sticker');
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s01.c1.title missing`.

- [ ] **Step 3: Add the `s01` cell, axis, bar and intro keys to the dictionary**

- [ ] **Step 4: Rewrite the quadrant markup**

Reorder the four `.q-cell` anchors per the table, update each `.co` readout and `.six` sticker label, move `stick g` to cell 1, annotate `h3` / `in` / `out` with `data-i18n`, add `data-panel="1".."4"`, and translate the four `.ax` labels. Insert the intro paragraph between the `.sec-bar` and `.quad-wrap`:

```html
  <p class="lead" data-i18n="s01.intro">…</p>
```

CSS, appended to the SEC.01 block:

```css
.sec .lead{max-width:60ch;color:var(--slate);margin:0 0 .6rem}
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: SEC.01 quadrant replotted to the four Leistungen"
```

---

### Task 6: SEC.01 — service detail panels

**Files:**
- Modify: `index.html` — `section#services`, `<style>` (`.q-detail`), `<script>` (panel toggle)
- Modify: `tests/sections.test.mjs`

**Interfaces:**
- Consumes: `data-panel` from Task 5, `applyLang` from Task 1.
- Produces: nothing later tasks depend on.

**Copy sources.** Panel 1 (Beratung) is verbatim from `content-texte.md` lines 45–62 — the lead text plus four blocks (Ist-Soll Analyse, Use Case, Tech Advisory, Executive Beratung), each with its paragraph and its comma-separated keyword list. Panel 3 (Quickstart KI) uses the lead from lines 67–68; its three blocks are new. Panels 2 and 4 (Startup Creator, Entwicklung) are new in full. Drafts:

```
Entwicklung — lead:
Ein Prototyp beeindruckt, ein System trägt. Wir entwickeln KI-Lösungen, die in
Ihre bestehende Landschaft passen, im Betrieb messbar bleiben und von Ihrem Team
weitergeführt werden können.
  Architektur & Umsetzung — Software Architektur, LLM & RAG, Integrationen, Datenpipelines
  Qualität & Betrieb      — Evaluation, Monitoring, Kostenkontrolle, Sicherheit
  Übergabe                — Dokumentation, Schulung, Quellcode, kein Lock-in

Startup Creator — lead:
Aus einer Idee wird kein Unternehmen, weil die Technologie funktioniert, sondern
weil jemand dafür zahlt. Wir begleiten den Weg von der Idee zum tragfähigen
KI-Geschäftsmodell — technisch und unternehmerisch.
  Idee & Markt        — Problemverständnis, Zielgruppe, Wettbewerb, Wertversprechen
  Produkt & Prototyp  — MVP, Nutzerfeedback, Technologiewahl, Time-to-Market
  Geschäftsmodell     — Erlösmodell, Kostenstruktur, Skalierung, Finanzierungsreife

Quickstart KI — blocks:
  Mensch       — Grundlagenwissen, Prompting, Anwendungsfälle im Alltag, Umgang mit Grenzen
  Organisation — Leitplanken, Rollen, Datenschutz, Freigabeprozesse
  Technologie  — Werkzeugauswahl, Schnittstellen, Datenzugriff, Betriebsmodell
```

Each block's `text` is two or three sentences in the same register as the doc — direct address ("Sie"), no superlatives, no client claims.

- [ ] **Step 1: Write the failing test**

```js
test('s01 detail panels are complete', () => {
  const d = dict();
  const blocks = { 1: 4, 2: 3, 3: 3, 4: 3 };
  for (const [n, count] of Object.entries(blocks)) {
    for (const part of ['title', 'lead', 'cta']) {
      assert.ok(d.de[`s01.d${n}.${part}`]?.trim(), `de.s01.d${n}.${part} missing`);
    }
    for (let b = 1; b <= count; b++) {
      for (const part of ['title', 'text', 'keys']) {
        const k = `s01.d${n}.b${b}.${part}`;
        assert.ok(d.de[k]?.trim(), `de.${k} missing`);
        assert.ok(d.en[k]?.trim(), `en.${k} missing`);
      }
    }
  }
});

test('Beratung panel carries the doc text verbatim', () => {
  assert.match(dict().de['s01.d1.lead'], /Dreiklang aus Mensch, Organisation und Technologie/);
});

test('panels are collapsed and accessible by default', () => {
  const panels = [...html.matchAll(/<div class="q-detail"[^>]*>/g)];
  assert.equal(panels.length, 4, 'expected four detail panels');
  for (const p of panels) assert.match(p[0], /hidden/, 'panel is not hidden by default');
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 4);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `expected four detail panels`.

- [ ] **Step 3: Add the panel keys to the dictionary**

- [ ] **Step 4: Add the panel markup**

Each `.q-cell` becomes a toggle. Change `<a class="q-cell" href="#book">` to `<button type="button" class="q-cell" data-panel="1" aria-expanded="false" aria-controls="qd1">` (and `</a>` to `</button>`); add `text-align:left;background:none;border:0;font:inherit;color:inherit;cursor:pointer;width:100%` to the `.q-cell` rule so the button renders identically to the anchor.

After `.quad-wrap`, one panel per service:

```html
  <div class="q-detail" id="qd1" hidden>
    <h3 data-i18n="s01.d1.title">Beratung</h3>
    <p class="lead" data-i18n="s01.d1.lead">…</p>
    <div class="blocks">
      <div class="blk"><h4 data-i18n="s01.d1.b1.title">Ist-Soll Analyse</h4>
        <p data-i18n="s01.d1.b1.text">…</p>
        <p class="keys" data-i18n="s01.d1.b1.keys">…</p></div>
      <!-- b2, b3, b4 -->
    </div>
    <a class="cta" href="#book" data-i18n="s01.d1.cta">Erstgespräch vereinbaren →</a>
  </div>
```

The `.keys` value is the doc's comma-separated list; CSS renders it as chips via a repeated `.pin` look. Since the value is a single string, style it as a mono line rather than splitting it — no JS string-splitting, no key-per-chip explosion.

CSS:

```css
.q-detail{border:1px solid var(--rule);border-top:0;padding:1.8rem clamp(1.2rem,3vw,2.2rem)}
.q-detail h3{font-weight:900;font-size:clamp(1.3rem,2.6vw,1.9rem);margin:0 0 .6rem}
.q-detail .lead{max-width:62ch;color:var(--slate);margin:0 0 1.6rem}
.q-detail .blocks{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.4rem}
.q-detail .blk h4{font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);margin:0 0 .5rem}
.q-detail .blk p{color:var(--slate);font-size:.9rem;margin:0}
.q-detail .blk .keys{font-family:var(--mono);font-size:.68rem;line-height:1.9;color:var(--mist);margin-top:.6rem;
  border-top:1px solid var(--line);padding-top:.6rem}
.q-detail .cta{display:inline-block;margin-top:1.8rem}
```

- [ ] **Step 5: Wire the toggle**

Inside the IIFE, after `initLang`:

```js
  document.querySelectorAll('.q-cell[data-panel]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const id='qd'+btn.dataset.panel,panel=document.getElementById(id);
      const open=btn.getAttribute('aria-expanded')==='true';
      document.querySelectorAll('.q-cell[data-panel]').forEach(b=>b.setAttribute('aria-expanded','false'));
      document.querySelectorAll('.q-detail').forEach(p=>p.hidden=true);
      if(!open){btn.setAttribute('aria-expanded','true');panel.hidden=false;}
      if(window.ScrollTrigger)ScrollTrigger.refresh();
    });
  });
```

This block must sit **before** the reduced-motion early return, so panels work for reduced-motion users too.

- [ ] **Step 6: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add index.html tests && git commit -m "feat: expandable service detail panels for SEC.01"
```

---

### Task 7: SEC.02 — Vorgehen

**Files:**
- Modify: `index.html` — `section#approach` (lines ~322–337)
- Modify: `tests/sections.test.mjs`

**Copy sources.** `content-texte.md` lines 86–101, verbatim. Titel → `s02.bar.r`. The four steps keep their `T+00 … T+100` labels. Step 1's text ends with the contact line, rendered as `<a href="mailto:kontakt@pivon.ai">kontakt@pivon.ai</a>` — hence `s02.s1.text` is an HTML value. **No phone number.**

- [ ] **Step 1: Write the failing test**

```js
test('s02 section is complete', () => assertSection(assert, dict(), 's02'));

test('s02 uses the four Vorgehen steps from the doc', () => {
  const d = dict().de;
  assert.deepEqual(
    [1, 2, 3, 4].map((n) => d[`s02.s${n}.title`]),
    ['Kontakt', 'Auftragsklärung', 'Umsetzung', 'Übergabe']
  );
});

test('step 1 links the contact address and no phone number', () => {
  const t = dict().de['s02.s1.text'];
  assert.match(t, /mailto:kontakt@pivon\.ai/);
  assert.ok(!/151/.test(t), 'phone number leaked into step 1');
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s02.s1.title missing or empty`.

- [ ] **Step 3: Add the `s02.*` keys**

- [ ] **Step 4: Annotate the four `.step` cards and the `.sec-bar`**

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: SEC.02 Vorgehen with the four steps from content-texte.md"
```

---

### Task 8: SEC.03–SEC.06 — translation block

Four sections with no counterpart in `content-texte.md`. Existing English copy translated into German; English values are the current strings verbatim.

**Files:**
- Modify: `index.html` — `section#build` (~339–352), `section#work` (~354–364), the engagement section (~366–377), `section.log` (~379–384)
- Modify: `tests/sections.test.mjs`

**Translation rules:**
- Keep the same register: short, direct, no marketing superlatives.
- Code-styled tokens stay English: the YAML keys `mode: in: out: scope: exit: portable:`, the `CRIT` / `WARN` / `RULE` badges, `support-copilot — production`, and the `$ pivon …` shell line.
- YAML **values** and `#` comments translate. Durations become `2 WOCHEN`, `6–10 WOCHEN`, `EIN QUARTAL`.
- The illustrative labelling must stay at least as explicit in German: `s04.sticker` = `illustrativ`, and `s04.disc` must state plainly that these are illustrative engagements, not named client work.

- [ ] **Step 1: Write the failing test**

```js
for (const s of ['s03', 's04', 's05', 's06']) {
  test(`${s} section is complete`, () => assertSection(assert, dict(), s));
}

test('illustrative labelling survives translation', () => {
  const d = dict();
  assert.match(d.de['s04.sticker'], /illustrativ/i);
  assert.match(d.de['s04.disc'], /[Ii]llustrativ/);
  assert.match(d.en['s04.disc'], /[Ii]llustrative/);
});

test('code-styled tokens are not translated', () => {
  const d = dict().de;
  for (const n of [1, 2, 3]) assert.match(d[`s05.f${n}.body`], /mode:/);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s03.status missing or empty`.

- [ ] **Step 3: Add the `s03`–`s06` keys**

- [ ] **Step 4: Annotate the markup**

Annotate all four sections' `.sec-bar` spans, the assembly mock strings, the four `.crow` titles and `.k` labels, the disclaimer, the three `.file` blocks, and the three POV takes.

**The SEC.03 status line needs care.** It currently reads `assembly: <b id="asmPct">0%</b> — support copilot, illustrative build`, and `#asmPct` is a live counter the ScrollTrigger writes to on every scroll tick. Annotating the whole `.status` span with one `data-i18n` key would make `applyLang` replace its `innerHTML`, destroying the `#asmPct` node that the script captured a reference to — the counter would silently stop updating after the first language switch. Split the text around the counter into two keys instead, so `#asmPct` is never inside a translated element:

```html
    <span class="status"><span data-i18n="s03.status.pre">Aufbau:</span> <b id="asmPct">0%</b> <span data-i18n="s03.status.post">— Support-Copilot, illustrativer Aufbau</span></span>
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: german translations for SEC.03-06"
```

---

### Task 9: SEC.07 — Über uns

**Files:**
- Modify: `index.html` — `section#team` (lines ~386–394)
- Modify: `tests/sections.test.mjs`

**Copy sources.** `content-texte.md` lines 118–123. Titel → `s07.bar.r`. The lead uses only the second half of the doc's text — `Wir lernen uns am liebsten im persönlichen Gespräch kennen.` — plus the doc's CTA `Kontakt aufnehmen` linking to `#book`. The "Ausführliche Informationen … folgen in Kürze" sentence is **deliberately dropped**; it contradicts the two named personnel cards directly beneath it (spec §3). Names `Alex` and `Andreas` are not translated; roles, bios and pins are.

- [ ] **Step 1: Write the failing test**

```js
test('s07 section is complete', () => assertSection(assert, dict(), 's07'));

test('s07 does not claim team info is still coming', () => {
  assert.ok(!/folgen in K/i.test(dict().de['s07.lead']));
  assert.match(dict().de['s07.lead'], /persönlichen Gespräch/);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s07.lead missing or empty`.

- [ ] **Step 3: Add the `s07.*` keys**

- [ ] **Step 4: Annotate the markup and add the lead + CTA**

Between the `.sec-bar` and `.duo`:

```html
  <p class="lead" data-i18n="s07.lead">Wir lernen uns am liebsten im persönlichen Gespräch kennen.</p>
```

and after `.duo`:

```html
  <a class="cta" href="#book" data-i18n="s07.cta" style="margin-top:1.6rem;display:inline-block">Kontakt aufnehmen</a>
```

Annotate both `.ic` cards' `.role`, bio `p`, and four `.pin` spans each.

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: SEC.07 Über uns with personal-conversation lead and CTA"
```

---

### Task 10: SEC.08 — Kontakt and footer

**Files:**
- Modify: `index.html` — `section#book` (lines ~396–412), `<style>` (`.book .base`)
- Modify: `tests/sections.test.mjs`

**Copy sources.** `content-texte.md` lines 129–138 (Kontakt) and 144–152 (Footer). The mailto subject is an attribute value, so the CTA carries `data-i18n-attr="href:s08.cta.subject"` with the full `mailto:` URL as the value — German: `mailto:kontakt@pivon.ai?subject=Erstgespr%C3%A4ch%20%E2%80%94%2030%20Minuten`.

Footer gains: the Claim, a five-item nav (`#services`, `#approach`, `#anspruch`, `#team`, `#book`), the address, `Impressum` → `impressum.html`, `Datenschutz` → `datenschutz.html`, the German copyright line, and the retained illustrative disclaimer. The two legal pages are **not** created in this pass and will 404 — that is the accepted decision from the spec.

- [ ] **Step 1: Write the failing test**

```js
test('s08 section is complete', () => assertSection(assert, dict(), 's08'));
test('footer is complete', () => assertSection(assert, dict(), 'foot'));

test('footer links the legal pages and the anspruch anchor', () => {
  assert.match(html, /href="impressum\.html"/);
  assert.match(html, /href="datenschutz\.html"/);
  assert.match(html, /href="#anspruch"/);
});

test('the booking CTA subject line is translatable', () => {
  assert.match(html, /data-i18n-attr="href:s08\.cta\.subject"/);
  assert.match(dict().de['s08.cta.subject'], /^mailto:kontakt@pivon\.ai\?subject=/);
});
```

- [ ] **Step 2: Run it to confirm failure**

```bash
npm test
```

Expected: FAIL — `de.s08.h2 missing or empty`.

- [ ] **Step 3: Add the `s08.*` and `foot.*` keys**

- [ ] **Step 4: Rewrite the booking section and footer**

Annotate `.sec-bar`, `.mono-line`, `.sun h2`, `.sun p`, and the CTA (both its text key and its `data-i18n-attr` href key). Replace `.base` with:

```html
  <div class="base">
    <p class="claim" data-i18n="foot.claim">…</p>
    <nav class="fnav" aria-label="Footer">
      <a href="#services" data-i18n="foot.nav1">Leistungen</a>
      <a href="#approach" data-i18n="foot.nav2">Vorgehen</a>
      <a href="#anspruch" data-i18n="foot.nav3">Unser Anspruch</a>
      <a href="#team" data-i18n="foot.nav4">Über uns</a>
      <a href="#book" data-i18n="foot.nav5">Kontakt</a>
    </nav>
    <div class="frow">
      <a href="mailto:kontakt@pivon.ai" data-i18n="foot.mail">kontakt@pivon.ai</a>
      <a href="impressum.html" data-i18n="foot.impressum">Impressum</a>
      <a href="datenschutz.html" data-i18n="foot.datenschutz">Datenschutz</a>
    </div>
    <div class="frow">
      <span data-i18n="foot.copy">© 2026 pivon. Alle Rechte vorbehalten.</span>
      <span data-i18n="foot.disc">FALLBEISPIELE = ILLUSTRATIVE PROJEKTE</span>
    </div>
  </div>
```

CSS, replacing the existing `.book .base` rules:

```css
.book .base{margin-top:3.4rem;display:flex;flex-direction:column;align-items:center;gap:1.1rem;
  font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;color:rgba(255,255,255,.5)}
.book .base .claim{font-family:var(--body);font-size:.9rem;letter-spacing:0;color:rgba(255,255,255,.7);max-width:52ch;margin:0}
.book .base .fnav,.book .base .frow{display:flex;gap:1.6rem;flex-wrap:wrap;justify-content:center}
.book .base a{color:rgba(255,255,255,.75);text-decoration:none}
.book .base a:hover{color:#fff}
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS — including the `contact address` test from Task 1, now covering every occurrence.

- [ ] **Step 6: Commit**

```bash
git add index.html tests && git commit -m "feat: SEC.08 Kontakt and expanded footer with legal links"
```

---

### Task 11: Browser verification

The test suite proves the data is right. This proves the page is right. No step here is optional and none may be reported as passing without the evidence named.

**Files:**
- Modify: `index.html` — only if a defect is found
- Create: screenshots in the scratchpad

- [ ] **Step 1: Start the preview**

Use `preview_start` with `{name: "static-demo"}` (already configured in `.claude/launch.json`, serves the repo root on port 5500), then navigate to `http://localhost:5500/index.html`.

- [ ] **Step 2: Verify the German default**

`read_page`. Confirm: German throughout, `<html lang="de">`, the DE half of the toggle shows `aria-pressed="true"`. `read_console_messages` — expect no errors and no `[i18n] key drift` warning.

- [ ] **Step 3: Verify the switch**

Click `EN`. `read_page` and confirm every visible string switched, `<html lang>` is `en`, the title changed, and the URL carries `?lang=en`. Reload and confirm English persists. Navigate to `?lang=de` and confirm German returns.

- [ ] **Step 4: Verify the hero morph across a switch**

Scroll into the pinned hero, switch language mid-pin, and confirm via screenshot that the particle field re-samples the German word and the caption matches. Then scroll on and confirm the four words still cycle in order.

- [ ] **Step 5: Verify the detail panels**

Open each of the four panels by click and confirm content and `aria-expanded`. Then tab to a cell and open it with Enter. After opening and closing several times, scroll to `#build` and confirm the assembly stage still pins and aligns — this is the `ScrollTrigger.refresh()` check.

- [ ] **Step 6: Verify reduced motion**

`resize_window` with `colorScheme` unchanged, then emulate reduced motion via `javascript_tool` is not sufficient — instead confirm by reading the code path that i18n init precedes the early return, and verify the toggle still responds after forcing the reduced-motion branch with `?lang=en` on a reduced-motion profile if the browser exposes one. If it cannot be emulated, say so plainly in the final report rather than claiming it passed.

- [ ] **Step 7: Verify layout at three widths in both languages**

`resize_window` to 375, 768, and 1280. At each width, in both languages: no horizontal page scroll, no clipped text in `.steps`, `.q-cell h3`, `.sec-bar`, or `.book .sun h2`, and the language toggle visible at 375 where `.nav-l` is hidden.

- [ ] **Step 8: Capture evidence**

Screenshots at 1280 and 375, in both languages — four images. Report each verification item as passed or failed with its evidence.

- [ ] **Step 9: Commit any fixes**

```bash
npm test && git add index.html && git commit -m "fix: layout corrections found in browser verification"
```

---

## Self-review notes

- **Spec coverage.** §2.1–2.4 → Task 1. §2.5 breakage points → Task 1 (RM ordering), Task 6 (ScrollTrigger refresh), Task 1 (key drift warning) and Task 2 (key parity test). §2.6 layout risk → Task 11 step 7. §3 content mapping → Tasks 3–10, one section group each. §4 additive markup → all seven elements are placed: toggle (T1), subline (T3), traits (T4), intro (T5), panels (T6), `#anspruch` (T4), footer (T10). §5 work split → deviation D2, stated above. §6 verification → Task 11, item for item.
- **Naming consistency.** `applyLang` / `currentLang` / `refreshHeroWords` / `buildTargets` / `assign` are used with the same names in Tasks 1, 3 and 8. `assertSection(assert, dict, section)` keeps the same signature everywhere.
- **Known thin spot.** Task 11 step 6 cannot fully emulate `prefers-reduced-motion` through the preview tools. The step says so and requires the limitation to be reported rather than papered over.
