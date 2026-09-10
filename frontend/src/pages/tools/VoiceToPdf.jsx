import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function VoiceToPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Voice memo to PDF</h1>
        <p>Upload a recording and get a clean, formatted PDF transcript back.</p>
      </div>
      <ToolRunner
        category="speech-to-text" endpoint="/speech/to-pdf"
        accept="audio/*"
        extraFields={[{ name: 'title', label: 'Document title', type: 'text', default: 'Voice Memo' }]}
        helpText="Needs OPENAI_API_KEY set on the server — see the README if this returns a 'not configured' error."
      />
    </div>
  );
}
