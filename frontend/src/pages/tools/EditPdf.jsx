import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function EditPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Add text to a PDF</h1>
        <p>Drop a line of text onto a page — useful for quick notes, signatures, or fill-ins.</p>
      </div>
      <ToolRunner
        endpoint="/pdf/add-text"
        accept=".pdf"
        extraFields={[
          { name: 'text', label: 'Text to add', type: 'text', default: '', placeholder: 'Type here' },
          { name: 'page', label: 'Page number', type: 'number', default: '1' },
          { name: 'x', label: 'X position (from left)', type: 'number', default: '50' },
          { name: 'y', label: 'Y position (from bottom)', type: 'number', default: '50' },
          { name: 'size', label: 'Font size', type: 'number', default: '18' },
        ]}
      />
    </div>
  );
}
