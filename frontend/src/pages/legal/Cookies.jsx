import './Legal.css';

export default function Cookies() {
  return (
    <div className="wrap legal-page">
      <div className="legal-body">
        <h1>Cookie Policy</h1>
        <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          Flewt uses a small number of cookies and similar local storage to keep the site
          working properly. We don't use cookies for advertising, and we don't sell any
          data collected this way.
        </p>

        <h2>Essential</h2>
        <ul>
          <li>Keeping you signed in between visits.</li>
          <li>Remembering your selected currency (USD/GBP/EUR).</li>
          <li>Payment processing cookies set by Stripe while you're completing a payment.</li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          Most browsers let you block or delete cookies through their settings. Since
          Flewt's cookies are used to keep you signed in and remember basic preferences,
          blocking them will mean you need to sign in again each visit.
        </p>

        <h2>Contact</h2>
        <p>Questions? Email <a href="mailto:flewt@proton.me">flewt@proton.me</a> or use our <a href="/contact">contact form</a>.</p>
      </div>
    </div>
  );
}
