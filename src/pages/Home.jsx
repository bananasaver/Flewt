import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { tools } from "../data/tools";
import ToolCard from "../components/ToolCard";

export default function Home() {
  const featured = tools.filter(t => ["merge-pdf","split-pdf","image-to-pdf","word-counter","vat-calculator","discount-calculator"].includes(t.slug));
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Fast online tools</span>
          <h1>Less waiting.<br/><em>More doing.</em></h1>
          <p className="hero-copy">Flewt brings useful document, PDF, image and everyday tools together in one fast, simple place.</p>
          <div className="hero-actions">
            <Link className="button button-dark button-large" to="/tools">Explore all tools <ArrowRight size={18}/></Link>
            <Link className="button button-light button-large" to="/pricing">See pricing</Link>
          </div>
          <div className="trust-row"><span><Zap size={16}/> Built for speed</span><span><ShieldCheck size={16}/> Privacy-minded</span><span><Sparkles size={16}/> More tools coming</span></div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <div className="section-heading"><div><span className="eyebrow">Popular</span><h2>Tools that get out of your way.</h2></div><Link to="/tools">See everything <ArrowRight size={17}/></Link></div>
          <div className="tool-grid">{featured.map(t=><ToolCard key={t.slug} tool={t}/>)}</div>
        </div>
      </section>
      <section className="section">
        <div className="container split-section">
          <div><span className="eyebrow">The idea</span><h2>Useful software shouldn't feel like hard work.</h2></div>
          <div><p>Flewt is being built around the small jobs that interrupt a busy day: convert this, shrink that, merge these, calculate that.</p><p>One place. Clear tools. No unnecessary fuss.</p></div>
        </div>
      </section>
    </>
  );
}
