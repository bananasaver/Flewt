import { Link, useParams, Navigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { findCategory } from '../toolRegistry.js';
import { useActionGate } from '../hooks/useActionGate.js';
import PaygCheckout from '../components/PaygCheckout.jsx';
import './Tools.css';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = findCategory(slug);
  const { user, needsAuth, hasAccess, checkingAccess, priceLabel, showUnlock, gate, onUnlocked, cancelUnlock } = useActionGate(slug);

  if (!category) return <Navigate to="/tools" replace />;

  return (
    <div className="wrap tools-page">
      <div className="tool-header">
        <Link to="/tools" className="category-back">← All categories</Link>
        <div className="category-header-row">
          <span className={`category-icon pastel-${category.color}`}><Icon name={category.icon} size={26} /></span>
          <h1>{category.name}</h1>
        </div>
        <p>{category.intro || category.tagline}</p>
      </div>

      {category.comingSoon ? (
        <div className="category-coming-soon">
          <p><strong>Tools for {category.name} are coming soon.</strong> Receipt scanning, income tallies, and expense totals are on the roadmap — check back soon, or head to <Link to="/tools">another category</Link> in the meantime.</p>
        </div>
      ) : (
        <>
          {!needsAuth && !checkingAccess && (
            <div className="access-banner">
              {user.plan !== 'payg' ? (
                <p>{priceLabel}</p>
              ) : hasAccess ? (
                <p className="access-unlocked">{priceLabel}</p>
              ) : showUnlock ? (
                <div style={{ maxWidth: 420 }}>
                  <PaygCheckout category={slug} onSuccess={onUnlocked} onCancel={cancelUnlock} />
                </div>
              ) : (
                <div className="access-locked-row">
                  <p>{priceLabel} — unlocks every tool below for 2 hours.</p>
                  <button className="btn btn-flash" onClick={() => gate(() => {})}>Unlock for $1</button>
                </div>
              )}
            </div>
          )}
          {needsAuth && (
            <div className="access-banner">
              <p>
                <Link to="/signup" className="btn btn-flash" style={{ marginRight: 10 }}>Sign up</Link>
                <Link to="/login" className="btn btn-outline">Log in</Link> to see pricing and use these tools.
              </p>
            </div>
          )}

          <div className="guide-strip">
            <div className="guide-step">
              <span className="guide-step-n">1</span>
              <div>
                <h4>Browse what's below</h4>
                <p>Every tool in {category.name} is listed with what it actually does — no guessing from an icon.</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step-n">2</span>
              <div>
                <h4>New here? Start with "{category.tools[0]?.name}"</h4>
                <p>{category.tools[0]?.desc}</p>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step-n">3</span>
              <div>
                <h4>See the price before it runs</h4>
                <p>Nothing happens — or gets charged — until you've confirmed it.</p>
              </div>
            </div>
          </div>

          <div className="tools-grid">
            {category.tools.map((t) => (
              <Link to={t.to} key={t.to} className="tool-card">
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
