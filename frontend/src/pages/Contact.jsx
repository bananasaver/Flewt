import { useState } from 'react';
import { apiPost } from '../api.js';
import '../pages/legal/Legal.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiPost('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap legal-page">
      <div className="legal-body">
        <h1>Contact us</h1>
        <p style={{ marginBottom: 24 }}>
          Questions, bug reports, or feedback — send us a message, or email{' '}
          <a href="mailto:flewt@proton.me">flewt@proton.me</a> directly.
        </p>

        {sent ? (
          <div className="success-banner">Thanks — your message is in. We'll get back to you by email.</div>
        ) : (
          <form onSubmit={submit} style={{ maxWidth: 480 }}>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            {error && <div className="error-banner">{error}</div>}
            <button className="btn btn-flash" disabled={loading}>
              {loading ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
