import ToolRunner from '../../components/ToolRunner.jsx';
import './ToolPage.css';

export default function RotatePdf() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Rotate a PDF</h1>
        <p>Rotate every page in a PDF by 90, 180, or 270 degrees.</p>
      </div>
      <ToolRunner
        endpoint="/pdf/rotate"
        accept=".pdf"
        extraFields={[
          {
            name: 'angle',
            label: 'Rotate by',
            type: 'select',
            default: '90',
            choices: [
              { value: '90', label: '90°' },
              { value: '180', label: '180°' },
              { value: '270', label: '270°' },
            ],
          },
        ]}
      />
    </div>
  );
}
