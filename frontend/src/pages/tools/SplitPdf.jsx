import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function SplitPdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Split a PDF</h1>
        <p>Break a PDF into individual pages, delivered as a zip file.</p>
      </div>
      <ToolRunner endpoint="/pdf/split" accept=".pdf" helpText="You'll get a .zip with one PDF per page." />
    </div>
  );
}
