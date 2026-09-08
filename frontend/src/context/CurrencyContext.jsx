import { createContext, useContext, useState, useMemo } from 'react';

const CurrencyContext = createContext(null);

const SYMBOLS = { USD: '$', GBP: '£', EUR: '€' };

function detectCurrency() {
  const stored = localStorage.getItem('flewt_currency');
  if (stored && SYMBOLS[stored]) return stored;

  const locale = navigator.language || 'en-US';
  if (locale.includes('GB')) return 'GBP';
  if (/^(de|fr|es|it|nl|pt|ie|pl|be|at|fi|gr)/i.test(locale) || locale.includes('EU')) return 'EUR';
  return 'USD';
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(detectCurrency);

  const setCurrency = (c) => {
    setCurrencyState(c);
    localStorage.setItem('flewt_currency', c);
  };

  const value = useMemo(
    () => ({ currency, setCurrency, symbol: SYMBOLS[currency] || '$' }),
    [currency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
