import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Transcribes an audio buffer to text using OpenAI's Whisper API (or any
// OpenAI-compatible endpoint). Requires OPENAI_API_KEY to be set — until it is, this
// throws a clear, honest error rather than silently failing, matching how Stripe keys
// are handled elsewhere in this project.
export async function transcribeAudio(buffer, filename, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'Speech-to-text isn\u2019t configured yet — add OPENAI_API_KEY to backend/.env to turn this tool on.'
    );
    err.code = 'SPEECH_NOT_CONFIGURED';
    throw err;
  }

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType || 'audio/mpeg' }), filename || 'audio.mp3');
  form.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Transcription failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.text || '';
}

// Wraps transcribed text into a simple, clean single-column PDF.
export async function textToPdf(text, title = 'Transcript') {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 12;
  const lineHeight = 16;

  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, fontSize) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  page.drawText(title, { x: margin, y, size: 18, font: boldFont, color: rgb(0, 0, 0) });
  y -= 30;

  for (const line of lines) {
    if (y < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    y -= lineHeight;
  }

  return doc.save();
}
