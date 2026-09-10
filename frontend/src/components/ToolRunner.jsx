import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiUploadForFile } from '../api.js';
import { useActionGate } from '../hooks/useActionGate.js';
import PaygCheckout from './PaygCheckout.jsx';
import './ToolRunner.css';

// Generic runner shared by most single-file-in, single-file-out tools. `category`
// determines which pricing bucket this tool belongs to (pdf-management,
// document-management, speech-to-text, image-tools) for the payg unlock flow.
export default function ToolRunner({
  category,
  endpoint,
  multiple = false,
  accept = '.pdf',
  extraFields = [],
  helpText,
  batchNote = 'Selecting more than one file at once is a Pro batch-processing feature.',
}) {
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState(() =>
    Object.fromEntries(extraFields.map((f) => [f.name, f.default || '']))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultName, setResultName] = useState('');
  const inputRef = useRef(null);
  const { user, needsAuth, checkingAccess, priceLabel, showUnlock, gate, onUnlocked, cancelUnlock } = useActionGate(category);

  const handleFiles = (list) => {
    const arr = Array.from(list);
    setFiles(multiple ? arr : arr.slice(0, 1));
    setError('');
    setResultName('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const doRun = async () => {
    setLoading(true);
    setError('');
    setResultName('');

    try {
      const formData = new FormData();
      if (multiple) {
        files.forEach((f) => formData.append('files', f));
      } else {
        formData.append('file', files[0]);
      }
      Object.entries(options).forEach(([k, v]) => formData.append(k, v));
      extraFields.forEach((f) => {
        if (f.getValue) formData.set(f.name, f.getValue());
      });

      const { blob, filename } = await apiUploadForFile(endpoint, formData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setResultName(filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const run = () => {
    if (files.length === 0) {
      setError('Add a file to get started.');
      return;
    }
    if (multiple && files.length > 1 && user?.plan !== 'pro') {
      setError(batchNote);
      return;
    }
    gate(doRun);
  };

  return (
    <div className="tool-runner">
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {files.length === 0 ? (
          <>
            <p className="dropzone-title">Drop your {multiple ? 'files' : 'file'} here</p>
            <p className="dropzone-sub">or click to browse · up to 50MB per file</p>
          </>
        ) : (
          <ul className="file-list">
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        )}
      </div>

      {extraFields.filter((f) => !f.getValue && !f.hidden).length > 0 && (
        <div className="tool-options">
          {extraFields.filter((f) => !f.getValue && !f.hidden).map((f) => (
            <div className="field" key={f.name}>
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={options[f.name]}
                  onChange={(e) => setOptions({ ...options, [f.name]: e.target.value })}
                >
                  {f.choices.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={options[f.name]}
                  placeholder={f.placeholder}
                  onChange={(e) => setOptions({ ...options, [f.name]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {resultName && !error && (
        <div className="success-banner">Done — "{resultName}" downloaded.</div>
      )}

      {needsAuth ? (
        <p className="tool-help">
          <Link to="/signup" className="btn btn-flash" style={{ marginRight: 10 }}>Sign up</Link>
          <Link to="/login" className="btn btn-outline">Log in</Link> to use this tool.
        </p>
      ) : checkingAccess ? (
        <p className="tool-help">Checking access…</p>
      ) : showUnlock ? (
        <PaygCheckout category={category} onSuccess={onUnlocked} onCancel={cancelUnlock} />
      ) : (
        <>
          <p className="price-line">{priceLabel}</p>
          <button className="btn btn-flash" onClick={run} disabled={loading}>
            {loading ? 'Working…' : 'Run tool'}
          </button>
        </>
      )}

      {helpText && <p className="tool-help">{helpText}</p>}
    </div>
  );
}
