import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { dict, assertSection, html } from './helpers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docText = readFileSync(join(root, 'content-texte.md'), 'utf8');

test('nav section is complete', () => assertSection(assert, dict(), 'nav'));
test('hero section is complete', () => assertSection(assert, dict(), 'hero'));

test('hero words and captions are read from the dictionary, not hardcoded', () => {
  assert.ok(!/const WORDS=\['CONSULT'/.test(html), 'WORDS is still hardcoded');
  assert.ok(!/'first we <b>consult<\/b>/.test(html), 'CAPS is still hardcoded');
});

test('hero headline is the german one from content-texte.md', () => {
  assert.match(dict().de['hero.h1'], /KI strategisch denken/);
});

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
  const cells = html.split('<button type="button" class="q-cell"');
  assert.match(cells[1], /stick g/, 'cell 1 has no gradient sticker');
  assert.ok(!/stick g/.test(cells[2]), 'cell 2 still has the gradient sticker');
});

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
  const d = dict().de;
  const keys = [
    's01.d1.lead',
    's01.d1.b1.text', 's01.d1.b1.keys',
    's01.d1.b2.text', 's01.d1.b2.keys',
    's01.d1.b3.text', 's01.d1.b3.keys',
    's01.d1.b4.text', 's01.d1.b4.keys'
  ];
  for (const k of keys) {
    const value = d[k];
    assert.ok(value?.trim(), `de.${k} missing`);
    assert.ok(docText.includes(value), `de.${k} does not appear verbatim in content-texte.md: ${value}`);
  }
});

test('panels are collapsed and accessible by default', () => {
  const panels = [...html.matchAll(/<div class="q-detail"[^>]*>/g)];
  assert.equal(panels.length, 4, 'expected four detail panels');
  for (const p of panels) assert.match(p[0], /hidden/, 'panel is not hidden by default');
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 4);
});

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

test('s02 step texts carry the doc text verbatim', () => {
  const d = dict().de;
  for (const k of ['s02.s2.text', 's02.s3.text', 's02.s4.text']) {
    const value = d[k];
    assert.ok(value?.trim(), `de.${k} missing`);
    assert.ok(docText.includes(value), `de.${k} does not appear verbatim in content-texte.md: ${value}`);
  }
});

test('s02 step 1 text carries the doc wording verbatim around the mailto link', () => {
  const s1 = dict().de['s02.s1.text'];
  assert.match(
    s1,
    /<a href="mailto:kontakt@pivon\.ai">kontakt@pivon\.ai<\/a>$/,
    's02.s1.text does not end with the mailto anchor'
  );
  const sentence = 'Kontaktieren Sie uns einfach, unverbindlich und schnell für ein Erstgespräch.';
  assert.ok(s1.includes(sentence), 's02.s1.text is missing the doc sentence');
  assert.ok(docText.includes(sentence), 'sentence not found verbatim in content-texte.md');
  assert.ok(
    docText.includes('Email: kontakt@pivon.ai'),
    'doc no longer contains the Email: label + address line'
  );
});

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
