import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { apiGet } from '../api.js';

const CATEGORY_LABELS = {
  'pdf-management': 'PDF Management',
  'document-management': 'Document Management',
  'speech-to-text': 'Speech to Text',
  'image-tools': 'Image Tools',
};

// Gates a tool behind the current pricing model for one category:
//   - signed out -> caller shows a sign-in/sign-up prompt
//   - pro        -> always allowed
//   - mid        -> allowed up to the monthly cap (server enforces the real limit)
//   - payg       -> allowed only while an active $1 pass for THIS category exists;
//                   otherwise shows an "unlock this category for $1" prompt
export function useActionGate(category) {
  const { user } = useAuth();
  const { symbol } = useCurrency();
  const [passExpiresAt, setPassExpiresAt] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [pendingRun, setPendingRun] = useState(null);

  const refreshPass = useCallback(async () => {
    if (!user || user.plan !== 'payg' || !category) {
      setCheckingAccess(false);
      return;
    }
    try {
      const { passes } = await apiGet('/billing/passes');
      const active = passes.find((p) => p.category === category);
      setPassExpiresAt(active ? active.expires_at : null);
    } catch {
      setPassExpiresAt(null);
    } finally {
      setCheckingAccess(false);
    }
  }, [user, category]);

  useEffect(() => {
    refreshPass();
  }, [refreshPass]);

  const needsAuth = !user;
  const hasAccess = user && (user.plan === 'pro' || user.plan === 'mid' || (user.plan === 'payg' && !!passExpiresAt));

  const categoryLabel = CATEGORY_LABELS[category] || 'this category';
  const priceLabel = !user
    ? 'Sign in to use this tool'
    : user.plan === 'pro'
    ? 'Included — unlimited on your Pro plan'
    : user.plan === 'mid'
    ? 'Included in your Mid plan (up to 50 actions/month)'
    : passExpiresAt
    ? `Unlocked — access to ${categoryLabel} until ${new Date(passExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `Unlock all of ${categoryLabel} for ${symbol}1`;

  function gate(run) {
    if (!user) return;
    if (hasAccess) {
      run();
    } else {
      setPendingRun(() => run);
      setShowUnlock(true);
    }
  }

  async function onUnlocked() {
    setShowUnlock(false);
    await refreshPass();
    const run = pendingRun;
    setPendingRun(null);
    run?.();
  }

  function cancelUnlock() {
    setShowUnlock(false);
    setPendingRun(null);
  }

  return {
    user,
    needsAuth,
    hasAccess,
    checkingAccess,
    priceLabel,
    showUnlock,
    gate,
    onUnlocked,
    cancelUnlock,
    categoryLabel,
  };
}
