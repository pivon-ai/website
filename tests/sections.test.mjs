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
