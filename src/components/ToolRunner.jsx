import { useState, useRef } from 'react';
import { apiUploadForFile } from '../api.js';
import './ToolRunner.css';

// Generic runner shared by every tool page. Each tool passes its own config:
// endpoint, whether it accepts multiple files, and any extra option fields.
export default function ToolRunner({ endpoint, multiple = false, accept = '.pdf', extraFields = [], helpText }) {
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState(() =>
    Object.fromEntries(extraFields.map((f) => [f.name, f.default || '']))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultName, setResultName] = useState('');
  const inputRef = useRef(null);

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

  const run = async () => {
    if (files.length === 0) {
      setError('Add a PDF to get started.');
      return;
    }
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
            <p className="dropzone-title">Drop your {multiple ? 'PDFs' : 'PDF'} here</p>
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

      {extraFields.length > 0 && (
        <div className="tool-options">
          {extraFields.map((f) => (
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

      <button className="btn btn-flash" onClick={run} disabled={loading}>
        {loading ? 'Working…' : 'Run tool'}
      </button>

      {helpText && <p className="tool-help">{helpText}</p>}
    </div>
  );
}
