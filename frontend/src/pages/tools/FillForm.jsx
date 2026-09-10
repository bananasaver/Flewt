import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiUploadForJson, apiUploadForFile } from '../../api.js';
import { useActionGate } from '../../hooks/useActionGate.js';
import PaygCheckout from '../../components/PaygCheckout.jsx';
import './ToolPage.css';

export default function FillForm() {
  const [file, setFile] = useState(null);
  const [fields, setFields] = useState(null); // null = not detected yet
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { needsAuth, checkingAccess, priceLabel, showUnlock, gate, onUnlocked, cancelUnlock } = useActionGate('document-management');

  const detectFields = async () => {
    if (!file) return setError('Choose a PDF form first.');
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await apiUploadForJson('/pdf/detect-form-fields', formData);
      if (data.fields.length === 0) {
        setError("This PDF doesn't seem to have fillable form fields.");
      } else {
        setFields(data.fields);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doFill = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('values', JSON.stringify(values));
      const { blob, filename } = await apiUploadForFile('/pdf/fill-form', formData);
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

  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Fill a form</h1>
        <p>Upload a fillable PDF form — we'll find its fields so you can type your answers straight in.</p>
      </div>

      <div className="tool-runner">
        {!fields ? (
          <>
            <div className="dropzone" onClick={() => document.getElementById('fill-input').click()}>
              <input id="fill-input" type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
              <p className="dropzone-title">{file ? file.name : 'Drop your PDF form here'}</p>
              {!file && <p className="dropzone-sub">or click to browse</p>}
            </div>
            {error && <div className="error-banner">{error}</div>}
            <button className="btn btn-flash" onClick={detectFields} disabled={loading}>
              {loading ? 'Reading form…' : 'Find fields'}
            </button>
          </>
        ) : (
          <>
            <div className="tool-options" style={{ maxWidth: 560 }}>
              {fields.map((f) => (
                <div className="field" key={f.name}>
                  <label>{f.name}</label>
                  <input
                    type="text"
                    value={values[f.name] || ''}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {error && <div className="error-banner">{error}</div>}
            {done && <div className="success-banner">Done — your filled form downloaded.</div>}

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
                <button className="btn btn-flash" onClick={() => gate(doFill)} disabled={loading}>
                  {loading ? 'Filling…' : 'Fill & download'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
