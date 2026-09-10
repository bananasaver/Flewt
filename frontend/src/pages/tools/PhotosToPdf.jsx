import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function PhotosToPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Photos to PDF</h1>
        <p>Turn one or more photographed pages into a single clean PDF — a quick document scanner, no app install needed.</p>
      </div>
      <ToolRunner
        category="document-management"
        endpoint="/pdf/photos-to-pdf"
        accept="image/png,image/jpeg"
        multiple
        batchNote="Add photos one page at a time, or unlock Pro for true multi-file batch tools."
        helpText="Add photos in page order — they'll appear in the PDF in the order you select them."
      />
    </div>
  );
}
