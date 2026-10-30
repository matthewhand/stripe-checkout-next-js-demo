'use strict';

const FIXED_NAME = 'Cash Donation';
const FIXED_DESCRIPTION = 'Donate me a coffee.';
const FIXED_UNIT_AMOUNT = 99900;
const MIN_QTY = 1;
const MAX_QTY = 20;

function validateBaseUrl(baseUrl) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('baseUrl must be a valid URL');
  }
  if (parsed.protocol === 'https:') {
    return parsed;
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
  ) {
    return parsed;
  }
  throw new Error('baseUrl must be HTTPS (http allowed only for localhost in development)');
}

function buildCheckoutParams(body, baseUrl) {
  if (!body || typeof body !== 'object') throw new Error('body must be an object');
  const item = body.item;
  if (!item || typeof item !== 'object') throw new Error('item is required');
  const q = item.quantity;
  if (!Number.isInteger(q) || q < MIN_QTY || q > MAX_QTY) {
    throw new Error('quantity must be an integer between 1 and 20');
  }
  const base = validateBaseUrl(baseUrl);
  const origin = base.origin;
  const successUrl = `${origin}/?status=success`;
  const cancelUrl = origin + '/?status=cancel';
  return {
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: FIXED_NAME },
          unit_amount: FIXED_UNIT_AMOUNT,
        },
        quantity: q,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
  };
}

module.exports = { buildCheckoutParams };
module.exports.buildCheckoutParams = buildCheckoutParams;
module.exports.default = buildCheckoutParams;
