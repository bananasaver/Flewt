import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <div className="footer-logo">Flewt<span className="nav-logo-dash">.</span></div>
          <p className="footer-tag">Where tools meet a fast paced environment.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <h4>Product</h4>
            <Link to="/tools">All tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Flewt</span>
      </div>
    </footer>
  );
}
