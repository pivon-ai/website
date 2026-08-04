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
  const cells = html.split('<a class="q-cell"');
  assert.match(cells[1], /stick g/, 'cell 1 has no gradient sticker');
  assert.ok(!/stick g/.test(cells[2]), 'cell 2 still has the gradient sticker');
});
