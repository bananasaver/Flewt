import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { checkUsage, recordUsage } from '../middleware/usage.js';
import { transcribeAudio, textToPdf } from '../utils/speechTools.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.use(requireAuth, checkUsage('speech-to-text'));

router.post('/to-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload or record a voice memo.' });
    const text = await transcribeAudio(req.file.buffer, req.file.originalname, req.file.mimetype);
    recordUsage(req.user.id, req.billing.plan);
    res.json({ text });
  } catch (err) {
    console.error(err);
    if (err.code === 'SPEECH_NOT_CONFIGURED') return res.status(501).json({ error: err.message });
    res.status(500).json({ error: "Couldn't transcribe that recording. Please try again." });
  }
});

router.post('/to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Upload or record a voice memo.' });
    const text = await transcribeAudio(req.file.buffer, req.file.originalname, req.file.mimetype);
    const bytes = await textToPdf(text, req.body.title || 'Voice Memo');
    recordUsage(req.user.id, req.billing.plan);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'attachment; filename="voice-memo.pdf"');
    res.send(Buffer.from(bytes));
  } catch (err) {
    console.error(err);
    if (err.code === 'SPEECH_NOT_CONFIGURED') return res.status(501).json({ error: err.message });
    res.status(500).json({ error: "Couldn't turn that recording into a PDF. Please try again." });
  }
});

export default router;
