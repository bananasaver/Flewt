import { Router } from 'express';
import multer from 'multer';
import archiver from 'archiver';
import { requireAuth } from '../middleware/auth.js';
import { checkUsage, recordUsage } from '../middleware/usage.js';
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
  imagesToPdf,
  stampLabel,
  buildInvoicePdf,
} from '../utils/pdfTools.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(requireAuth);

function finish(req) {
  recordUsage(req.user.id, req.billing.plan);
}

// ---- PDF Management ----
const pdfMgmt = checkUsage('pdf-management');

router.post('/merge', pdfMgmt, upload.array('files', 20), async (req, res) => {
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

router.post('/split', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/rotate', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/watermark', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/compress', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/to-word', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/add-text', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/redact', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/extract-form-data', pdfMgmt, upload.single('file'), async (req, res) => {
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

router.post('/compare', pdfMgmt, upload.fields([{ name: 'fileA', maxCount: 1 }, { name: 'fileB', maxCount: 1 }]), async (req, res) => {
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

// Not yet available in this environment — see README.
router.post('/password-protect', pdfMgmt, upload.single('file'), async (req, res) => {
  res.status(501).json({
    error:
      'Password protect/unlock needs a PDF encryption library (e.g. qpdf) that isn\u2019t installed in this environment yet. See README > "Enabling password protection".',
  });
});

router.post('/office-to-pdf', pdfMgmt, upload.single('file'), async (req, res) => {
  res.status(501).json({
    error:
      'Office-to-PDF conversion needs a document engine (e.g. LibreOffice headless, or a paid conversion API) that isn\u2019t installed in this environment yet. See README > "Enabling Office-to-PDF".',
  });
});

// ---- Document Management ----
const docMgmt = checkUsage('document-management');

// Free preview step for Fill a Form — lets someone see what fields a form has before
// deciding to unlock/pay, without billing them for just looking. The paid action is
// the actual /fill-form submission below.
router.post('/detect-form-fields', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF form.' });
    const fields = await extractFormFields(req.file.buffer);
    res.json({ fields });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't read form fields from that file. It may not contain a fillable form." });
  }
});

router.post('/fill-form', docMgmt, upload.single('file'), async (req, res) => {
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

router.post('/sign', docMgmt, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'signature', maxCount: 1 }]), async (req, res) => {
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

router.post('/photos-to-pdf', docMgmt, upload.array('files', 30), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Add at least one photo.' });
    const bytes = await imagesToPdf(req.files.map((f) => f.buffer));
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="scanned.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't build a PDF from those photos. Make sure they're valid images." });
  }
});

router.post('/stamp', docMgmt, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a PDF to stamp.' });
    const { label, page } = req.body;
    const bytes = await stampLabel(req.file.buffer, { label: label || 'APPROVED', page: parseInt(page, 10) || 1 });
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="stamped.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't stamp that file. Make sure it's a valid PDF." });
  }
});

router.post('/invoice', docMgmt, async (req, res) => {
  try {
    const bytes = await buildInvoicePdf(req.body);
    finish(req);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't build that invoice. Check the details and try again." });
  }
});

export default router;
