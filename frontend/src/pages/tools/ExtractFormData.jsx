import JsonToolRunner from '../../components/JsonToolRunner.jsx';
import './ToolPage.css';

export default function ExtractFormData() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Extract form data</h1>
        <p>Upload a filled-in PDF form and pull out every field's name and value.</p>
      </div>
      <JsonToolRunner
        endpoint="/pdf/extract-form-data"
        accept=".pdf"
        renderResult={(data) => (
          <table className="result-table">
            <thead><tr><th>Field</th><th>Type</th><th>Value</th></tr></thead>
            <tbody>
              {data.fields.length === 0 && <tr><td colSpan={3}>No fillable fields found in this PDF.</td></tr>}
              {data.fields.map((f, i) => (
                <tr key={i}><td>{f.name}</td><td>{f.type}</td><td>{f.value || '—'}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      />
    </div>
  );
}
