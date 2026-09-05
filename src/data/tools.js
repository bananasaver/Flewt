export const categories = [
  { id: "pdf", name: "PDF & Documents", description: "Convert, edit, organise and optimise documents." },
  { id: "image", name: "Images", description: "Quick tools for common image jobs." },
  { id: "text", name: "Text", description: "Clean, count and transform text." },
  { id: "utility", name: "Everyday", description: "Small tools that save time." }
];

export const tools = [
  { slug:"pdf-to-word", name:"PDF to Word", category:"pdf", description:"Turn a PDF into an editable Word document.", icon:"FileText", status:"coming" },
  { slug:"pdf-to-excel", name:"PDF to Excel", category:"pdf", description:"Extract tables into an editable spreadsheet.", icon:"Table2", status:"coming" },
  { slug:"pdf-to-powerpoint", name:"PDF to PowerPoint", category:"pdf", description:"Turn PDF pages into an editable presentation.", icon:"Presentation", status:"coming" },
  { slug:"pdf-to-jpg", name:"PDF to JPG", category:"pdf", description:"Export PDF pages as JPG images.", icon:"Image", status:"live" },
  { slug:"pdf-to-png", name:"PDF to PNG", category:"pdf", description:"Export PDF pages as PNG images.", icon:"Image", status:"coming" },
  { slug:"word-to-pdf", name:"Word to PDF", category:"pdf", description:"Convert Word documents into PDFs.", icon:"FileOutput", status:"coming" },
  { slug:"excel-to-pdf", name:"Excel to PDF", category:"pdf", description:"Convert spreadsheets into PDFs.", icon:"FileSpreadsheet", status:"coming" },
  { slug:"powerpoint-to-pdf", name:"PowerPoint to PDF", category:"pdf", description:"Convert presentations into PDFs.", icon:"Presentation", status:"coming" },
  { slug:"image-to-pdf", name:"Image to PDF", category:"pdf", description:"Turn one or more images into a PDF.", icon:"Images", status:"live" },
  { slug:"merge-pdf", name:"Merge PDF", category:"pdf", description:"Combine multiple PDFs into one file.", icon:"Combine", status:"live" },
  { slug:"split-pdf", name:"Split PDF", category:"pdf", description:"Extract selected pages into a new PDF.", icon:"Scissors", status:"live" },
  { slug:"delete-pdf-pages", name:"Delete PDF Pages", category:"pdf", description:"Remove unwanted pages from a PDF.", icon:"Trash2", status:"live" },
  { slug:"rotate-pdf", name:"Rotate PDF", category:"pdf", description:"Rotate PDF pages and save a new file.", icon:"RotateCw", status:"live" },
  { slug:"compress-pdf", name:"Compress PDF", category:"pdf", description:"Re-save a PDF with a lightweight optimisation pass.", icon:"Minimize2", status:"live" },
  { slug:"edit-pdf", name:"Edit PDF", category:"pdf", description:"Add text, images, drawings and annotations.", icon:"PenLine", status:"coming" },
  { slug:"sign-pdf", name:"Sign PDF", category:"pdf", description:"Add a signature to a PDF.", icon:"Signature", status:"coming" },
  { slug:"fill-pdf", name:"Fill PDF", category:"pdf", description:"Complete PDF forms digitally.", icon:"ClipboardPen", status:"coming" },
  { slug:"annotate-pdf", name:"Annotate PDF", category:"pdf", description:"Mark up and comment on PDF documents.", icon:"Highlighter", status:"coming" },
  { slug:"ocr-pdf", name:"OCR PDF", category:"pdf", description:"Make scanned documents searchable.", icon:"ScanText", status:"coming" },
  { slug:"repair-pdf", name:"Repair PDF", category:"pdf", description:"Attempt to rebuild damaged PDFs.", icon:"Wrench", status:"coming" },
  { slug:"protect-pdf", name:"Protect PDF", category:"pdf", description:"Add password protection to documents.", icon:"Lock", status:"coming" },
  { slug:"redact-pdf", name:"Redact PDF", category:"pdf", description:"Permanently remove sensitive information.", icon:"Eraser", status:"coming" },

  { slug:"image-compressor", name:"Image Compressor", category:"image", description:"Reduce image file size quickly.", icon:"FileDown", status:"coming" },
  { slug:"resize-image", name:"Resize Image", category:"image", description:"Change image dimensions without extra software.", icon:"Scaling", status:"coming" },
  { slug:"crop-image", name:"Crop Image", category:"image", description:"Crop an image to the size you need.", icon:"Crop", status:"coming" },
  { slug:"jpg-to-png", name:"JPG to PNG", category:"image", description:"Convert JPG images to PNG.", icon:"RefreshCw", status:"coming" },
  { slug:"png-to-jpg", name:"PNG to JPG", category:"image", description:"Convert PNG images to JPG.", icon:"RefreshCw", status:"coming" },
  { slug:"webp-converter", name:"WebP Converter", category:"image", description:"Convert common images to WebP.", icon:"Globe2", status:"coming" },
  { slug:"background-remover", name:"Background Remover", category:"image", description:"Remove image backgrounds.", icon:"Sparkles", status:"coming" },

  { slug:"word-counter", name:"Word Counter", category:"text", description:"Count words, characters and paragraphs.", icon:"List", status:"live" },
  { slug:"case-converter", name:"Case Converter", category:"text", description:"Change text to upper, lower or title case.", icon:"CaseUpper", status:"live" },
  { slug:"text-cleaner", name:"Text Cleaner", category:"text", description:"Clean spacing and common text formatting problems.", icon:"WandSparkles", status:"live" },
  { slug:"duplicate-line-remover", name:"Duplicate Line Remover", category:"text", description:"Remove repeated lines from text.", icon:"ListX", status:"live" },

  { slug:"qr-code-generator", name:"QR Code Generator", category:"utility", description:"Create a QR code from a URL or short text.", icon:"QrCode", status:"coming" },
  { slug:"percentage-calculator", name:"Percentage Calculator", category:"utility", description:"Work out percentages quickly.", icon:"Percent", status:"live" },
  { slug:"vat-calculator", name:"VAT Calculator", category:"utility", description:"Add or remove VAT from a price.", icon:"Calculator", status:"live" },
  { slug:"discount-calculator", name:"Discount Calculator", category:"utility", description:"Calculate sale prices and savings.", icon:"BadgePercent", status:"live" },
  { slug:"unit-converter", name:"Unit Converter", category:"utility", description:"Convert common measurements.", icon:"ArrowLeftRight", status:"live" }
];
