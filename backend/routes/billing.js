import { Router } from 'express';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import db, { PASS_DURATION_MS } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Prices are each tied to a single currency, so each subscription tier needs
// one Price ID per currency you support. Set these in .env — see .env.example.
const SUBSCRIPTION_PRICE_IDS = {
  mid: { USD: process.env.STRIPE_PRICE_MID_USD, GBP: process.env.STRIPE_PRICE_MID_GBP, EUR: process.env.STRIPE_PRICE_MID_EUR },
  pro: { USD: process.env.STRIPE_PRICE_PRO_USD, GBP: process.env.STRIPE_PRICE_PRO_GBP, EUR: process.env.STRIPE_PRICE_PRO_EUR },
};

// PAYG is a flat 1 unit of whichever currency to unlock a whole category — no Stripe
// Price object needed, since the amount never changes.
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

// ---- PAYG: $1 unlocks a whole category ----
// Step 1: frontend calls this to get a PaymentIntent for $1/£1/€1, and confirms it
// with Stripe.js (card, Apple Pay, or Google Pay all handled by the same Payment
// Element). Step 2: frontend calls /payg/confirm-category-pass with the resulting
// paymentIntentId, which verifies the payment really succeeded and only then creates
// the pass row that unlocks every tool in that category for PASS_DURATION_MS.
const VALID_CATEGORIES = ['pdf-management', 'document-management', 'speech-to-text', 'image-tools'];

router.post('/payg/unlock-category', requireAuth, async (req, res) => {
  try {
    const { category, currency } = req.body;
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Unknown category.' });
    }
    const cur = currencyOrDefault(currency);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PAYG_AMOUNT[cur],
      currency: cur.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { userId: req.user.id, kind: 'category_pass', category },
    });
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't start payment. Please try again." });
  }
});

router.post('/payg/confirm-category-pass', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, category } = req.body;
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Unknown category.' });
    }
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const valid =
      intent.status === 'succeeded' &&
      intent.metadata.userId === req.user.id &&
      intent.metadata.kind === 'category_pass' &&
      intent.metadata.category === category;

    if (!valid) {
      return res.status(402).json({ error: 'Payment could not be verified.' });
    }

    const expiresAt = new Date(Date.now() + PASS_DURATION_MS).toISOString();
    db.prepare(
      'INSERT INTO document_passes (id, user_id, category, stripe_payment_intent_id, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).run(randomUUID(), req.user.id, category, paymentIntentId, expiresAt);

    res.json({ category, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't confirm your unlock. Please try again." });
  }
});

// Returns this user's currently-active passes, so the frontend can show "unlocked
// until 3:45pm" instead of re-prompting for payment on every page load.
router.get('/passes', requireAuth, (req, res) => {
  const passes = db
    .prepare('SELECT category, expires_at FROM document_passes WHERE user_id = ? AND expires_at > ?')
    .all(req.user.id, new Date().toISOString());
  res.json({ passes });
});

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
