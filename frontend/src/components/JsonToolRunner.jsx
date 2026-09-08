import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiUploadForJson } from '../api.js';
import { useActionGate } from '../hooks/useActionGate.js';
import PaygCheckout from './PaygCheckout.jsx';
import './ToolRunner.css';

// Same shape as ToolRunner, but calls apiUploadForJson and hands the parsed JSON to
// `renderResult` instead of triggering a file download.
export default function JsonToolRunner({ endpoint, accept, extraFields = [], renderResult, helpText }) {
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState(() => Object.fromEntries(extraFields.map((f) => [f.name, f.default || ''])));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const { needsAuth, priceLabel, showCheckout, gate, onPaid, cancelCheckout } = useActionGate();

  const doRun = async (paymentIntentId) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(options).forEach(([k, v]) => formData.append(k, v));
      if (paymentIntentId) formData.append('paymentIntentId', paymentIntentId);
      const data = await apiUploadForJson(endpoint, formData);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const run = () => {
    if (!file) {
      setError('Add a file to get started.');
      return;
    }
    gate(doRun);
  };

  return (
    <div className="tool-runner">
      <div className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => setFile(e.target.files[0])} />
        {file ? <ul className="file-list"><li>{file.name}</li></ul> : (
          <>
            <p className="dropzone-title">Drop your file here</p>
            <p className="dropzone-sub">or click to browse · up to 50MB</p>
          </>
        )}
      </div>

      {extraFields.length > 0 && (
        <div className="tool-options">
          {extraFields.map((f) => (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              <input type={f.type || 'text'} value={options[f.name]} onChange={(e) => setOptions({ ...options, [f.name]: e.target.value })} />
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {result && renderResult && <div className="tool-result">{renderResult(result)}</div>}

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
          <button className="btn btn-flash" onClick={run} disabled={loading}>{loading ? 'Working…' : 'Run tool'}</button>
        </>
      )}

      {helpText && <p className="tool-help">{helpText}</p>}
    </div>
  );
}
