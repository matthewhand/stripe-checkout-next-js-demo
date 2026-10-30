'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const routePath = path.join(__dirname, '../pages/api/create-stripe-session.js');
const source = fs.readFileSync(routePath, 'utf8');
const rewritten = source.replace(
  'export default async function CreateStripeSession(',
  'async function CreateStripeSession(',
);
assert.notEqual(rewritten, source, 'Route export signature changed: update test harness');

function createHandler(env) {
  const calls = [];
  const context = {
    module: { exports: {} },
    process: { env },
    require(name) {
      if (name === '../../lib/checkout-params') {
        return require('../lib/checkout-params');
      }
      if (name === 'stripe') {
        return (secret) => {
          assert.equal(secret, 'sk_test_mock_local_only');
          return {
            checkout: {
              sessions: {
                create: async (params) => {
                  calls.push(params);
                  return { id: 'cs_test_local_mock' };
                },
              },
            },
          };
        };
      }
      throw new Error('Unexpected module import: ' + name);
    },
  };
  vm.runInNewContext(rewritten + '\nmodule.exports=CreateStripeSession;', context, { filename: routePath });
  return { handler: context.module.exports, calls };
}

async function invoke(handler, method, body) {
  const response = { code: 200, headers: {}, payload: undefined };
  const res = {
    setHeader(name, value) { response.headers[name] = value; return res; },
    status(code) { response.code = code; return res; },
    json(payload) { response.payload = payload; return res; },
  };
  await handler({ method, body }, res);
  return response;
}

test('production missing base URL returns 503 instead of client error 400', async () => {
  const { handler } = createHandler({ NODE_ENV: 'production' });
  const result = await invoke(handler, 'POST', { item: { quantity: 1 } });
  assert.equal(result.code, 503);
  assert.equal(result.payload.error, 'Checkout is not configured');
});

test('configured base URL with missing Stripe key returns 503', async () => {
  const { handler } = createHandler({
    NODE_ENV: 'production', CHECKOUT_BASE_URL: 'https://checkout.example.test',
  });
  assert.equal((await invoke(handler, 'POST', { item: { quantity: 1 } })).code, 503);
});

test('malformed client input remains 400 with a configured base URL', async () => {
  const { handler } = createHandler({
    NODE_ENV: 'production', CHECKOUT_BASE_URL: 'https://checkout.example.test',
  });
  assert.equal((await invoke(handler, 'POST', { item: { quantity: 0 } })).code, 400);
});

test('invalid method returns 405 even when configuration is absent', async () => {
  const { handler } = createHandler({ NODE_ENV: 'production' });
  const r = await invoke(handler, 'GET', {});
  assert.equal(r.code, 405);
  assert.equal(r.headers.Allow, 'POST');
});

test('Stripe mock uses trusted amount and client cannot change pricing', async () => {
  const { handler, calls } = createHandler({
    NODE_ENV: 'production',
    CHECKOUT_BASE_URL: 'https://checkout.example.test',
    STRIPE_SECRET_KEY: 'sk_test_mock_local_only',
  });
  const r = await invoke(handler, 'POST', {
    item: { quantity: 2, price: 1, name: 'forged', image: 'https://evil.example/x.png' },
  });
  assert.equal(r.code, 200);
  assert.equal(r.payload.id, 'cs_test_local_mock');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].line_items[0].price_data.unit_amount, 99900);
  assert.equal(calls[0].line_items[0].price_data.product_data.name, 'Cash Donation');
  assert.equal(calls[0].line_items[0].quantity, 2);
});
