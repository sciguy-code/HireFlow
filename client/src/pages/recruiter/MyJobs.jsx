import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyJobs, deleteJob, updateJob } from '../../api/recruiter';
import { Edit, Trash2, Eye, Users, Calendar, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';

const MyJobs = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch jobs
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recruiterJobsList', activeTab, page],
    queryFn: () => getMyJobs({
      status: activeTab === 'all' ? '' : activeTab,
      page,
      limit: 10
    })
  });

  // Toggle open/closed mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, status }) => updateJob(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobsList'] });
      toast.success('Job status updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update job status');
    }
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobsList'] });
      toast.success('Job posting deleted successfully');
      setDeleteTargetId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete job posting');
      setDeleteTargetId(null);
    }
  });

  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    toggleMutation.mutate({ id: job._id, status: nextStatus });
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const jobs = data?.data?.jobs || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  const tabs = [
    { value: 'all', label: 'All Jobs' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Draft' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Job Vacancies</h1>
          <p className="text-sm text-slate-400">Track view hits, application counts, and publish status of your posted jobs.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button className="flex items-center space-x-1">
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveTab(tab.value);
              setPage(1);
            }}
            className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold border-b-2 focus:outline-none transition-all ${
              activeTab === tab.value
                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List / Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {jobs.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Briefcase}
              title={`No vacancies listed under "${activeTab}"`}
              description="Create a vacancy and select open publish configurations to start gathering applications."
              actionText="Post a Job"
              onActionClick={() => window.location.href = '/recruiter/jobs/new'}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                  <th className="p-4 pl-6">Job Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Applicants</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4">Date Posted</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="space-y-0.5">
                        <Link to={`/recruiter/jobs/${job._id}/applicants`} className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 transition-colors">
                          {job.title}
                        </Link>
                        <span className="block text-[10px] text-slate-400 font-normal">{job.location} • {job.jobType}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={job.status}>{job.status}</Badge>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      <Link to={`/recruiter/jobs/${job._id}/applicants`} className="hover:underline inline-flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        <span>{job.applicantCount}</span>
                      </Link>
                    </td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center">
                        <Eye className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {job.views}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-normal">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        title={job.status === 'open' ? 'Close job' : 'Open job'}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <Link to={`/recruiter/jobs/${job._id}/edit`}>
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-500 transition-colors"
                          title="Edit job details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteTargetId(job._id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete vacancy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation delete modal */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Vacancy"
        message="Are you sure you want to delete this job posting? All applicants records associated with this vacancy will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default MyJobs;
