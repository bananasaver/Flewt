import { useState } from 'react';
import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

// Redact needs one or more page regions, which aren't a fit for ToolRunner's flat
// extraFields (they're a list, not a single value) — so this wraps a small builder
// UI around a JSON "regions" field that ToolRunner sends through as-is.
export default function RedactPdf() {
  const [regions, setRegions] = useState([{ page: 1, x: 50, y: 50, width: 150, height: 20 }]);

  const update = (i, key, val) => {
    const next = [...regions];
    next[i] = { ...next[i], [key]: Number(val) };
    setRegions(next);
  };

  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Redact</h1>
        <p>Permanently black out one or more areas on your PDF. Coordinates are measured in points from the bottom-left of the page.</p>
      </div>

      <div className="tool-options" style={{ maxWidth: 560, marginBottom: 20 }}>
        {regions.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 10 }}>
            <div className="field"><label>Page</label><input type="number" min="1" value={r.page} onChange={(e) => update(i, 'page', e.target.value)} /></div>
            <div className="field"><label>X</label><input type="number" value={r.x} onChange={(e) => update(i, 'x', e.target.value)} /></div>
            <div className="field"><label>Y</label><input type="number" value={r.y} onChange={(e) => update(i, 'y', e.target.value)} /></div>
            <div className="field"><label>Width</label><input type="number" value={r.width} onChange={(e) => update(i, 'width', e.target.value)} /></div>
            <div className="field"><label>Height</label><input type="number" value={r.height} onChange={(e) => update(i, 'height', e.target.value)} /></div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setRegions([...regions, { page: 1, x: 50, y: 50, width: 150, height: 20 }])}
        >
          + Add another area
        </button>
      </div>

      <ToolRunner
        endpoint="/pdf/redact"
        accept=".pdf"
        extraFields={[{ name: 'regions', getValue: () => JSON.stringify(regions) }]}
        helpText="Tip: open the PDF at actual size to estimate coordinates, or use a PDF viewer that shows point positions."
      />
    </div>
  );
}
