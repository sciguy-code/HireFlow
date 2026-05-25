import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendDirection = 'up',
  className = ''
}) => {
  return (
    <div className={`glass-card p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between ${className}`}>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </span>
          {trend !== undefined && (
            <span
              className={`inline-flex items-center text-xs font-semibold ${
                trendDirection === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trendDirection === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend}
            </span>
          )}
        </div>
      </div>
      {Icon && (
        <div className="p-3.5 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
