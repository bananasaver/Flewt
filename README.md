# Flewt

Flewt is a fast online toolbox for documents, PDFs, images and everyday work.

## Logo
Place the supplied logo at:

`public/assets/flewtlogo.png`

The shared Navbar and Footer load the logo from that single asset path. No page hard-codes the Flewt wordmark as a replacement.

## Current foundation
- React + Vite
- Shared Navbar and Footer components
- Central tool catalogue
- Responsive routing
- Working client-side PDF merge
- Working client-side PDF split/extract
- Working client-side PDF page rotation
- Working client-side PDF compression/re-save
- Working client-side PDF page deletion
- Working client-side image-to-PDF
- Working client-side PDF-to-JPG
- Pricing/account/contact/legal pages
- Tool search
- Drag-and-drop upload UI
- Central configuration ready for Stripe/backend integration

## Important
The production conversion tools such as high-fidelity PDF → Word/Excel/PowerPoint, OCR, advanced PDF editing, account authentication and Stripe billing require a secure backend or specialist processing service. API keys must never be placed in frontend code.

## Run locally
1. Install Node.js.
2. Run `npm install`.
3. Run `npm run dev`.
