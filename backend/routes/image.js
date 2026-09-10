import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { checkUsage, recordUsage } from '../middleware/usage.js';
import { shrinkImage, cropAndCleanImage, ocrImage } from '../utils/imageTools.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.use(requireAuth);

function finish(req) {
  recordUsage(req.user.id, req.billing.plan);
}

router.post('/shrink', checkUsage('image-tools'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload an image to shrink.' });
    const maxWidth = req.body.maxWidth ? parseInt(req.body.maxWidth, 10) : undefined;
    const quality = req.body.quality ? parseInt(req.body.quality, 10) : undefined;
    const out = await shrinkImage(req.file.buffer, { maxWidth, quality });
    finish(req);
    res.set('Content-Type', req.file.mimetype.includes('png') ? 'image/png' : 'image/jpeg');
    res.set('Content-Disposition', 'attachment; filename="shrunk-image"');
    res.send(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't shrink that image. Make sure it's a valid image file." });
  }
});

router.post('/scan-cleanup', checkUsage('document-management'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a photo of your document.' });
    const { left, top, width, height } = req.body;
    const out = await cropAndCleanImage(req.file.buffer, {
      left: left ? parseInt(left, 10) : undefined,
      top: top ? parseInt(top, 10) : undefined,
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
    });
    finish(req);
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Disposition', 'attachment; filename="cleaned-scan.jpg"');
    res.send(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't clean up that image. Make sure it's a valid image file." });
  }
});

router.post('/ocr', checkUsage('document-management'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload a photo of the text or handwriting.' });
    const text = await ocrImage(req.file.buffer);
    finish(req);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't read that image. Try a clearer, well-lit photo." });
  }
});

export default router;
