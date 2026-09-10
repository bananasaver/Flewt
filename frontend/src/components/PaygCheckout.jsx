import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiPost } from '../api.js';
import { useCurrency } from '../context/CurrencyContext.jsx';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function UnlockForm({ category, paymentIntentId, onSuccess, onCancel }) {
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
    if (stripeError) {
      setSubmitting(false);
      setError(stripeError.message || 'Payment failed. Please try again.');
      return;
    }
    if (paymentIntent?.status !== 'succeeded') {
      setSubmitting(false);
      setError('Payment did not complete. Please try again.');
      return;
    }
    try {
      await apiPost('/billing/payg/confirm-category-pass', { paymentIntentId, category });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="payg-checkout">
      <PaymentElement />
      {error && <div className="error-banner">{error}</div>}
      <div className="payg-actions">
        <button className="btn btn-flash" onClick={confirm} disabled={submitting || !stripe}>
          {submitting ? 'Confirming…' : 'Pay $1 & unlock'}
        </button>
        <button className="btn btn-outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// Fetches a fresh PaymentIntent to unlock a whole category for $1, renders Stripe's
// unified card/Apple Pay/Google Pay element, then confirms the pass server-side once
// paid. Calls onSuccess() with no arguments once the category is unlocked.
export default function PaygCheckout({ category, onSuccess, onCancel }) {
  const { currency } = useCurrency();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiPost('/billing/payg/unlock-category', { category, currency })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      })
      .catch((err) => setError(err.message));
  }, [category, currency]);

  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return <div className="error-banner">Payments aren't configured yet — add your Stripe keys to get this live.</div>;
  }
  if (error) return <div className="error-banner">{error}</div>;
  if (!clientSecret) return <p className="tool-help">Loading payment…</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <UnlockForm category={category} paymentIntentId={paymentIntentId} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
