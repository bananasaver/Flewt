import './Legal.css';

export default function Terms() {
  return (
    <div className="wrap legal-page">
      <div className="legal-body">
        <h1>Terms of Use &amp; Disclaimer</h1>
        <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <p>
          By using Flewt, you agree to these terms. Please read them before using the
          service.
        </p>

        <h2>The service</h2>
        <p>
          Flewt provides online tools for working with documents, images, and audio,
          including PDF management, document management, speech-to-text, and image tools.
          Some actions are pay-as-you-go; others are included in a monthly plan, as shown
          on our Pricing page.
        </p>

        <h2>Your responsibilities</h2>
        <ul>
          <li>You're responsible for the files you upload and the accuracy of any output you use.</li>
          <li>You won't use Flewt to process content you don't have the right to use, or for unlawful purposes.</li>
          <li>You're responsible for keeping your account credentials secure.</li>
        </ul>

        <h2>Payments</h2>
        <p>
          Pay-as-you-go actions and subscription plans are billed via Stripe. Subscription
          plans renew automatically each month until cancelled. You can cancel at any time
          from your dashboard; cancellation takes effect at the end of the current billing
          period.
        </p>

        <h2>Disclaimer</h2>
        <p>
          Flewt's tools are provided "as is," without warranties of any kind, express or
          implied. We aim for accuracy and reliability, but automated conversions (for
          example, PDF-to-Word or speech-to-text) may not always be perfect — always review
          output before relying on it for anything important. To the fullest extent
          permitted by law, Flewt is not liable for any indirect, incidental, or
          consequential loss arising from use of the service.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms as Flewt evolves. Continued use of the service after
          changes are posted means you accept the updated terms.
        </p>

        <h2>Contact</h2>
        <p>Questions about these terms? Email <a href="mailto:flewt@proton.me">flewt@proton.me</a> or use our <a href="/contact">contact form</a>.</p>
      </div>
    </div>
  );
}
