import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import pdfRoutes from './routes/pdf.js';
import billingRoutes, { webhookHandler } from './routes/billing.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Stripe webhook needs the raw body for signature verification, so it's mounted
// before express.json() and given its own raw parser.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'Flewt API' }));

app.use('/api/auth', authRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/billing', billingRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Flewt API running on http://localhost:${PORT}`);
});
