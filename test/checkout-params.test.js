'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const { buildCheckoutParams } = require('../lib/checkout-params');

test('valid build', () => {
  const out = buildCheckoutParams({ item: { quantity: 3 } }, 'https://example.com');
  assert.deepStrictEqual(out, {
    payment_method_types: ['card'],
    line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Cash Donation' }, unit_amount: 99900 }, quantity: 3 }],
    mode: 'payment',
    success_url: 'https://example.com/?status=success',
    cancel_url: 'https://example.com/?status=cancel',
  });
});

test('localhost http allowed', () => {
  const out = buildCheckoutParams({ item: { quantity: 1 } }, 'http://localhost:3000');
  assert.equal(out.cancel_url, 'http://localhost:3000/?status=cancel');
});

test('rejects bad quantity', () => {
  assert.throws(() => buildCheckoutParams({ item: { quantity: 0 } }, 'https://x.com'));
  assert.throws(() => buildCheckoutParams({ item: { quantity: 21 } }, 'https://x.com'));
  assert.throws(() => buildCheckoutParams({ item: { quantity: 1.5 } }, 'https://x.com'));
});

test('rejects http non-localhost', () => {
  assert.throws(() => buildCheckoutParams({ item: { quantity: 1 } }, 'http://example.com'));
});

test('ignores browser supplied price/name/image', () => {
  const out = buildCheckoutParams({ item: { name: 'X', price: 1, image: '/x.png', quantity: 2 } }, 'https://example.com');
  assert.equal(out.line_items[0].price_data.unit_amount, 99900);
  assert.equal(out.line_items[0].price_data.product_data.name, 'Cash Donation');
});

test('production rejects insecure redirect URL', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    assert.throws(() => buildCheckoutParams({item: {quantity: 1}}, 'http://localhost:3000'));
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
