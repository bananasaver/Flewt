import { PDFDocument, degrees } from "pdf-lib";

export async function mergePdfs(files) {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const src = await PDFDocument.load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
  }
  return out.save();
}

export async function extractPages(file, pageNumbers) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  const out = await PDFDocument.create();
  const indices = pageNumbers.map(n => n - 1).filter(n => n >= 0 && n < src.getPageCount());
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  return out.save();
}

export async function rotatePdf(file, amount=90) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  src.getPages().forEach(page => {
    const current = page.getRotation().angle || 0;
    page.setRotation(degrees((current + amount) % 360));
  });
  return src.save();
}

export async function deletePages(file, pageNumbers) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  [...pageNumbers].sort((a,b)=>b-a).forEach(n => {
    const index = n - 1;
    if (index >= 0 && index < src.getPageCount() && src.getPageCount() > 1) src.removePage(index);
  });
  return src.save();
}

export async function resavePdf(file) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  return src.save({ useObjectStreams: true });
}

export async function imagesToPdf(files) {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const type = file.type.toLowerCase();
    const img = type === "image/png" ? await out.embedPng(bytes) : await out.embedJpg(bytes);
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, {x:0, y:0, width:img.width, height:img.height});
  }
  return out.save();
}

export async function pdfToJpg(file) {
  throw new Error("PDF rasterisation requires a browser/server renderer. This tool is wired into the Flewt tool framework but needs the production PDF rendering service.");
}
