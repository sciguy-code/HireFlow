import React from 'react';

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-16 h-16 text-xl font-semibold',
    xl: 'w-24 h-24 text-3xl font-semibold'
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center rounded-full overflow-hidden bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-slate-200 dark:border-slate-800 ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : null}
      <span className={src ? 'hidden' : ''}>{getInitials(name)}</span>
    </div>
  );
};

export default Avatar;
	
