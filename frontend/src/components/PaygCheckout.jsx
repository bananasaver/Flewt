import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiPost } from '../api.js';
import { useCurrency } from '../context/CurrencyContext.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function PaygForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    setSubmitting(false);
    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setError('Payment did not complete. Please try again.');
    }
  };

  return (
    <div className="payg-checkout">
      <PaymentElement />
      {error && <div className="error-banner">{error}</div>}
      <div className="payg-actions">
        <button className="btn btn-flash" onClick={confirm} disabled={submitting || !stripe}>
          {submitting ? 'Confirming…' : 'Pay & run'}
        </button>
        <button className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// Fetches a fresh PaymentIntent for this one action, then renders Stripe's unified
// card/Apple Pay/Google Pay element. Calls onSuccess(paymentIntentId) once paid.
export default function PaygCheckout({ onSuccess, onCancel }) {
  const { currency } = useCurrency();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiPost('/billing/payg/charge', { currency })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError(err.message));
  }, [currency]);

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return <div className="error-banner">Payments aren't configured yet — add your Stripe keys to get this live.</div>;
  }
  if (error) return <div className="error-banner">{error}</div>;
  if (!clientSecret) return <p className="tool-help">Loading payment…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaygForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
