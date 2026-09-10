import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function ShrinkImage() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Shrink an image</h1>
        <p>Cut file size for uploads, forms, and email — works on JPG and PNG.</p>
      </div>
      <ToolRunner
        category="image-tools" endpoint="/image/shrink"
        accept="image/png,image/jpeg"
        extraFields={[
          { name: 'maxWidth', label: 'Max width (px)', type: 'number', default: '1600' },
          { name: 'quality', label: 'Quality (1–100)', type: 'number', default: '75' },
        ]}
      />
    </div>
  );
}
