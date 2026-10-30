const { buildCheckoutParams } = require('../../lib/checkout-params');

export default async function CreateStripeSession(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let params;
  try {
    const baseUrl = process.env.CHECKOUT_BASE_URL ||
      (process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000');
    params = buildCheckoutParams(req.body, baseUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid checkout request' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Checkout is not configured' });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create(params);
    return res.status(200).json({ id: session.id });
  } catch {
    return res.status(502).json({ error: 'Unable to create checkout session' });
  }
}
