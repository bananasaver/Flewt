import { Link } from "react-router-dom";
import { Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/assets/flewtlogo.png" alt="Flewt" className="footer-logo" onError={(e)=>e.currentTarget.classList.add("logo-missing")} />
          <p>Fast tools for getting things done.</p>
          <a href="mailto:hello.flewt@proton.me"><Mail size={16}/> hello.flewt@proton.me</a>
        </div>
        <div>
          <h3>Tools</h3>
          <Link to="/tools">All tools</Link>
          <Link to="/tools/merge-pdf">Merge PDF</Link>
          <Link to="/tools/pdf-to-jpg">PDF to JPG</Link>
          <Link to="/tools/image-to-pdf">Image to PDF</Link>
        </div>
        <div>
          <h3>Flewt</h3>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/signup">Create account</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link to="/privacy">Privacy</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/acceptable-use">Acceptable Use</Link>
          <Link to="/refund-policy">Refund Policy</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Flewt. All rights reserved.</span>
        <span>Tools should feel fast.</span>
      </div>
    </footer>
  );
}
