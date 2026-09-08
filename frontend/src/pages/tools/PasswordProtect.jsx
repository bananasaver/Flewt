import { Link } from 'react-router-dom';
import './ToolPage.css';

export default function PasswordProtect() {
  return (
    <div className="wrap tool-page">
      <div className="tool-header">
        <h1>Password protect / unlock</h1>
        <p>Add or remove a password from a PDF.</p>
      </div>
      <div className="coming-soon-box">
        <p><strong>Coming soon.</strong> This needs a PDF encryption library that isn't wired up in this build yet — it's on the roadmap.</p>
        <p style={{ marginTop: 10 }}>
          <Link to="/tools/pdf-management" className="btn btn-outline">Back to PDF Management</Link>
        </p>
      </div>
    </div>
  );
}
