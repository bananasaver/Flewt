import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUploadForJson } from '../../api.js';
import { useActionGate } from '../../hooks/useActionGate.js';
import PaygCheckout from '../../components/PaygCheckout.jsx';
import './ToolPage.css';

export default function ComparePdfs() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const { needsAuth, priceLabel, showCheckout, gate, onPaid, cancelCheckout } = useActionGate();

  const doRun = async (paymentIntentId) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('fileA', fileA);
      formData.append('fileB', fileB);
      if (paymentIntentId) formData.append('paymentIntentId', paymentIntentId);
      const data = await apiUploadForJson('/pdf/compare', formData);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const run = () => {
    if (!fileA || !fileB) {
      setError('Add both PDFs to compare.');
      return;
    }
    gate(doRun);
  };

  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Compare two PDFs</h1>
        <p>Upload the original and the updated version — we'll show you what wording changed.</p>
      </div>

      <div className="tool-runner">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div className="dropzone" onClick={() => document.getElementById('fileA-input').click()}>
            <input id="fileA-input" type="file" accept=".pdf" hidden onChange={(e) => setFileA(e.target.files[0])} />
            <p className="dropzone-title">{fileA ? fileA.name : 'Original PDF'}</p>
            {!fileA && <p className="dropzone-sub">click to browse</p>}
          </div>
          <div className="dropzone" onClick={() => document.getElementById('fileB-input').click()}>
            <input id="fileB-input" type="file" accept=".pdf" hidden onChange={(e) => setFileB(e.target.files[0])} />
            <p className="dropzone-title">{fileB ? fileB.name : 'Updated PDF'}</p>
            {!fileB && <p className="dropzone-sub">click to browse</p>}
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {result && (
          <div className="tool-result">
            <p style={{ marginBottom: 10, fontSize: 14, color: '#556' }}>
              {result.unchangedCount} unchanged lines, {result.removed.length} removed, {result.added.length} added.
            </p>
            {result.removed.length > 0 && (
              <div className="diff-block diff-removed">
                <h4>Removed</h4>
                {result.removed.map((l, i) => <p key={i}>− {l}</p>)}
              </div>
            )}
            {result.added.length > 0 && (
              <div className="diff-block diff-added">
                <h4>Added</h4>
                {result.added.map((l, i) => <p key={i}>+ {l}</p>)}
              </div>
            )}
          </div>
        )}

        {needsAuth ? (
          <p className="tool-help">
            <Link to="/signup" className="btn btn-flash" style={{ marginRight: 10 }}>Sign up</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link> to use this tool.
          </p>
        ) : showCheckout ? (
          <PaygCheckout onSuccess={onPaid} onCancel={cancelCheckout} />
        ) : (
          <>
            <p className="price-line">{priceLabel}</p>
            <button className="btn btn-flash" onClick={run} disabled={loading}>{loading ? 'Comparing…' : 'Compare'}</button>
          </>
        )}
      </div>
    </div>
  );
}
