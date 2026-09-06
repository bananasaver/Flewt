import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';
import { apiPost } from '../api.js';

// Publishable key is safe to expose client-side. Set it via Vite env at build time.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// One button that shows Apple Pay, Google Pay, or a card sheet — whichever the
// visitor's browser/device supports — for a fast, one-tap Pro purchase.
function QuickPayInner({ amountCents, label, onSuccess }) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label, amount: amountCents },
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });

    pr.on('paymentmethod', async (ev) => {
      try {
        const { clientSecret } = await apiPost('/billing/create-payment-intent', {
          amount: amountCents,
        });
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (error) {
          ev.complete('fail');
          return;
        }
        ev.complete('success');
        if (paymentIntent.status === 'requires_action') {
          await stripe.confirmCardPayment(clientSecret);
        }
        onSuccess?.();
      } catch (err) {
        ev.complete('fail');
      }
    });
  }, [stripe, amountCents, label]);

  if (!paymentRequest) return null; // Apple Pay / Google Pay not available on this device/browser

  return <PaymentRequestButtonElement options={{ paymentRequest }} />;
}

export default function QuickPayButton(props) {
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) return null;
  return (
    <Elements stripe={stripePromise}>
      <QuickPayInner {...props} />
    </Elements>
  );
}
