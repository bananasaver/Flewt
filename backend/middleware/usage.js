import db, { PLAN_LIMITS } from '../db.js';

// Runs after requireAuth. Figures out whether this user can run a tool action right now:
//   - pro:  always allowed, batch allowed
//   - mid:  allowed if under their 50/month cap (resets monthly), batch NOT allowed
//   - payg: never "included" — must have a confirmed one-off payment for this action
//           (see routes/billing.js createPaygCharge / confirmPaygCharge)
//
// Attaches req.billing = { plan, requiresPayment, batchAllowed } so the route handler
// knows whether to check for a payment confirmation before doing the work.
export function checkUsage(req, res, next) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account not found.' });

  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.payg;

  // Reset the monthly counter if we've rolled into a new month since it was last reset.
  const now = new Date();
  const resetAt = user.monthly_reset_at ? new Date(user.monthly_reset_at) : null;
  if (!resetAt || resetAt.getUTCMonth() !== now.getUTCMonth() || resetAt.getUTCFullYear() !== now.getUTCFullYear()) {
    db.prepare('UPDATE users SET monthly_actions_used = 0, monthly_reset_at = ? WHERE id = ?')
      .run(now.toISOString(), user.id);
    user.monthly_actions_used = 0;
  }

  if (user.plan === 'pro') {
    req.billing = { plan: 'pro', requiresPayment: false, batchAllowed: true };
    return next();
  }

  if (user.plan === 'mid') {
    if (user.monthly_actions_used < limits.monthlyIncluded) {
      req.billing = { plan: 'mid', requiresPayment: false, batchAllowed: false };
      return next();
    }
    return res.status(402).json({
      error: `You've used all ${limits.monthlyIncluded} actions included this month.`,
      code: 'MONTHLY_LIMIT_REACHED',
    });
  }

  // payg — every action needs its own confirmed one-off payment. The frontend calls
  // POST /api/billing/payg/charge to get a Stripe PaymentIntent, then passes the
  // confirmed paymentIntentId with the tool request.
  req.billing = { plan: 'payg', requiresPayment: true, batchAllowed: false };
  next();
}

// Call this from inside a route handler once the actual tool work has succeeded,
// so usage only counts on success (a failed conversion shouldn't cost the user anything).
export function recordUsage(userId, plan) {
  if (plan === 'mid') {
    db.prepare('UPDATE users SET monthly_actions_used = monthly_actions_used + 1 WHERE id = ?').run(userId);
  }
  // pro: unlimited, nothing to record. payg: billed per-action via Stripe directly, nothing to record here.
}
