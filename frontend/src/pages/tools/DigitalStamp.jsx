import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function DigitalStamp() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Digital stamp</h1>
        <p>Stamp a bold label — APPROVED, PAID, DRAFT, or your own word — plus today's date onto a page.</p>
      </div>
      <ToolRunner
        category="document-management"
        endpoint="/pdf/stamp"
        accept=".pdf"
        extraFields={[
          { name: 'label', label: 'Stamp text', type: 'text', default: 'APPROVED', placeholder: 'e.g. APPROVED, PAID, DRAFT' },
          { name: 'page', label: 'Page', type: 'number', default: '1' },
        ]}
      />
    </div>
  );
}
