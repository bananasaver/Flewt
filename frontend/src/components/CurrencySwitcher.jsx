import { useCurrency } from '../context/CurrencyContext.jsx';

export default function CurrencySwitcher({ className = '' }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <select
      className={`currency-switcher ${className}`}
      value={currency}
      onChange={(e) => setCurrency(e.target.value)}
      aria-label="Currency"
    >
      <option value="USD">USD $</option>
      <option value="GBP">GBP £</option>
      <option value="EUR">EUR €</option>
    </select>
  );
}
