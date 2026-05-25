import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecruiterAnalytics } from '../../api/recruiter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, Users, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Skeleton from '../../components/Skeleton';

const COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#a855f7', '#10b981', '#ef4444'];

const Analytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiterAnalyticsDetails'],
    queryFn: getRecruiterAnalytics
  });

  const analytics = data?.data || {};

  const totalJobs = analytics.totalJobs || 0;
  const totalApplicants = analytics.totalApplicants || 0;
  const shortlistRate = analytics.shortlistRate || 0;
  
  const statusDistribution = analytics.statusDistribution || {};
  
  // Format data for PieChart
  const pieData = Object.keys(statusDistribution).map((key) => ({
    name: key.toUpperCase(),
    value: statusDistribution[key]
  })).filter(item => item.value > 0);

  // Format data for BarChart (Applications per job)
  const barData = analytics.applicationsPerJob || [];

  // Format data for Views per job
  const viewsData = analytics.viewsPerJob || [];

  const totalViews = viewsData.reduce((acc, curr) => acc + (curr.views || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
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
        <h1 className="text-3xl font-extrabold tracking-tight">Recruiting Analytics</h1>
        <p className="text-sm text-slate-400">Measure application trends, pipeline conversion stats, and reach metrics.</p>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          title="Total Positions"
          value={totalJobs}
        />
        <StatCard
          icon={Users}
          title="Total Applicants"
          value={totalApplicants}
        />
        <StatCard
          icon={Eye}
          title="Vacancy Views"
          value={totalViews}
        />
        <StatCard
          icon={CheckCircle2}
          title="Shortlist Ratio"
          value={`${shortlistRate}%`}
        />
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Applications per Job</h3>
          <div className="h-64">
            {barData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-24">No applications data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="title" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="applicants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Applicant Pipeline Stages</h3>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-24 w-full">No candidates in pipeline.</p>
            ) : (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-2 flex flex-col text-xs pl-4 font-semibold">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-400 font-bold leading-none">{entry.name}:</span>
                      <span className="text-slate-800 dark:text-slate-200">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Views Line/Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Job Views Count</h3>
          <div className="h-64">
            {viewsData.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-24">No views recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <XAxis dataKey="title" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#f8fafc'
                    }}
                  />
                  <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
