import { Router } from 'express';
import Stripe from 'stripe';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Prices are each tied to a single currency, so each subscription tier needs
// one Price ID per currency you support. Set these in .env — see .env.example.
const SUBSCRIPTION_PRICE_IDS = {
  mid: { USD: process.env.STRIPE_PRICE_MID_USD, GBP: process.env.STRIPE_PRICE_MID_GBP, EUR: process.env.STRIPE_PRICE_MID_EUR },
  pro: { USD: process.env.STRIPE_PRICE_PRO_USD, GBP: process.env.STRIPE_PRICE_PRO_GBP, EUR: process.env.STRIPE_PRICE_PRO_EUR },
};

// PAYG is a flat 1 unit of whichever currency, charged per action — no Stripe Price
// object needed, since the amount never changes.
const PAYG_AMOUNT = { USD: 100, GBP: 100, EUR: 100 }; // cents/pence, i.e. $1 / £1 / €1

function currencyOrDefault(currency) {
  const c = (currency || 'USD').toUpperCase();
  return ['USD', 'GBP', 'EUR'].includes(c) ? c : 'USD';
}

// ---- Subscriptions (Mid / Pro) via Stripe Checkout ----
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { plan, currency } = req.body; // plan: 'mid' | 'pro'
    if (!['mid', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }
    const cur = currencyOrDefault(currency);
    const priceId = SUBSCRIPTION_PRICE_IDS[plan][cur];
    if (!priceId) {
      return res.status(500).json({
        error: `No Stripe price configured for ${plan}/${cur} yet. Add it to .env once your Stripe products are set up.`,
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      db.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?').run(customerId, user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan },
      success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't start checkout. Please try again." });
  }
});

// Lets an existing subscriber manage/cancel/switch plan via Stripe's hosted portal.
router.post('/create-portal-session', requireAuth, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user.stripe_customer_id) {
      return res.status(400).json({ error: "You don't have a billing account yet." });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't open the billing portal." });
  }
});

// ---- PAYG: one action, one charge ----
// Called right before a tool runs when the user is on the payg plan. Returns a
// PaymentIntent client secret — the frontend confirms it (card, Apple Pay, or Google
// Pay, via the same Payment Request Button used for quick pay), then sends the
// resulting paymentIntentId along with the tool request so the server can verify
// payment actually succeeded before doing the work.
router.post('/payg/charge', requireAuth, async (req, res) => {
  try {
    const cur = currencyOrDefault(req.body.currency);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PAYG_AMOUNT[cur],
      currency: cur.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user.id, kind: 'payg_action' },
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't start payment. Please try again." });
  }
});

// Verifies a PaymentIntent actually succeeded and belongs to this user, before a tool
// route does the real work. Exported so pdf.js/image.js/speech.js routes can call it directly.
export async function verifyPaygPayment(paymentIntentId, userId) {
  if (!paymentIntentId) return false;
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return intent.status === 'succeeded' && intent.metadata.userId === userId && intent.metadata.kind === 'payg_action';
}

// ---- Quick pay button (Apple Pay / Google Pay / card) for subscription upgrades ----
// Kept generic so the same Payment Request Button component can be reused for a
// one-off subscription "pay up front" flow if you want that later.
router.post('/create-payment-intent', requireAuth, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body; // amount in cents
    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount.' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't start payment. Please try again." });
  }
});

// ---- Webhook ----
export const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const user = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?').get(session.customer);
      if (user) {
        const plan = session.metadata?.plan === 'mid' ? 'mid' : 'pro';
        db.prepare('UPDATE users SET plan = ?, stripe_subscription_id = ? WHERE id = ?').run(
          plan,
          session.subscription,
          user.id
        );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const user = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?').get(sub.customer);
      if (user) db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('payg', user.id);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const user = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?').get(sub.customer);
      if (user) {
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        if (!isActive) db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('payg', user.id);
      }
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
};

export default router;
