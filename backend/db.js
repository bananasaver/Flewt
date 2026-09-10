import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data', 'flewt.db'));

db.pragma('journal_mode = WAL');

// plan: 'payg' (default — no subscription; $1 unlocks a whole category, see
// document_passes below), 'mid' (£3.99/mo, 50 actions across every category),
// 'pro' (£10.99/mo, unlimited + batch)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'payg',
    currency TEXT NOT NULL DEFAULT 'USD',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    monthly_actions_used INTEGER NOT NULL DEFAULT 0,
    monthly_reset_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- A $1 pass on the payg plan unlocks every tool in one category for a window of
  -- time, rather than charging per action. One row per successful unlock.
  CREATE TABLE IF NOT EXISTS document_passes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_passes_user_category ON document_passes (user_id, category, expires_at);
`);

// Plan limits — single source of truth, referenced by usage middleware and the
// billing routes so the frontend and backend never drift apart.
export const PLAN_LIMITS = {
  payg: { monthlyIncluded: 0, batch: false },
  mid: { monthlyIncluded: 50, batch: false },
  pro: { monthlyIncluded: Infinity, batch: true },
};

// How long a $1 category pass stays valid once purchased.
export const PASS_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export default db;
