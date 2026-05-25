import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCandidateApplications } from '../../api/candidate';
import { withdrawApplication } from '../../api/applications';
import { Calendar, Building, ChevronDown, ChevronUp, AlertCircle, FileSpreadsheet, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const MyApplications = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch applications
  const { data, isLoading } = useQuery({
    queryKey: ['candidateApplicationsList'],
    queryFn: () => getCandidateApplications()
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateApplicationsList'] });
      queryClient.invalidateQueries({ queryKey: ['candidateApplications'] });
      toast.success('Application withdrawn successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
    }
  });

  const applications = data?.data || [];

  const handleWithdraw = (e, appId) => {
    e.stopPropagation(); // Avoid expanding card
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawMutation.mutate(appId);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const tabs = [
    { value: 'all', label: 'All Applications' },
    { value: 'applied', label: 'Applied' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interviews' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredApps = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-sm text-slate-400">Track the interview and hiring status of jobs you applied for.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = tab.value === 'all'
            ? applications.length
            : applications.filter(a => a.status === tab.value).length;
          
          return (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setExpandedId(null);
              }}
              className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold border-b-2 focus:outline-none transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                isActive ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title={`No applications under "${activeTab}"`}
            description="You don't have any application logs filed in this category yet."
            actionText="Browse Open Vacancies"
            onActionClick={() => window.location.href = '/jobs'}
          />
        ) : (
          filteredApps.map((app) => {
            const isExpanded = expandedId === app._id;
            const hasRecruiterNote = !!app.recruiterNote;
            
            return (
              <div
                key={app._id}
                onClick={() => toggleExpand(app._id)}
                className={`glass-card rounded-2xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'border-brand-300 dark:border-brand-800 ring-1 ring-brand-300/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex-shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {app.jobId?.title || 'Job Posting Removed'}
                      </h3>
                      <p className="text-xs text-slate-400">{app.jobId?.companyId?.companyName || 'Company'}</p>
                      <span className="text-[10px] text-slate-400 flex items-center pt-1">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <Badge variant={app.status}>{app.status}</Badge>

                    {app.status === 'applied' && (
                      <button
                        onClick={(e) => handleWithdraw(e, app._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        title="Withdraw Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <span className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wide">Resume Link</span>
                        <p className="mt-1">
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Download Resume PDF</span>
                          </a>
                        </p>
                      </div>

                      {app.coverLetter && (
                        <div>
                          <span className="font-semibold text-slate-400 uppercase tracking-wide">Cover Letter</span>
                          <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            {app.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>

                    {hasRecruiterNote && (
                      <div className="p-3 bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-950 rounded-xl space-y-1">
                        <span className="font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">Recruiter Response Note</span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {app.recruiterNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyApplications;
