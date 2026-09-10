import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiPost } from '../api.js';
import './Dashboard.css';

export default function Dashboard() {
  const { user, refreshUser, setPlanForTesting } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testSecret, setTestSecret] = useState('');
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('flewt_token')) {
      navigate('/login');
      return;
    }
    refreshUser().catch(() => {});
  }, [params.get('upgraded')]);

  const openPortal = async () => {
    setLoading(true);
    setError('');
    try {
      const { url } = await apiPost('/billing/create-portal-session', {});
      window.location.href = url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const switchPlan = async (plan) => {
    setTestMsg('');
    setError('');
    try {
      await setPlanForTesting(plan, testSecret);
      setTestMsg(`Switched to ${plan}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wrap dashboard-page">
      <div className="tool-header">
        <h1>Your account</h1>
        <p>{user.email}</p>
      </div>

      {params.get('upgraded') && (
        <div className="success-banner">You're upgraded to Pro. Thanks for supporting Flewt.</div>
      )}
      {error && <div className="error-banner">{error}</div>}
      {testMsg && <div className="success-banner">{testMsg}</div>}

      <div className="dashboard-cards">
        <div className="dash-card">
          <h3>Plan</h3>
          <p className="dash-plan">
            {user.plan === 'pro' && 'Pro — unlimited + batch processing'}
            {user.plan === 'mid' && `Mid — ${user.monthly_actions_used ?? 0}/50 actions used this month`}
            {(!user.plan || user.plan === 'payg') && 'Pay as you go — $1/£1/€1 unlocks a whole category for 2 hours'}
          </p>
          {user.plan === 'pro' || user.plan === 'mid' ? (
            <button className="btn btn-outline" onClick={openPortal} disabled={loading}>
              {loading ? 'Opening…' : 'Manage billing'}
            </button>
          ) : (
            <Link to="/pricing" className="btn btn-flash">See plans</Link>
          )}
        </div>

        <div className="dash-card">
          <h3>Quick links</h3>
          <Link to="/tools" className="dash-link">Browse all tools →</Link>
        </div>

        <div className="dash-card">
          <h3>Testing (dev only)</h3>
          <p style={{ fontSize: 13, color: '#667', marginBottom: 10 }}>
            Switch this account's plan without Stripe, using the secret set in your backend's
            ADMIN_TEST_SECRET. Leave that env var unset to disable this entirely.
          </p>
          <input
            type="password"
            placeholder="ADMIN_TEST_SECRET"
            value={testSecret}
            onChange={(e) => setTestSecret(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: '8px 10px', border: '1.5px solid var(--mist)', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => switchPlan('payg')}>PAYG</button>
            <button className="btn btn-outline" onClick={() => switchPlan('mid')}>Mid</button>
            <button className="btn btn-outline" onClick={() => switchPlan('pro')}>Pro</button>
          </div>
        </div>
      </div>
    </div>
  );
}
