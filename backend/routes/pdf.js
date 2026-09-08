import { Router } from 'express';
import multer from 'multer';
import archiver from 'archiver';
import { requireAuth } from '../middleware/auth.js';
import { checkUsage, recordUsage } from '../middleware/usage.js';
import { verifyPaygPayment } from './billing.js';
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  watermarkPdf,
  compressPdf,
  pdfToDocx,
  addTextToPdf,
  redactPdf,
  extractFormFields,
  fillPdfForm,
  stampSignature,
  comparePdfText,
} from '../utils/pdfTools.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Every tool route requires an account (actions are billed one way or another) and
// runs through checkUsage, which attaches req.billing = { plan, requiresPayment, batchAllowed }.
router.use(requireAuth, checkUsage);

// For payg users, confirms the paymentIntentId sent with the request actually
// succeeded and belongs to them, before letting the route handler do real work.
// For mid/pro, this is a no-op (already covered by checkUsage).
async function gatePayment(req, res, next) {
  if (!req.billing.requiresPayment) return next();
  const ok = await verifyPaygPayment(req.body.paymentIntentId, req.user.id);
  if (!ok) {
    return res.status(402).json({ error: 'Payment not confirmed for this action yet.', code: 'PAYMENT_REQUIRED' });
  }
  next();
}

function finish(req) {
  recordUsage(req.user.id, req.billing.plan);
}

router.post('/merge', upload.array('files', 20), gatePayment, async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Upload at least two PDFs to merge.' });
    }
    if (req.files.length > 2 && !req.billing.batchAllowed) {
      return res.status(403).json({ error: 'Merging more than 2 files at once is a Pro batch-processing feature.' });
    }
    const bytes = await mergePdfs(req.files.map((f) => f.buffer));
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't merge those files. Make sure they're valid PDFs." });
  }
});

router.post('/split', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to split.' });
    const parts = await splitPdf(req.file.buffer);
    finish(req);
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

router.post('/rotate', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to rotate.' });
    const angle = parseInt(req.body.angle, 10) || 90;
    const bytes = await rotatePdf(req.file.buffer, angle);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't rotate that file. Make sure it's a valid PDF." });
  }
});

router.post('/watermark', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to watermark.' });
    const text = (req.body.text || 'FLEWT').slice(0, 40);
    const bytes = await watermarkPdf(req.file.buffer, text);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="watermarked.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't watermark that file. Make sure it's a valid PDF." });
  }
});

router.post('/compress', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to compress.' });
    const bytes = await compressPdf(req.file.buffer);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="compressed.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't compress that file. Make sure it's a valid PDF." });
  }
});

router.post('/to-word', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to convert.' });
    const buffer = await pdfToDocx(req.file.buffer);
    finish(req);
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.set('Content-Disposition', 'attachment; filename="converted.docx"');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't convert that file. Make sure it's a valid, text-based PDF." });
  }
});

router.post('/add-text', upload.single('file'), gatePayment, async (req, res) => {
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
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="edited.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't edit that file. Make sure it's a valid PDF." });
  }
});

router.post('/redact', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to redact.' });
    const regions = JSON.parse(req.body.regions || '[]');
    if (!regions.length) return res.status(400).json({ error: 'Mark at least one area to redact.' });
    const bytes = await redactPdf(req.file.buffer, regions);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="redacted.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't redact that file. Make sure it's a valid PDF." });
  }
});

router.post('/extract-form-data', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a filled-in PDF form.' });
    const fields = await extractFormFields(req.file.buffer);
    finish(req);
    res.json({ fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't read form fields from that file. It may not contain a fillable form." });
  }
});

router.post('/fill-form', upload.single('file'), gatePayment, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF form to fill.' });
    const values = JSON.parse(req.body.values || '{}');
    const bytes = await fillPdfForm(req.file.buffer, values);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="filled-form.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't fill that form. Make sure it's a valid fillable PDF." });
  }
});

router.post('/sign', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), gatePayment, async (req, res) => {
  try {
    const file = req.files?.file?.[0];
    const signature = req.files?.signature?.[0];
    if (!file || !signature) return res.status(400).json({ error: 'Upload both the document and your signature.' });
    const { page, x, y, width, height } = req.body;
    const bytes = await stampSignature(file.buffer, {
      page: parseInt(page, 10),
      x: parseFloat(x),
      y: parseFloat(y),
      width: width ? parseFloat(width) : undefined,
      height: height ? parseFloat(height) : undefined,
      pngBytes: signature.buffer,
    });
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="signed.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't add that signature. Make sure the document is a valid PDF." });
  }
});

router.post('/compare', upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), gatePayment, async (req, res) => {
  try {
    const fileA = req.files?.fileA?.[0];
    const fileB = req.files?.fileB?.[0];
    if (!fileA || !fileB) return res.status(400).json({ error: 'Upload both PDFs to compare.' });
    const diff = await comparePdfText(fileA.buffer, fileB.buffer);
    finish(req);
    res.json(diff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't compare those files. Make sure both are valid PDFs." });
  }
});

// ---- Not yet available in this environment ----
// Both of these need a dependency this project doesn't include yet, so they're wired
// up end-to-end (frontend page, price, route) but honestly report their limitation
// instead of pretending to work. See README for how to enable each.
router.post('/password-protect', upload.single('file'), gatePayment, async (req, res) => {
  res.status(501).json({
    error:
      'Password protect/unlock needs a PDF encryption library (e.g. qpdf) that isn\u2019t installed in this environment yet. See README > "Enabling password protection".',
  });
});

router.post('/office-to-pdf', upload.single('file'), gatePayment, async (req, res) => {
  res.status(501).json({
    error:
      'Office-to-PDF conversion needs a document engine (e.g. LibreOffice headless, or a paid conversion API) that isn\u2019t installed in this environment yet. See README > "Enabling Office-to-PDF".',
  });
});

export default router;
