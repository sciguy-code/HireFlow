import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminJobs, updateJobStatusByAdmin, deleteJobByAdmin } from '../../api/admin';
import { Search, ShieldAlert, Trash2, CheckCircle2, Lock, Eye, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';

const JobsModeration = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch admin jobs
  const { data, isLoading } = useQuery({
    queryKey: ['adminJobsList', status, search, page],
    queryFn: () => getAdminJobs({
      status,
      search,
      page,
      limit: 10
    })
  });

  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => updateJobStatusByAdmin(id, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Job posting status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteJobByAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminJobsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Job posting deleted successfully');
      setDeleteTargetId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Delete failed');
      setDeleteTargetId(null);
    }
  });

  const handleToggleStatus = (job) => {
    const nextStatus = job.status === 'open' ? 'closed' : 'open';
    toggleMutation.mutate({ id: job._id, nextStatus });
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const jobsList = data?.data?.jobs || [];
  const totalPages = data?.data?.pages || 1;

  const statusOptions = [
    { value: '', label: 'All Vacancy Status' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'draft', label: 'Draft' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Jobs Moderation</h1>
        <p className="text-sm text-slate-400 font-medium">Verify role listings, suspend listings, and oversee recruiter postings.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={statusOptions}
          className="w-full md:w-48"
        />
      </div>

      {/* Jobs list table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        ) : jobsList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ShieldAlert}
              title="No postings found"
              description="No vacancies match your moderation criteria."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                  <th className="p-4 pl-6">Job Post</th>
                  <th className="p-4">Recruiter / Company</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Applicants</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 pr-6 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {jobsList.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{job.title}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{job.location} • {job.jobType}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{job.companyId?.companyName || 'Company'}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{job.postedBy?.name || 'Recruiter'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={job.status}>{job.status}</Badge>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center">
                        <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {job.applicantCount}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      <span className="inline-flex items-center">
                        <Eye className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {job.views}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${
                          job.status === 'open'
                            ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                            : 'text-brand-500 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/20'
                        } py-1 text-[10px]`}
                        onClick={() => handleToggleStatus(job)}
                        loading={toggleMutation.isPending}
                      >
                        {job.status === 'open' ? 'Close Listing' : 'Open Listing'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-1 text-[10px]"
                        onClick={() => setDeleteTargetId(job._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vacancy Listing"
        message="Are you sure you want to delete this job posting? It will be permanently removed from the public job board, and all associated candidate applications will be deleted."
        confirmText="Delete Posting"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default JobsModeration;
