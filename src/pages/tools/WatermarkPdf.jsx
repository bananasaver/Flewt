import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function WatermarkPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Add a watermark</h1>
        <p>Stamp a diagonal text watermark across every page.</p>
      </div>
      <ToolRunner
        endpoint="/pdf/watermark"
        accept=".pdf"
        extraFields={[{ name: 'text', label: 'Watermark text', type: 'text', default: 'CONFIDENTIAL', placeholder: 'e.g. DRAFT' }]}
      />
    </div>
  );
}
