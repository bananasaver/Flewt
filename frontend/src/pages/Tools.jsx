import { Link } from 'react-router-dom';
import './Tools.css';

const TOOLS = [
  { to: '/tools/pdf-to-word', name: 'PDF to Word', desc: 'Convert PDF text into an editable .docx file.' },
  { to: '/tools/merge', name: 'Merge PDFs', desc: 'Combine multiple PDFs into one, in order.' },
  { to: '/tools/split', name: 'Split a PDF', desc: 'Break a PDF into individual page files.' },
  { to: '/tools/compress', name: 'Compress a PDF', desc: 'Shrink file size for easier sharing.' },
  { to: '/tools/rotate', name: 'Rotate pages', desc: 'Rotate every page 90°, 180°, or 270°.' },
  { to: '/tools/watermark', name: 'Add a watermark', desc: 'Stamp diagonal text across every page.' },
  { to: '/tools/edit', name: 'Add text', desc: 'Drop a line of text onto any page.' },
];

export default function Tools() {
  return (
    <div className="wrap tools-page">
      <div className="tool-header">
        <h1>All tools</h1>
        <p>Free plan includes 5 tool runs a day. Upgrade any time for unlimited use.</p>
      </div>
      <div className="tools-grid">
        {TOOLS.map((t) => (
          <Link to={t.to} key={t.to} className="tool-card">
            <h3>{t.name}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
