import { Router } from 'express';
import multer from 'multer';
import archiver from 'archiver';
import db from '../db.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  watermarkPdf,
  compressPdf,
  pdfToDocx,
  addTextToPdf,
} from '../utils/pdfTools.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const FREE_DAILY_LIMIT = 5;

// Free-plan users get a limited number of tool uses per day. Pro users are unlimited.
// Anonymous (signed-out) visitors can still try tools, tracked more loosely by the client;
// pushing them to sign up is handled in the UI, not by blocking here.
function enforceDailyLimit(req, res, next) {
  if (!req.user) return next(); // anonymous — allowed, UI nudges signup

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  if (user.plan !== 'free') return next();

  const today = new Date().toISOString().slice(0, 10);
  const resetDay = (user.daily_reset_at || '').slice(0, 10);

  if (resetDay !== today) {
    db.prepare('UPDATE users SET daily_conversions = 0, daily_reset_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      user.id
    );
    user.daily_conversions = 0;
  }

  if (user.daily_conversions >= FREE_DAILY_LIMIT) {
    return res.status(403).json({
      error: `You've used today's ${FREE_DAILY_LIMIT} free tool runs. Upgrade to Pro for unlimited use.`,
      limitReached: true,
    });
  }

  db.prepare('UPDATE users SET daily_conversions = daily_conversions + 1 WHERE id = ?').run(user.id);
  next();
}

router.use(optionalAuth, enforceDailyLimit);

router.post('/merge', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Upload at least two PDFs to merge.' });
    }
    const bytes = await mergePdfs(req.files.map((f) => f.buffer));
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't merge those files. Make sure they're valid PDFs." });
  }
});

router.post('/split', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to split.' });
    const parts = await splitPdf(req.file.buffer);

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="split-pages.zip"');
    const archive = archiver('zip');
    archive.pipe(res);
    parts.forEach((p) => archive.append(Buffer.from(p.bytes), { name: p.name }));
    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't split that file. Make sure it's a valid PDF." });
  }
});

router.post('/rotate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to rotate.' });
    const angle = parseInt(req.body.angle, 10) || 90;
    const bytes = await rotatePdf(req.file.buffer, angle);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't rotate that file. Make sure it's a valid PDF." });
  }
});

router.post('/watermark', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to watermark.' });
    const text = (req.body.text || 'FLEWT').slice(0, 40);
    const bytes = await watermarkPdf(req.file.buffer, text);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="watermarked.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't watermark that file. Make sure it's a valid PDF." });
  }
});

router.post('/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to compress.' });
    const bytes = await compressPdf(req.file.buffer);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't compress that file. Make sure it's a valid PDF." });
  }
});

router.post('/to-word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to convert.' });
    const buffer = await pdfToDocx(req.file.buffer);
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.set('Content-Disposition', 'attachment; filename="converted.docx"');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't convert that file. Make sure it's a valid, text-based PDF." });
  }
});

router.post('/add-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to edit.' });
    const { text, page, x, y, size } = req.body;
    if (!text) return res.status(400).json({ error: 'Enter some text to add.' });

    const bytes = await addTextToPdf(req.file.buffer, {
      text,
      page: parseInt(page, 10),
      x: parseFloat(x),
      y: parseFloat(y),
      size: parseFloat(size),
    });
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="edited.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't edit that file. Make sure it's a valid PDF." });
  }
});

export default router;
