import React from 'react';

const Spinner = ({ size = 'md', color = 'brand' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    brand: 'border-brand-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-slate-300 dark:border-slate-700 border-t-transparent'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
