import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiPost } from '../api.js';
import QuickPayButton from '../components/QuickPayButton.jsx';
import './Pricing.css';

const ROWS = [
  { label: 'Price per month', flewt: '$3.99', adobe: '$19.99', smallpdf: '$12.00', ilovepdf: '$9.00' },
  { label: 'PDF to Word / Office', flewt: true, adobe: true, smallpdf: true, ilovepdf: true },
  { label: 'Merge, split, rotate', flewt: true, adobe: true, smallpdf: true, ilovepdf: true },
  { label: 'Watermark & basic edit', flewt: true, adobe: true, smallpdf: true, ilovepdf: true },
  { label: 'Daily free tool runs', flewt: '5', adobe: '2', smallpdf: '2', ilovepdf: '2' },
  { label: 'No forced trial-to-cancel', flewt: true, adobe: false, smallpdf: false, ilovepdf: false },
];

function Cell({ value }) {
  if (value === true) return <span className="cell-yes">✓</span>;
  if (value === false) return <span className="cell-no">—</span>;
  return <span>{value}</span>;
}

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval_] = useState('monthly');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { url } = await apiPost('/billing/create-checkout-session', { interval });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap pricing-page">
      <div className="tool-header">
        <h1>Simple pricing, real savings</h1>
        <p>One paid plan. No feature-gating games, no auto-renew tricks.</p>
      </div>

      <div className="plan-toggle">
        <button className={interval === 'monthly' ? 'active' : ''} onClick={() => setInterval_('monthly')}>Monthly</button>
        <button className={interval === 'yearly' ? 'active' : ''} onClick={() => setInterval_('yearly')}>Yearly (save ~20%)</button>
      </div>

      <div className="plan-cards">
        <div className="plan-card">
          <h3>Free</h3>
          <div className="plan-price">$0</div>
          <p>5 tool runs a day. No card needed.</p>
          <button className="btn btn-outline" onClick={() => navigate('/signup')}>Start free</button>
        </div>
        <div className="plan-card plan-card-pro">
          <h3>Pro</h3>
          <div className="plan-price">{interval === 'monthly' ? '$3.99/mo' : '$38/yr'}</div>
          <p>Unlimited tool runs, no daily caps, priority processing.</p>
          {error && <div className="error-banner">{error}</div>}
          <button className="btn btn-flash" onClick={startCheckout} disabled={loading}>
            {loading ? 'Redirecting…' : 'Upgrade with card'}
          </button>
          <div className="quickpay-wrap">
            <QuickPayButton amountCents={interval === 'monthly' ? 399 : 3800} label="Flewt Pro" />
          </div>
          <p className="plan-note">Apple Pay / Google Pay shown automatically where supported.</p>
        </div>
      </div>

      <div className="compare-table-wrap">
        <h2>How we compare</h2>
        <table className="compare-table">
          <thead>
            <tr>
              <th></th>
              <th>Flewt</th>
              <th>Adobe Acrobat</th>
              <th>Smallpdf</th>
              <th>iLovePDF</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td><Cell value={r.flewt} /></td>
                <td><Cell value={r.adobe} /></td>
                <td><Cell value={r.smallpdf} /></td>
                <td><Cell value={r.ilovepdf} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="compare-note">Competitor prices are approximate published rates and may change — always confirm on their sites.</p>
      </div>
    </div>
  );
}
