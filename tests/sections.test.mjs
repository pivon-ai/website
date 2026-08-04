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
