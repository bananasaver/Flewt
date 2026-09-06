import { Router } from 'express';
import Stripe from 'stripe';
import express from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---- Subscriptions (Stripe Checkout) ----
// Standard card checkout for the Pro plan. Redirects to Stripe's hosted page.
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { interval } = req.body; // 'monthly' | 'yearly'
    const priceId =
      interval === 'yearly'
        ? process.env.STRIPE_PRICE_PRO_YEARLY
        : process.env.STRIPE_PRICE_PRO_MONTHLY;

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
      success_url: `${process.env.CLIENT_URL}/dashboard?upgraded=1`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't start checkout. Please try again." });
  }
});

// Lets an existing subscriber manage or cancel billing via Stripe's hosted portal.
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

// ---- Quick pay: Apple Pay / Google Pay / card via the Payment Request Button ----
// One Payment Intent works for Apple Pay, Google Pay, and card — Stripe.js detects
// what the visitor's browser/device supports and shows the right button automatically.
// This path is for a one-time "Pro, paid up front" style charge; wire the same pattern
// to a subscription with Stripe's Setup Intents if you'd rather charge recurring via quick pay.
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body; // amount in cents, e.g. 499 = $4.99
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
// Keeps the local plan/status in sync with what Stripe reports.
// Mounted with express.raw() in server.js — signature verification needs the raw body.
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
        db.prepare('UPDATE users SET plan = ?, stripe_subscription_id = ? WHERE id = ?').run(
          'pro',
          session.subscription,
          user.id
        );
      }
      break;
    }
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const user = db.prepare('SELECT * FROM users WHERE stripe_customer_id = ?').get(sub.customer);
      if (user) {
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        db.prepare('UPDATE users SET plan = ? WHERE id = ?').run(isActive ? 'pro' : 'free', user.id);
      }
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
};

export default router;
