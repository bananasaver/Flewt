// Single source of truth for categories and their tools, so the hub page,
// category pages, and any future search/nav all stay in sync.
export const CATEGORIES = [
  {
    slug: 'pdf-management',
    icon: 'pdf',
    name: 'PDF Management',
    tagline: 'Convert, combine, and clean up PDFs.',
    intro: 'Everything for working with an existing PDF — turning it into another format, reshaping it, or getting information out of it.',
    tools: [
      { to: '/tools/pdf-to-word', name: 'PDF to Word', desc: 'Convert a PDF\u2019s text into an editable .docx file you can open and edit in Word.' },
      { to: '/tools/merge', name: 'Merge PDFs', desc: 'Combine two or more PDFs into a single file, in exactly the order you add them.' },
      { to: '/tools/split', name: 'Split a PDF', desc: 'Break a multi-page PDF apart into individual page files, downloaded as a zip.' },
      { to: '/tools/compress', name: 'Compress a PDF', desc: 'Shrink a PDF\u2019s file size so it\u2019s easier to email or upload, without redoing it by hand.' },
      { to: '/tools/rotate', name: 'Rotate pages', desc: 'Fix a sideways or upside-down scan by rotating every page 90\u00b0, 180\u00b0, or 270\u00b0.' },
      { to: '/tools/watermark', name: 'Add a watermark', desc: 'Stamp diagonal text like DRAFT or CONFIDENTIAL across every page.' },
      { to: '/tools/edit', name: 'Add text', desc: 'Drop a line of text anywhere on a page — a note, a label, a quick fix.' },
      { to: '/tools/redact', name: 'Redact', desc: 'Permanently black out sensitive areas before sharing a document.' },
      { to: '/tools/compare', name: 'Compare two PDFs', desc: 'Upload an original and a revised version and see exactly what wording changed.' },
      { to: '/tools/extract-form-data', name: 'Extract form data', desc: 'Pull every filled-in answer out of a completed PDF form so you can review it at a glance.' },
      { to: '/tools/password-protect', name: 'Password protect / unlock', desc: 'Coming soon — add or remove a password from a PDF.' },
      { to: '/tools/office-to-pdf', name: 'Office to PDF', desc: 'Coming soon — convert Word, Excel, or PowerPoint files to PDF.' },
    ],
  },
  {
    slug: 'document-management',
    icon: 'document',
    name: 'Document Management',
    tagline: 'Fill, sign, scan, and generate real paperwork.',
    intro: 'Tools for the everyday paperwork that isn\u2019t really a "PDF editing" job — filling in a form, signing something, turning phone photos into a document, or generating a new one from scratch.',
    tools: [
      { to: '/tools/fill-form', name: 'Fill a form', desc: 'Upload a fillable PDF form and type your answers straight into it.' },
      { to: '/tools/sign', name: 'Draw & sign', desc: 'Draw a signature or quick handwritten note by hand and stamp it onto a document.' },
      { to: '/tools/scan-cleanup', name: 'Scan cleanup', desc: 'Crop and lightly enhance a phone photo of a document so it looks properly scanned.' },
      { to: '/tools/photos-to-pdf', name: 'Photos to PDF', desc: 'Turn one or more photographed pages into a single clean PDF — a pocket document scanner.' },
      { to: '/tools/handwriting-to-text', name: 'Handwriting to text', desc: 'Photograph a note or printed page and get the text back, ready to copy and use.' },
      { to: '/tools/stamp', name: 'Digital stamp', desc: 'Stamp APPROVED, PAID, DRAFT (or your own word) plus today\u2019s date onto a page.' },
      { to: '/tools/invoice', name: 'Invoice builder', desc: 'Fill in a few details and get a clean, formatted invoice PDF — no template needed.' },
    ],
  },
  {
    slug: 'speech-to-text',
    icon: 'mic',
    name: 'Speech to Text',
    tagline: 'Turn voice memos into text or a document.',
    intro: 'Upload a recording — a meeting note, a thought on the go, a memo — and get it back as text or a properly formatted PDF.',
    tools: [
      { to: '/tools/voice-to-text', name: 'Voice memo to text', desc: 'Get a plain-text transcript of a recording, ready to copy and paste anywhere.' },
      { to: '/tools/voice-to-pdf', name: 'Voice memo to PDF', desc: 'Get a clean, formatted PDF transcript of a recording — no extra formatting needed.' },
    ],
  },
  {
    slug: 'image-tools',
    icon: 'image',
    name: 'Image Tools',
    tagline: 'Fast, everyday image fixes.',
    intro: 'Quick, everyday image jobs that come up constantly and rarely deserve a whole separate app.',
    tools: [
      { to: '/tools/shrink-image', name: 'Shrink an image', desc: 'Cut a photo\u2019s file size down for uploads, forms, and email attachments.' },
    ],
  },
];

export function findCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}
