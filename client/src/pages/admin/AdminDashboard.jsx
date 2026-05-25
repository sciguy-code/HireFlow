import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminStats, getUsers, toggleApproveRecruiter } from '../../api/admin';
import { Users, Briefcase, FileText, CheckCircle2, ShieldCheck, UserMinus, UserCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import Skeleton from '../../components/Skeleton';
import Avatar from '../../components/Avatar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch admin stats
  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats
  });

  // Fetch recruiters to show pending approvals
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['adminRecruitersList'],
    queryFn: () => getUsers({ role: 'recruiter', limit: 100 })
  });

  const stats = statsRes?.data || {};
  const users = usersRes?.data?.users || [];
  
  const pendingRecruiters = users.filter(u => !u.isApproved);

  const approveMutation = useMutation({
    mutationFn: (id) => toggleApproveRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminRecruitersList'] });
      toast.success('Recruiter account status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  const loading = statsLoading || usersLoading;

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
        <p className="text-sm text-slate-400 font-medium">Moderate platform registrations, job vacancy listings, and monitor metrics.</p>
      </div>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Platform Users"
          value={stats.users?.total || 0}
        />
        <StatCard
          icon={Briefcase}
          title="Active Positions"
          value={stats.jobs || 0}
        />
        <StatCard
          icon={FileText}
          title="Total Applications"
          value={stats.applications || 0}
        />
        <StatCard
          icon={ShieldCheck}
          title="Weekly New Registrations"
          value={stats.newUsersThisWeek || 0}
        />
      </section>

      {/* Charts / Approvals grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User registrations chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">New Sign-Ups (Last 30 Days)</h3>
          <div className="h-64">
            {(!stats.usersChartData || stats.usersChartData.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-24">No signups data registered in the last month.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.usersChartData}>
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
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg flex items-center space-x-1.5">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Pending Approvals</span>
          </h3>
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 space-y-4 max-h-72 overflow-y-auto">
            {pendingRecruiters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">All recruiter accounts verified.</p>
            ) : (
              pendingRecruiters.map((rec) => (
                <div key={rec._id} className="flex items-center justify-between pt-4 first:pt-0 gap-3">
                  <div className="flex items-center space-x-2">
                    <Avatar src={rec.profilePhoto} name={rec.name} size="sm" />
                    <div className="text-xs truncate max-w-[120px]">
                      <h5 className="font-bold truncate">{rec.name}</h5>
                      <span className="text-[10px] text-slate-400 block truncate">{rec.email}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="py-1 px-3 text-[11px]"
                    onClick={() => approveMutation.mutate(rec._id)}
                    loading={approveMutation.isPending}
                  >
                    Approve
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
