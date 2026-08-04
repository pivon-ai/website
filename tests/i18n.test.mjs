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
