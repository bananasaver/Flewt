import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function PdfToWord() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>PDF to Word</h1>
        <p>Convert a PDF's text into an editable .docx file.</p>
      </div>
      <ToolRunner
        endpoint="/pdf/to-word"
        accept=".pdf"
        helpText="Best results on text-based PDFs. Scanned image PDFs and complex multi-column layouts aren't fully reconstructed yet."
      />
    </div>
  );
}
