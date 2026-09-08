import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { CATEGORIES } from '../toolRegistry.js';
import './Landing.css';

const STEPS = [
  { n: 1, title: 'Pick a category', desc: 'Document management, PDF management, speech to text, image tools.' },
  { n: 2, title: 'Use the tool', desc: 'No sign-up detour, no tier gate — just get straight to it.' },
  { n: 3, title: 'See the price, confirm, done', desc: "$1 pay-as-you-go, or it's included in your plan — you'll always see it before it runs." },
];

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div className="hero-streak" aria-hidden="true" />
        <div className="wrap hero-inner">
          <h1 className="hero-headline">Fly through your workflow.</h1>
          <p className="hero-sub">
            Flewt is a fast, no-clutter set of tools for the everyday tasks that slow
            people down — document and PDF management, speech to text, and more — at a
            fraction of what the big names charge. Pay per action, or pick a plan.
          </p>
          <div className="hero-actions">
            <Link to="/tools" className="btn btn-flash">Browse tools</Link>
            <Link to="/pricing" className="btn btn-ghost-paper">See pricing</Link>
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Tools for what people actually need, not just what software has.</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <Link to={`/tools/${c.slug}`} key={c.slug} className="category-card">
              <Icon name={c.icon} className="category-icon" />
              <h3>{c.name}</h3>
              <p>{c.tagline}</p>
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
          <p>$1 pay-as-you-go for a single action, or a monthly plan from $3.99 — no tiers to decode, no free-trial games.</p>
        </div>
        <Link to="/pricing" className="btn btn-outline">Compare plans</Link>
      </section>
    </div>
  );
}
