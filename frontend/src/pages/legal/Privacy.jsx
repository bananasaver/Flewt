import './Legal.css';

export default function Privacy() {
  return (
    <div className="wrap legal-page">
      <div className="legal-body">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          This policy explains what information Flewt collects when you use our tools and
          website, and how it's used. We collect only what's needed to run the service and
          bill you correctly.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>Account details: your email address and a securely hashed password.</li>
          <li>Billing information: handled directly by Stripe, our payment processor — we don't store your card details on our own servers.</li>
          <li>Files you upload to a tool: processed to perform the action you requested (e.g. converting or merging a PDF), then deleted from our servers once processing is complete.</li>
          <li>Basic usage data: which plan you're on and how many actions you've used, so we can apply the right pricing and limits.</li>
          <li>Messages you send us through the Contact page.</li>
        </ul>

        <h2>How we use it</h2>
        <p>
          To provide the tool you requested, to manage your account and billing, to respond
          to support requests, and to keep the service secure and working reliably.
        </p>

        <h2>File handling</h2>
        <p>
          Files you upload are processed in memory or in short-lived temporary storage
          purely to carry out the action you asked for, and are not kept once that's done.
          We don't read, share, or use the content of your files for any other purpose.
        </p>

        <h2>Sharing</h2>
        <p>
          We don't sell your personal information. We share the minimum necessary with
          service providers who help us run Flewt — currently Stripe for payments, and
          (where you've used a voice-to-text tool) an AI transcription provider to process
          that specific request.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us to access, correct, or delete your personal data at any time by
          contacting us — see the Contact page. You can also delete your account from your
          dashboard.
        </p>

        <h2>Contact</h2>
        <p>Questions about this policy? Email <a href="mailto:flewt@proton.me">flewt@proton.me</a> or use our <a href="/contact">contact form</a>.</p>
      </div>
    </div>
  );
}
