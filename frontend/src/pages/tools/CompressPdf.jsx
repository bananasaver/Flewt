import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function CompressPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Compress a PDF</h1>
        <p>Shrink a PDF's file size for easier sharing and uploading.</p>
      </div>
      <ToolRunner endpoint="/pdf/compress" accept=".pdf" />
    </div>
  );
}
