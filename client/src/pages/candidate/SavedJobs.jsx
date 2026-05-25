import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getSavedJobs, unsaveJob } from '../../api/candidate';
import { Heart, MapPin, Calendar, Trash2, ArrowUpRight, HeartOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import SalaryRange from '../../components/SalaryRange';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';

const SavedJobs = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['candidateSavedJobsList'],
    queryFn: () => getSavedJobs()
  });

  const unsaveMutation = useMutation({
    mutationFn: (id) => unsaveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateSavedJobsList'] });
      queryClient.invalidateQueries({ queryKey: ['candidateSavedJobs'] });
      toast.success('Job removed from saved bookmarks');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unsave job');
    }
  });

  const savedJobs = data?.data || [];

  const handleUnsave = (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();
    unsaveMutation.mutate(jobId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Saved Jobs</h1>
        <p className="text-sm text-slate-400">Keep track of opportunities you want to apply for later.</p>
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={HeartOff}
          title="No bookmarked vacancies"
          description="Click the heart icon on job detail pages to save positions here."
          actionText="Browse Job Board"
          onActionClick={() => window.location.href = '/jobs'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((item) => {
            const job = item.jobId;
            if (!job) return null; // Handle deleted jobs gracefully
            
            return (
              <div
                key={item._id}
                className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48 relative group"
              >
                {/* Delete Bookmark button */}
                <button
                  onClick={(e) => handleUnsave(e, job._id)}
                  className="absolute top-4 right-4 p-2 rounded-full border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link to={`/jobs/${job._id}`} className="space-y-2 pr-8">
                  <div className="flex items-center space-x-3">
                    <Avatar src={job.companyId?.logo} name={job.companyId?.companyName} size="sm" />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                        {job.companyId?.companyName}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors truncate">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <Badge variant={job.jobType}>{job.jobType}</Badge>
                  </div>
                </Link>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <SalaryRange min={job.salary?.min} max={job.salary?.max} currency={job.salary?.currency} />
                  <span className="text-[10px] text-slate-400 font-medium">
                    Added: {new Date(item.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
