import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiUploadForFile } from '../../api.js';
import { useActionGate } from '../../hooks/useActionGate.js';
import PaygCheckout from '../../components/PaygCheckout.jsx';
import './ToolPage.css';

export default function DrawSign() {
  const [file, setFile] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const { needsAuth, checkingAccess, priceLabel, showUnlock, gate, onUnlocked, cancelUnlock } = useActionGate('document-management');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1b2130';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = () => { drawing.current = false; };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const doSign = async () => {
    setLoading(true);
    setError('');
    try {
      const canvas = canvasRef.current;
      const sigBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', sigBlob, 'signature.png');
      formData.append('page', page);
      formData.append('x', '50');
      formData.append('y', '50');

      const { blob, filename } = await apiUploadForFile('/pdf/sign', formData);
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
    if (!file) return setError('Upload the document to sign first.');
    gate(doSign);
  };

  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Draw &amp; sign</h1>
        <p>Draw your signature or a quick handwritten note, and stamp it onto a page of your document.</p>
      </div>

      <div className="tool-runner">
        <div className="dropzone" onClick={() => document.getElementById('sign-input').click()}>
          <input id="sign-input" type="file" accept=".pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
          <p className="dropzone-title">{file ? file.name : 'Drop your PDF here'}</p>
          {!file && <p className="dropzone-sub">or click to browse</p>}
        </div>

        <div className="signature-pad-wrap">
          <canvas
            ref={canvasRef}
            width={500}
            height={160}
            className="signature-canvas"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <button type="button" className="btn btn-outline" onClick={clear}>Clear</button>
            <div className="field" style={{ margin: 0 }}>
              <label>Page</label>
              <input type="number" min="1" value={page} onChange={(e) => setPage(e.target.value)} style={{ width: 70 }} />
            </div>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {done && <div className="success-banner">Done — your signed document downloaded.</div>}

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
            <button className="btn btn-flash" onClick={run} disabled={loading}>{loading ? 'Stamping…' : 'Sign & download'}</button>
          </>
        )}
      </div>
    </div>
  );
}
