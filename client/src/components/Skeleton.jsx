import React from 'react';

const Skeleton = ({ variant = 'box', className = '' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-800 rounded';

  const variants = {
    box: 'w-full h-32',
    text: 'w-full h-4 rounded-md',
    title: 'w-2/3 h-6 rounded-md',
    avatar: 'w-10 h-10 rounded-full'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export default Skeleton;
