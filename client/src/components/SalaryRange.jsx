import React from 'react';

const SalaryRange = ({ min, max, currency = 'USD', className = '' }) => {
  const formatAmount = (num) => {
    if (!num) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toLocaleString();
  };

  const getCurrencySymbol = (curr) => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    return symbols[curr] || curr + ' ';
  };

  if (!min && !max) {
    return <span className={`text-slate-400 ${className}`}>Unspecified</span>;
  }

  const symbol = getCurrencySymbol(currency);

  return (
    <span className={`font-semibold text-brand-600 dark:text-brand-400 ${className}`}>
      {symbol}
      {formatAmount(min)} - {symbol}
      {formatAmount(max)} <span className="text-xs font-normal text-slate-400 uppercase">{currency}</span>
    </span>
  );
};

export default SalaryRange;
