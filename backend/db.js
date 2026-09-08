import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data', 'flewt.db'));

db.pragma('journal_mode = WAL');

// plan: 'payg' (default — no subscription, pay $1/action), 'mid' (£3.99/mo, 50 actions),
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
`);

// Plan limits — single source of truth, referenced by usage middleware and the
// billing routes so the frontend and backend never drift apart.
export const PLAN_LIMITS = {
  payg: { monthlyIncluded: 0, batch: false },
  mid: { monthlyIncluded: 50, batch: false },
  pro: { monthlyIncluded: Infinity, batch: true },
};

export default db;
