import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, plan: user.plan },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    plan: user.plan,
    currency: user.currency,
    monthly_actions_used: user.monthly_actions_used,
    createdAt: user.created_at,
  };
}

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Enter an email and password.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Use a password with at least 8 characters.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  db.prepare(
    `INSERT INTO users (id, email, password_hash, plan) VALUES (?, ?, ?, 'payg')`
  ).run(id, email.toLowerCase(), passwordHash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = signToken(user);

  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Enter your email and password.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user: publicUser(user) });
});

// ---- Testing bypass — NOT for production use ----
// Lets you flip your own logged-in account between payg/mid/pro instantly, without
// touching Stripe, so you can test tool functionality and usability first. Protected
// two ways: you must already be logged in as the account being changed, AND you must
// send the secret set in ADMIN_TEST_SECRET (backend/.env) — nobody can use this
// without both. Leave ADMIN_TEST_SECRET unset (or remove this route) once you're
// closer to a real launch and don't need it anymore.
router.post('/dev-set-plan', requireAuth, (req, res) => {
  if (!process.env.ADMIN_TEST_SECRET) {
    return res.status(403).json({ error: 'Testing bypass is disabled (ADMIN_TEST_SECRET not set).' });
  }
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_TEST_SECRET) {
    return res.status(403).json({ error: 'Invalid testing secret.' });
  }
  const { plan } = req.body;
  if (!['payg', 'mid', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'plan must be payg, mid, or pro.' });
  }

  db.prepare('UPDATE users SET plan = ?, monthly_actions_used = 0, monthly_reset_at = ? WHERE id = ?')
    .run(plan, new Date().toISOString(), req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const token = signToken(user); // re-sign so the JWT's embedded plan is current too
  res.json({ token, user: publicUser(user) });
});

export default router;
