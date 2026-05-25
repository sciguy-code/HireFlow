import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile, getCandidateApplications, getSavedJobs } from '../../api/candidate';
import { FileText, Heart, Calendar, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';

const CandidateDashboard = () => {
  const { user } = useAuth();

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => getCandidateProfile()
  });

  const { data: appsRes, isLoading: appsLoading } = useQuery({
    queryKey: ['candidateApplications'],
    queryFn: () => getCandidateApplications()
  });

  const { data: savedRes, isLoading: savedLoading } = useQuery({
    queryKey: ['candidateSavedJobs'],
    queryFn: () => getSavedJobs()
  });

  const profile = profileRes?.data || {};
  const applications = appsRes?.data || [];
  const savedJobs = savedRes?.data || [];

  const profileComplete = profile.profileComplete || 0;
  const totalApps = applications.length;
  const totalInterviews = applications.filter(a => a.status === 'interview').length;
  const totalSaved = savedJobs.length;
  const recentApps = applications.slice(0, 5);

  const statsLoading = profileLoading || appsLoading || savedLoading;

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name}!</h1>
          <p className="text-sm text-slate-400">Here is a quick glance at your career hunt activity.</p>
        </div>
        <Link to="/candidate/profile">
          <Button variant="secondary" size="sm">Edit Profile</Button>
        </Link>
      </div>

      {/* Profile Complete Alert */}
      {profileComplete < 80 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-start space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Complete your profile to stand out!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your profile is only <span className="font-bold">{profileComplete}%</span> complete. Recruiters are 4x more likely to view candidates with completed details (bio, experience, and uploaded resume).
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: `${profileComplete}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FileText}
          title="Applications Sent"
          value={totalApps}
        />
        <StatCard
          icon={UserCheck}
          title="Interviews Set"
          value={totalInterviews}
        />
        <StatCard
          icon={Heart}
          title="Saved Jobs"
          value={totalSaved}
        />
      </section>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <h3 className="font-bold text-lg">Recent Applications</h3>
            <Link to="/candidate/applications" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5">
              <span>All Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
            {recentApps.length === 0 ? (
              <div className="text-center py-10 glass-card rounded-2xl p-6 border">
                <p className="text-xs text-slate-400">You haven't applied for any jobs yet.</p>
                <Link to="/jobs" className="mt-3 inline-block">
                  <Button size="sm">Search Jobs</Button>
                </Link>
              </div>
            ) : (
              recentApps.map((app) => (
                <div key={app._id} className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm hover:text-brand-500 transition-colors">
                      <Link to={`/jobs/${app.jobId?._id}`}>{app.jobId?.title || 'Unknown Title'}</Link>
                    </h4>
                    <p className="text-xs text-slate-400">{app.jobId?.companyId?.companyName || 'Company'}</p>
                    <span className="text-[10px] text-slate-400 block flex items-center mt-1">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Jobs Quicklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
            <h3 className="font-bold text-lg">Bookmarks</h3>
            <Link to="/candidate/saved" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-0.5">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {savedJobs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No saved jobs yet.</p>
            ) : (
              savedJobs.slice(0, 3).map((saved) => (
                <Link
                  key={saved._id}
                  to={`/jobs/${saved.jobId?._id}`}
                  className="block glass-card p-4 rounded-xl border hover:border-brand-300 dark:hover:border-brand-800 transition-colors"
                >
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{saved.jobId?.title}</h4>
                  <p className="text-[10px] text-slate-400">{saved.jobId?.companyId?.companyName}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
