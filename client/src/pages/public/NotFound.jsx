import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-full animate-pulse">
        <HelpCircle className="w-12 h-12" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Page Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The link you followed may be broken, or the page may have been moved or deleted.
        </p>
      </div>
      <Link to="/">
        <Button variant="secondary" className="flex items-center space-x-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
