import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../../api/admin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { BarChart3, Users, Briefcase, Eye, AlertCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';

const AdminAnalytics = () => {
  const { data: statsRes, isLoading, isError } = useQuery({
    queryKey: ['adminAnalyticsStats'],
    queryFn: getAdminStats
  });

  const stats = statsRes?.data || {};

  const userStats = stats.users || {};
  const totalUsers = userStats.total || 0;
  const totalJobs = stats.jobs || 0;
  const totalApplications = stats.applications || 0;
  const applicationRate = stats.applicationRate || 0;

  // Chart data
  const usersChartData = stats.usersChartData || [];
  const topCompanies = stats.topCompanies || [];
  const topJobs = stats.topJobs || [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center space-x-3 text-red-500 bg-red-50 p-4 rounded-xl border max-w-xl mx-auto mt-12">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">Failed to retrieve analytics. Please verify server connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-slate-400">Monitor platform-wide recruitment metrics, corporate activity, and candidate sign-up trends.</p>
      </div>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Platform Users"
          value={totalUsers}
        />
        <StatCard
          icon={Briefcase}
          title="Active Openings"
          value={totalJobs}
        />
        <StatCard
          icon={Eye}
          title="Total Applications"
          value={totalApplications}
        />
        <StatCard
          icon={BarChart3}
          title="Applications / Job"
          value={applicationRate}
        />
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Growth Line Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Candidate & Recruiter Sign-Ups (Last 30 Days)</h3>
          <div className="h-72">
            {usersChartData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-28">No signup logs registered.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usersChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top companies by applicant count */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Top Recruiters (By Applicants)</h3>
          <div className="h-64">
            {topCompanies.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-24">No applications registered yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCompanies} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="companyName" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="applicants" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top jobs by views */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Popular Postings (By Views)</h3>
          <div className="h-64">
            {topJobs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-24">No vacancies viewed yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topJobs} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="title" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
