import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { CATEGORIES } from '../toolRegistry.js';
import './Landing.css';

const STEPS = [
  { n: 1, title: 'Pick a category', desc: 'Document management, PDF management, speech to text, image tools.' },
  { n: 2, title: 'See what\u2019s included', desc: 'Every tool in that category is described up front — no clicking in blind.' },
  { n: 3, title: 'Unlock for $1, use anything', desc: "One $1 payment unlocks every tool in that category for a couple of hours — no per-click charges." },
];

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div className="hero-blob hero-blob-1" aria-hidden="true" />
        <div className="hero-blob hero-blob-2" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-inner">
            <span className="hero-eyebrow">No subscription trap</span>
            <h1 className="hero-headline">Fly through your <span className="text-gradient">workflow</span>.</h1>
            <p className="hero-sub">
              Flewt is a fast, friendly set of tools for the everyday tasks that slow
              people down — document and PDF management, speech to text, and more — at a
              fraction of what the big names charge. $1 unlocks a whole toolkit, or pick a plan.
            </p>
            <div className="hero-actions">
              <Link to="/tools" className="btn btn-flash">Browse tools</Link>
              <Link to="/pricing" className="btn btn-outline">See pricing</Link>
            </div>
            <div className="hero-trust-row">
              <span><b>$1</b> to start</span>
              <span className="hero-trust-dot">·</span>
              <span>Card, Apple Pay, Google Pay</span>
              <span className="hero-trust-dot">·</span>
              <span>No account fees</span>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="hero-card-row row-mint">
              <span className="chip"><Icon name="pdf" size={18} /></span>
              <div className="txt"><b>PDF to Word</b><span>Converted in 4s</span></div>
            </div>
            <div className="hero-card-row row-butter">
              <span className="chip"><Icon name="sign" size={18} /></span>
              <div className="txt"><b>Fill a form</b><span>3 fields left</span></div>
            </div>
            <div className="hero-card-row row-lilac">
              <span className="chip"><Icon name="mic" size={18} /></span>
              <div className="txt"><b>Voice memo → PDF</b><span>Transcribing…</span></div>
            </div>
            <div className="hero-card-price">$1 unlock</div>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Tools for what people actually need, not just what software has.</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link to={`/tools/${c.slug}`} key={c.slug} className={`category-card pastel-${c.color}`}>
              <span className="category-icon"><Icon name={c.icon} /></span>
              <h3>{c.name}</h3>
              <p>{c.tagline}</p>
              {c.comingSoon && <span className="category-soon-badge">New</span>}
            </Link>
          ))}
        </div>
        <p className="landing-more-note">Templates, fonts management, and more — coming soon.</p>
      </section>

      <section className="section-alt">
        <div className="wrap section">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="guide-strip">
            {STEPS.map((s) => (
              <div className="guide-step" key={s.n}>
                <span className="guide-step-n">{s.n}</span>
                <div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="price-band">
          <div>
            <h2>Priced for actually using it</h2>
            <p>$1 unlocks a whole category of tools with no subscription, or a monthly plan from $3.99 — no tiers to decode, no free-trial games.</p>
          </div>
          <Link to="/pricing" className="btn btn-band">Compare plans</Link>
        </div>
      </section>
    </div>
  );
}
