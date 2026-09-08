import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Flewt<span className="nav-logo-dash">.</span></div>
          <p className="footer-tag">Fly through your workflow.</p>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Tools</h4>
            <Link to="/tools/pdf-management">PDF Management</Link>
            <Link to="/tools/document-management">Document Management</Link>
            <Link to="/tools/speech-to-text">Speech to Text</Link>
            <Link to="/tools/image-tools">Image Tools</Link>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/pricing">Pricing</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/contact">Contact us</Link>
          </div>
        </div>
      </div>

      <div className="wrap footer-legal">
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/cookies">Cookie Policy</Link>
        <Link to="/terms">Terms &amp; Disclaimer</Link>
        <Link to="/contact">Contact</Link>
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Flewt. All rights reserved.</span>
      </div>
    </footer>
  );
}
