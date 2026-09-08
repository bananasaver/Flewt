import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function ScanCleanup() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Scan cleanup</h1>
        <p>Crop and lightly enhance a photo of a document. Leave the crop fields blank to just enhance the whole image.</p>
      </div>
      <ToolRunner
        endpoint="/image/scan-cleanup"
        accept="image/png,image/jpeg"
        extraFields={[
          { name: 'left', label: 'Crop left (px, optional)', type: 'number' },
          { name: 'top', label: 'Crop top (px, optional)', type: 'number' },
          { name: 'width', label: 'Crop width (px, optional)', type: 'number' },
          { name: 'height', label: 'Crop height (px, optional)', type: 'number' },
        ]}
      />
    </div>
  );
}
