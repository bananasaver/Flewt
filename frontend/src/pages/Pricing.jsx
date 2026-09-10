import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { apiPost } from '../api.js';
import CurrencySwitcher from '../components/CurrencySwitcher.jsx';
import './Pricing.css';

const ROWS = [
  { label: 'Entry price', flewt: '$1 / category', adobe: '$19.99/mo', smallpdf: '$12.00/mo', ilovepdf: '$9.00/mo' },
  { label: 'Unlimited plan', flewt: '$10.99/mo', adobe: '$19.99/mo', smallpdf: '$12.00/mo', ilovepdf: '$9.00/mo' },
  { label: 'No subscription required', flewt: true, adobe: false, smallpdf: false, ilovepdf: false },
  { label: 'Batch processing', flewt: 'Pro only', adobe: true, smallpdf: true, ilovepdf: true },
  { label: 'No forced trial-to-cancel', flewt: true, adobe: false, smallpdf: false, ilovepdf: false },
];

function Cell({ value }) {
  if (value === true) return <span className="cell-yes">✓</span>;
  if (value === false) return <span className="cell-no">—</span>;
  return <span>{value}</span>;
}

const PRICES = {
  USD: { symbol: '$', payg: '1', mid: '3.99', pro: '10.99' },
  GBP: { symbol: '£', payg: '1', mid: '3.99', pro: '10.99' },
  EUR: { symbol: '€', payg: '1', mid: '3.99', pro: '10.99' },
};

export default function Pricing() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const prices = PRICES[currency] || PRICES.USD;

  const upgrade = async (plan) => {
    if (!user) {
      navigate('/signup');
      return;
    }
    setLoading(plan);
    setError('');
    try {
      const { url } = await apiPost('/billing/create-checkout-session', { plan, currency });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="wrap pricing-page">
      <div className="tool-header">
        <div className="pricing-header-row">
          <h1>Simple pricing, real savings</h1>
          <CurrencySwitcher />
        </div>
        <p>Unlock a whole toolkit for $1 with no subscription, or pick a plan once you're using Flewt regularly.</p>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="plan-cards plan-cards-3">
        <div className="plan-card">
          <h3>Pay as you go</h3>
          <div className="plan-price">{prices.symbol}{prices.payg}<span className="plan-price-unit">/category</span></div>
          <p>No subscription. $1 unlocks every tool in one category (e.g. all of PDF Management) for 2 hours.</p>
          <button className="btn btn-outline" onClick={() => navigate(user ? '/tools' : '/signup')}>
            {user ? 'Browse tools' : 'Create free account'}
          </button>
        </div>

        <div className="plan-card">
          <h3>Mid</h3>
          <div className="plan-price">{prices.symbol}{prices.mid}<span className="plan-price-unit">/mo</span></div>
          <p>50 actions included every month, across every category. Single-file tools only.</p>
          <button className="btn btn-outline" onClick={() => upgrade('mid')} disabled={loading === 'mid'}>
            {loading === 'mid' ? 'Redirecting…' : 'Choose Mid'}
          </button>
        </div>

        <div className="plan-card plan-card-pro">
          <h3>Pro</h3>
          <div className="plan-price">{prices.symbol}{prices.pro}<span className="plan-price-unit">/mo</span></div>
          <p>Unlimited actions across the whole site, plus batch processing — select many files, run one action.</p>
          <button className="btn btn-flash" onClick={() => upgrade('pro')} disabled={loading === 'pro'}>
            {loading === 'pro' ? 'Redirecting…' : 'Choose Pro'}
          </button>
        </div>
      </div>

      <p className="plan-note" style={{ marginTop: 8 }}>
        Card, Apple Pay, and Google Pay are all available at checkout — Stripe shows whichever your device supports.
      </p>

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
