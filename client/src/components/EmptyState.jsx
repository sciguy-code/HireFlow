import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-sm mx-auto">
      {Icon && (
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && onActionClick && (
        <Button size="sm" onClick={onActionClick}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
