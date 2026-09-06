import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiPost } from '../api.js';
import './Dashboard.css';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      <div className="dashboard-cards">
        <div className="dash-card">
          <h3>Plan</h3>
          <p className="dash-plan">{user.plan === 'pro' ? 'Pro — unlimited' : 'Free — 5 runs/day'}</p>
          {user.plan === 'pro' ? (
            <button className="btn btn-outline" onClick={openPortal} disabled={loading}>
              {loading ? 'Opening…' : 'Manage billing'}
            </button>
          ) : (
            <Link to="/pricing" className="btn btn-flash">Upgrade to Pro</Link>
          )}
        </div>

        <div className="dash-card">
          <h3>Quick links</h3>
          <Link to="/tools" className="dash-link">Browse all tools →</Link>
        </div>
      </div>
    </div>
  );
}
