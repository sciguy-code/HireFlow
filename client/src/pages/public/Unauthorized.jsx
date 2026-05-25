import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full animate-bounce">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Access Denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You do not have the required permissions to view this panel. If you think this is a mistake, please contact support.
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

export default Unauthorized;
