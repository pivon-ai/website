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
  assert.match(dict().de['s01.d1.lead'], /Dreiklang aus Mensch, Organisation und Technologie/);
});

test('panels are collapsed and accessible by default', () => {
  const panels = [...html.matchAll(/<div class="q-detail"[^>]*>/g)];
  assert.equal(panels.length, 4, 'expected four detail panels');
  for (const p of panels) assert.match(p[0], /hidden/, 'panel is not hidden by default');
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 4);
});
