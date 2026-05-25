import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldAlert } from 'lucide-react';

const ApprovedGuard = ({ children }) => {
  const { user } = useAuth();

  if (user && user.role === 'recruiter' && !user.isApproved) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Account Pending Approval</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Your recruiter profile is currently under review by our administrative team. You will receive an email confirmation once approved.
            </p>
          </div>
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-start space-x-3 text-left">
            <ShieldAlert className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              During this time, you can still edit your company details, upload your corporate logo, or preview candidate settings. Posting jobs requires full approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ApprovedGuard;
