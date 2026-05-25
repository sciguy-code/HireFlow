import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, toggleBlockUser, toggleApproveRecruiter } from '../../api/admin';
import { Search, ShieldAlert, UserCheck, Ban, Unlock, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const UsersTable = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isBlocked, setIsBlocked] = useState('');
  const [page, setPage] = useState(1);

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['adminUsersList', role, isBlocked, search, page],
    queryFn: () => getUsers({
      role,
      isBlocked,
      search,
      page,
      limit: 10
    })
  });

  // Block/unblock mutation
  const blockMutation = useMutation({
    mutationFn: (id) => toggleBlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('User account status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  // Approve recruiter mutation
  const approveMutation = useMutation({
    mutationFn: (id) => toggleApproveRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Recruiter account status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  const usersList = data?.data?.users || [];
  const totalPages = data?.data?.pages || 1;

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'candidate', label: 'Candidate' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'admin', label: 'Admin' }
  ];

  const blockedOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Blocked Only' },
    { value: 'false', label: 'Active Only' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Users</h1>
        <p className="text-sm text-slate-400 font-medium">Verify recruiters, toggle suspension logs, and monitor all platform accounts.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto shrink-0">
          <Select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            options={roleOptions}
            className="w-full md:w-36"
          />
          <Select
            value={isBlocked}
            onChange={(e) => {
              setIsBlocked(e.target.value);
              setPage(1);
            }}
            options={blockedOptions}
            className="w-full md:w-36"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10" />
            ))}
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Users}
              title="No platform accounts found"
              description="No user registrations match your filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider">
                  <th className="p-4 pl-6">Full Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Moderator actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {usersList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center space-x-3">
                        <Avatar src={usr.profilePhoto} name={usr.name} size="sm" />
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{usr.name}</h4>
                          <span className="block text-[10px] text-slate-400 font-normal">{usr.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize text-slate-700 dark:text-slate-300">
                      {usr.role}
                    </td>
                    <td className="p-4">
                      {usr.isBlocked ? (
                        <Badge variant="rejected">Blocked</Badge>
                      ) : usr.role === 'recruiter' && !usr.isApproved ? (
                        <Badge variant="shortlisted">Pending Approval</Badge>
                      ) : (
                        <Badge variant="open">Active</Badge>
                      )}
                    </td>
                    <td className="p-4 text-slate-400 font-normal">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      {/* Recruiter Approve trigger */}
                      {usr.role === 'recruiter' && !usr.isApproved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 py-1 text-[10px]"
                          onClick={() => approveMutation.mutate(usr._id)}
                          loading={approveMutation.isPending}
                        >
                          Verify Account
                        </Button>
                      )}

                      {/* Block / suspend trigger */}
                      {usr.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`${
                            usr.isBlocked
                              ? 'text-brand-500 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/20'
                              : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                          } py-1 text-[10px]`}
                          onClick={() => blockMutation.mutate(usr._id)}
                          loading={blockMutation.isPending}
                        >
                          {usr.isBlocked ? 'Activate' : 'Suspend'}
                        </Button>
                      )}
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
    </div>
  );
};

export default UsersTable;
