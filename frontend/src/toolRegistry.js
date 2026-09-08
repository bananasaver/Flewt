// Single source of truth for categories and their tools, so the hub page,
// category pages, and any future search/nav all stay in sync.
export const CATEGORIES = [
  {
    slug: 'pdf-management',
    icon: 'pdf',
    name: 'PDF Management',
    tagline: 'Convert, combine, and clean up PDFs.',
    tools: [
      { to: '/tools/pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF text into an editable .docx file.' },
      { to: '/tools/merge', name: 'Merge PDFs', desc: 'Combine multiple PDFs into one, in order. (Batch: Pro)' },
      { to: '/tools/split', name: 'Split a PDF', desc: 'Break a PDF into individual page files.' },
      { to: '/tools/compress', name: 'Compress a PDF', desc: 'Shrink file size for easier sharing.' },
      { to: '/tools/rotate', name: 'Rotate pages', desc: 'Rotate every page 90°, 180°, or 270°.' },
      { to: '/tools/watermark', name: 'Add a watermark', desc: 'Stamp diagonal text across every page.' },
      { to: '/tools/edit', name: 'Add text', desc: 'Drop a line of text onto any page.' },
      { to: '/tools/redact', name: 'Redact', desc: 'Permanently black out sensitive areas.' },
      { to: '/tools/compare', name: 'Compare two PDFs', desc: 'See what changed in the wording between versions.' },
      { to: '/tools/extract-form-data', name: 'Extract form data', desc: 'Pull filled-in form answers out to review.' },
      { to: '/tools/password-protect', name: 'Password protect / unlock', desc: 'Coming soon — add or remove a PDF password.' },
      { to: '/tools/office-to-pdf', name: 'Office to PDF', desc: 'Coming soon — Word/Excel/PowerPoint to PDF.' },
    ],
  },
  {
    slug: 'document-management',
    icon: 'document',
    name: 'Document Management',
    tagline: 'Fill, sign, and tidy up real paperwork.',
    tools: [
      { to: '/tools/fill-form', name: 'Fill a form', desc: 'Type your answers straight into a PDF form.' },
      { to: '/tools/sign', name: 'Draw & sign', desc: 'Add a handwritten signature or note by hand.' },
      { to: '/tools/scan-cleanup', name: 'Scan cleanup', desc: 'Crop and clean up a photographed document.' },
    ],
  },
  {
    slug: 'speech-to-text',
    icon: 'mic',
    name: 'Speech to Text',
    tagline: 'Turn voice memos into text or a document.',
    tools: [
      { to: '/tools/voice-to-text', name: 'Voice memo to text', desc: 'Get a plain-text transcript of a recording.' },
      { to: '/tools/voice-to-pdf', name: 'Voice memo to PDF', desc: 'Get a clean, formatted PDF from a recording.' },
    ],
  },
  {
    slug: 'image-tools',
    icon: 'image',
    name: 'Image Tools',
    tagline: 'Fast, everyday image fixes.',
    tools: [
      { to: '/tools/shrink-image', name: 'Shrink an image', desc: 'Cut file size for uploads, forms, and email.' },
    ],
  },
];

export function findCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}
