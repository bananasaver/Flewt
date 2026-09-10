import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPostForBlob } from '../../api.js';
import { useActionGate } from '../../hooks/useActionGate.js';
import PaygCheckout from '../../components/PaygCheckout.jsx';
import './ToolPage.css';

const emptyItem = () => ({ description: '', qty: 1, price: 0 });

export default function InvoiceBuilder() {
  const [form, setForm] = useState({
    invoiceNumber: '',
    date: new Date().toLocaleDateString('en-GB'),
    from: '',
    to: '',
    notes: '',
  });
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { needsAuth, checkingAccess, priceLabel, showUnlock, gate, onUnlocked, cancelUnlock } = useActionGate('document-management');

  const updateItem = (i, key, val) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };

  const doBuild = async () => {
    setLoading(true);
    setError('');
    try {
      const { blob, filename } = await apiPostForBlob('/pdf/invoice', { ...form, items });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const run = () => {
    if (!form.from || !form.to || items.every((i) => !i.description)) {
      setError('Fill in at least who it\u2019s from, who it\u2019s to, and one line item.');
      return;
    }
    gate(doBuild);
  };

  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Invoice builder</h1>
        <p>Fill in a few details and get a clean, formatted invoice PDF.</p>
      </div>

      <div className="tool-runner">
        <div className="tool-options" style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Invoice number</label>
              <input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="INV-001" />
            </div>
            <div className="field">
              <label>Date</label>
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>From</label>
              <textarea rows={3} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} placeholder={'Your name / business\nAddress'} />
            </div>
            <div className="field">
              <label>Bill to</label>
              <textarea rows={3} value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} placeholder={'Client name\nAddress'} />
            </div>
          </div>

          <label style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600, fontSize: 13 }}>Items</label>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
              <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(i, 'qty', e.target.value)} />
              <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} />
            </div>
          ))}
          <button type="button" className="btn btn-outline" onClick={() => setItems([...items, emptyItem()])}>+ Add line item</button>

          <div className="field" style={{ marginTop: 14 }}>
            <label>Notes (optional)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, thank-you note, etc." />
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {done && <div className="success-banner">Done — your invoice downloaded.</div>}

        {needsAuth ? (
          <p className="tool-help">
            <Link to="/signup" className="btn btn-flash" style={{ marginRight: 10 }}>Sign up</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link> to use this tool.
          </p>
        ) : checkingAccess ? (
          <p className="tool-help">Checking access…</p>
        ) : showUnlock ? (
          <PaygCheckout category="document-management" onSuccess={onUnlocked} onCancel={cancelUnlock} />
        ) : (
          <>
            <p className="price-line">{priceLabel}</p>
            <button className="btn btn-flash" onClick={run} disabled={loading}>{loading ? 'Building…' : 'Build & download'}</button>
          </>
        )}
      </div>
    </div>
  );
}
