import db, { PLAN_LIMITS } from '../db.js';

// Runs after requireAuth, for a specific category (e.g. 'pdf-management'). Figures out
// whether this user can run a tool action right now:
//   - pro:  always allowed, batch allowed
//   - mid:  allowed if under their 50/month cap (shared across every category), no batch
//   - payg: allowed only if they hold an active (unexpired) $1 pass for THIS category —
//           see routes/billing.js unlock-category / confirm-category-pass. If they don't,
//           the route responds 402 with the category name so the frontend can prompt an unlock.
export function checkUsage(category) {
  return (req, res, next) => {
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
      req.billing = { plan: 'pro', category, batchAllowed: true };
      return next();
    }

    if (user.plan === 'mid') {
      if (user.monthly_actions_used < limits.monthlyIncluded) {
        req.billing = { plan: 'mid', category, batchAllowed: false };
        return next();
      }
      return res.status(402).json({
        error: `You've used all ${limits.monthlyIncluded} actions included this month.`,
        code: 'MONTHLY_LIMIT_REACHED',
      });
    }

    // payg — check for an active pass covering this category.
    const pass = db
      .prepare('SELECT * FROM document_passes WHERE user_id = ? AND category = ? AND expires_at > ? ORDER BY expires_at DESC LIMIT 1')
      .get(user.id, category, now.toISOString());

    if (pass) {
      req.billing = { plan: 'payg', category, batchAllowed: false, passExpiresAt: pass.expires_at };
      return next();
    }

    return res.status(402).json({
      error: `Unlock ${category.replace('-', ' ')} for $1 to use this tool.`,
      code: 'CATEGORY_LOCKED',
      category,
    });
  };
}

// Call this from inside a route handler once the actual tool work has succeeded, so
// usage only counts on success. Only mid tier tracks a counter — pro is unlimited,
// payg is covered by the category pass already checked above.
export function recordUsage(userId, plan) {
  if (plan === 'mid') {
    db.prepare('UPDATE users SET monthly_actions_used = monthly_actions_used + 1 WHERE id = ?').run(userId);
  }
}
