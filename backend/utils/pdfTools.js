import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Merge multiple PDF buffers into one.
export async function mergePdfs(buffers) {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

// Split a PDF into individual single-page PDFs. Returns an array of { name, bytes }.
export async function splitPdf(buffer) {
  const src = await PDFDocument.load(buffer);
  const total = src.getPageCount();
  const results = [];
  for (let i = 0; i < total; i++) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    const bytes = await out.save();
    results.push({ name: `page-${i + 1}.pdf`, bytes });
  }
  return results;
}

// Rotate every page in a PDF by a given angle (90, 180, 270).
export async function rotatePdf(buffer, angle) {
  const src = await PDFDocument.load(buffer);
  src.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  return src.save();
}

// Add a diagonal text watermark to every page.
export async function watermarkPdf(buffer, text) {
  const src = await PDFDocument.load(buffer);
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  src.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - (text.length * 6),
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.35,
      rotate: degrees(45),
    });
  });
  return src.save();
}

// "Compress" a PDF. pdf-lib's save() with object streams + compact structure
// is a legitimate first pass; heavier image recompression can be layered in later
// with a tool like ghostscript for bigger size cuts.
export async function compressPdf(buffer) {
  const src = await PDFDocument.load(buffer);
  return src.save({ useObjectStreams: true, addDefaultPage: false });
}

// Convert a PDF's extracted text into a real, downloadable .docx file.
// This preserves paragraph breaks from the source text. Complex layouts
// (columns, tables, images) are not reconstructed in this baseline version.
export async function pdfToDocx(buffer) {
  const parsed = await pdfParse(buffer);
  const rawText = parsed.text || '';

  const paragraphs = rawText
    .split(/\n{2,}|\r\n{2,}/)
    .map((block) => block.replace(/\s+\n/g, ' ').trim())
    .filter(Boolean)
    .map(
      (block) =>
        new Paragraph({
          children: [new TextRun(block)],
          spacing: { after: 200 },
        })
    );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length
          ? paragraphs
          : [new Paragraph({ children: [new TextRun('No extractable text was found in this PDF.')] })],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

// Add a single line of text at a given position on a given page (basic "edit" tool).
export async function addTextToPdf(buffer, { page: pageNum, x, y, text, size }) {
  const src = await PDFDocument.load(buffer);
  const font = await src.embedFont(StandardFonts.Helvetica);
  const pages = src.getPages();
  const idx = Math.min(Math.max((pageNum || 1) - 1, 0), pages.length - 1);
  pages[idx].drawText(text, {
    x: x || 50,
    y: y || 50,
    size: size || 18,
    font,
    color: rgb(0, 0, 0),
  });
  return src.save();
}
