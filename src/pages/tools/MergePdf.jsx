import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function MergePdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Merge PDFs</h1>
        <p>Combine multiple PDFs into a single file, in the order you add them.</p>
      </div>
      <ToolRunner endpoint="/pdf/merge" multiple accept=".pdf" helpText="Add two or more PDFs. They'll be combined in the order shown above." />
    </div>
  );
}
