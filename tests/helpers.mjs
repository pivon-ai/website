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
