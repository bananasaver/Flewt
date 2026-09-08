import { Router } from 'express';
import { randomUUID } from 'crypto';
import db from '../db.js';

const router = Router();

// Stores contact form submissions to the database. No outbound email is configured
// in this baseline (that needs an SMTP/email-API key you don't have yet) — messages
// land in the contact_messages table and can be queried directly for now:
//   sqlite3 backend/data/flewt.db "SELECT * FROM contact_messages ORDER BY created_at DESC;"
// A simple admin view or an email-forwarding step (e.g. via Resend or SendGrid) is a
// natural next addition once you're ready.
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Fill in your name, email, and message.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }

  const id = randomUUID();
  db.prepare('INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)').run(
    id,
    name.slice(0, 200),
    email.slice(0, 200),
    message
  );

  res.json({ ok: true });
});

export default router;
