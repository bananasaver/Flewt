import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';

const LABELS = {
  payg: (symbol) => `${symbol}1 per run — you'll confirm payment just before this runs`,
  mid: () => 'Included in your Mid plan (up to 50 actions/month)',
  pro: () => 'Included — unlimited on your Pro plan',
};

// Wraps the "run this tool" step so every tool page enforces pricing the same way:
//   - signed out -> caller shows a sign-in/sign-up prompt instead of the tool
//   - payg       -> opens inline Stripe checkout for $1/£1/€1, then runs with the paymentIntentId
//   - mid/pro    -> runs immediately, billing handled server-side by plan
export function useActionGate() {
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingRun, setPendingRun] = useState(null);

  const priceLabel = user ? (LABELS[user.plan] || LABELS.payg)(symbol) : 'Sign in to use this tool';
  const needsAuth = !user;

  function gate(run) {
    if (!user) return;
    if (user.plan === 'payg') {
      setPendingRun(() => run);
      setShowCheckout(true);
    } else {
      run(null);
    }
  }

  function onPaid(paymentIntentId) {
    setShowCheckout(false);
    const run = pendingRun;
    setPendingRun(null);
    run?.(paymentIntentId);
  }

  function cancelCheckout() {
    setShowCheckout(false);
    setPendingRun(null);
  }

  return { user, needsAuth, priceLabel, showCheckout, gate, onPaid, cancelCheckout };
}
