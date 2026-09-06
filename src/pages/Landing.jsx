import { Link } from 'react-router-dom';
import './Landing.css';

const TOOLS = [
  { to: '/tools/pdf-to-word', name: 'PDF to Word', desc: 'Text PDFs into editable .docx files.' },
  { to: '/tools/merge', name: 'Merge PDFs', desc: 'Combine files into one, in order.' },
  { to: '/tools/split', name: 'Split a PDF', desc: 'Break pages out into their own files.' },
  { to: '/tools/compress', name: 'Compress a PDF', desc: 'Smaller files, easier to send.' },
  { to: '/tools/rotate', name: 'Rotate pages', desc: 'Fix sideways or upside-down scans.' },
  { to: '/tools/watermark', name: 'Add a watermark', desc: 'Stamp text across every page.' },
  { to: '/tools/edit', name: 'Add text', desc: 'Drop a note, label, or fill-in onto a page.' },
];

const STEPS = [
  { n: 1, title: 'Drop your file in', desc: 'No install, no account required to try a tool.' },
  { n: 2, title: 'Pick your settings', desc: "Only the options that matter for that tool — nothing else." },
  { n: 3, title: 'Download instantly', desc: 'Your file processes and downloads straight back to you.' },
];

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div className="hero-streak" aria-hidden="true" />
        <div className="wrap hero-inner">
          <h1 className="hero-headline">
            PDF tools that keep up with you.
          </h1>
          <p className="hero-sub">
            Convert, merge, split, and edit PDFs in seconds — at a fraction of what Adobe,
            Smallpdf, or iLovePDF charge. No bloated subscriptions, no surprise upsells.
          </p>
          <div className="hero-actions">
            <Link to="/tools" className="btn btn-flash">Try a tool free</Link>
            <Link to="/pricing" className="btn btn-ghost-paper">See pricing</Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Every tool you'd expect. None of the markup.</h2>
        </div>
        <div className="tool-row">
          {TOOLS.map((t) => (
            <Link to={t.to} key={t.to} className="tool-item">
              <span className="tool-item-name">{t.name}</span>
              <span className="tool-item-desc">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-alt">
        <div className="wrap section">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.n}>
                <span className="step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section pricing-teaser">
        <div className="section-head">
          <h2>Priced for actually using it</h2>
          <p>Free for light use. One paid plan when you need more — no tiers to decode.</p>
        </div>
        <Link to="/pricing" className="btn btn-outline">Compare plans</Link>
      </section>
    </div>
  );
}
