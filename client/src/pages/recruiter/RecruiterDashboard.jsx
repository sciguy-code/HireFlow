import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getRecruiterAnalytics, getMyJobs } from '../../api/recruiter';
import { Briefcase, Users, CheckCircle2, UserCheck, Calendar, ArrowRight, PlusCircle, LayoutList } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

const RecruiterDashboard = () => {
  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['recruiterAnalytics'],
    queryFn: getRecruiterAnalytics
  });

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiterJobsList'],
    queryFn: () => getMyJobs({ limit: 5 })
  });

  const analytics = analyticsRes?.data || {};
  const recentJobs = jobsRes?.data?.jobs || [];

  const totalJobs = analytics.totalJobs || 0;
  const totalApplicants = analytics.totalApplicants || 0;
  const shortlistRate = analytics.shortlistRate || 0;
  const statusDist = analytics.statusDistribution || {};
  const totalInterviews = statusDist.interview || 0;

  const loading = analyticsLoading || jobsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium">Post openings, track candidates, and moderate applicant pipelines.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/recruiter/jobs/new">
            <Button className="flex items-center space-x-1">
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title="Active Positions"
          value={totalJobs}
        />
        <StatCard
          icon={Users}
          title="Total Applicants"
          value={totalApplicants}
        />
        <StatCard
          icon={CheckCircle2}
          title="Shortlist Rate"
          value={`${shortlistRate}%`}
        />
        <StatCard
          icon={UserCheck}
          title="Interviews Set"
          value={totalInterviews}
        />
      </section>

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Jobs Table / List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <h3 className="font-bold text-lg">My Postings</h3>
            <Link to="/recruiter/jobs" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5">
              <span>Manage Postings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
            {recentJobs.length === 0 ? (
              <div className="text-center py-10 glass-card p-6 border rounded-2xl">
                <p className="text-xs text-slate-400">You haven't posted any job vacancies yet.</p>
                <Link to="/recruiter/jobs/new" className="mt-3 inline-block">
                  <Button size="sm">Create a Job</Button>
                </Link>
              </div>
            ) : (
              recentJobs.map((job) => (
                <div key={job._id} className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm hover:text-brand-500 transition-colors">
                      <Link to={`/recruiter/jobs/${job._id}/applicants`}>{job.title}</Link>
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.jobType}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block flex items-center pt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Posted on: {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-brand-600 dark:text-brand-400">{job.applicantCount}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Applicants</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Utilities sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <h3 className="font-bold text-lg">Shortcut Actions</h3>
          </div>
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <Link to="/recruiter/pipeline" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition-colors font-medium">
              <span className="text-xs">ATS Pipeline Board</span>
              <LayoutList className="w-4 h-4 text-slate-400" />
            </Link>
            <Link to="/recruiter/company" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition-colors font-medium">
              <span className="text-xs">Setup Company Page</span>
              <Building className="w-4 h-4 text-slate-400" />
            </Link>
            <Link to="/recruiter/analytics" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 transition-colors font-medium">
              <span className="text-xs">Detailed Analytics</span>
              <BarChart2 className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;
