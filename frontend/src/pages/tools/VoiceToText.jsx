import JsonToolRunner from '../../components/JsonToolRunner.jsx';
import './ToolPage.css';

export default function VoiceToText() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Voice memo to text</h1>
        <p>Upload a recording and get a plain-text transcript back.</p>
      </div>
      <JsonToolRunner
        endpoint="/speech/to-text"
        accept="audio/*"
        renderResult={(data) => (
          <div className="transcript-box">
            <p>{data.text || 'No speech detected.'}</p>
            {data.text && (
              <button
                className="btn btn-outline"
                onClick={() => navigator.clipboard.writeText(data.text)}
                style={{ marginTop: 12 }}
              >
                Copy text
              </button>
            )}
          </div>
        )}
        helpText="Needs OPENAI_API_KEY set on the server — see the README if this returns a 'not configured' error."
      />
    </div>
  );
}
