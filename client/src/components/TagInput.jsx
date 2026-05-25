import React, { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({
  label,
  value = [],
  onChange,
  placeholder = 'Add and press Enter...',
  className = '',
  required
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !value.includes(val)) {
        onChange([...value, val]);
        setInputValue('');
      }
    }
  };

  const handleRemove = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      )}
      <div className="flex flex-wrap gap-2 p-2 min-h-10 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-colors">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 text-xs font-medium border border-brand-100 dark:border-brand-900"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="ml-1.5 p-0.5 rounded hover:bg-brand-200 dark:hover:bg-brand-900 text-brand-500 hover:text-brand-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TagInput;
