const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeText } = require('../server');

test('normalizeText preserves emoji and unicode characters', () => {
  assert.equal(normalizeText('Sunset 🌅✨'), 'Sunset 🌅✨');
  assert.equal(normalizeText('Cozy 🛏️ with 🌿 views'), 'Cozy 🛏️ with 🌿 views');
  assert.equal(normalizeText('  Hello   world  '), 'Hello world');
});
