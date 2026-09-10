import JsonToolRunner from '../../components/JsonToolRunner.jsx';
import './ToolPage.css';

export default function HandwritingToText() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Handwriting to text</h1>
        <p>Photograph a note or printed page and get the text back — works best with clear, well-lit, neat writing.</p>
      </div>
      <JsonToolRunner
        category="document-management"
        endpoint="/image/ocr"
        accept="image/png,image/jpeg"
        renderResult={(data) => (
          <div className="transcript-box">
            <p>{data.text?.trim() || 'No text detected — try a clearer, closer photo.'}</p>
            {data.text && (
              <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(data.text)} style={{ marginTop: 12 }}>
                Copy text
              </button>
            )}
          </div>
        )}
        helpText="Works entirely on our server — no external service involved. Accuracy is best with clear printed or neat handwriting, good lighting, and a straight-on photo."
      />
    </div>
  );
}
