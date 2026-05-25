import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  Heart,
  Building,
  PlusCircle,
  Briefcase,
  GitPullRequest,
  BarChart2,
  Users,
  ShieldCheck
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const links = {
    candidate: [
      { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/candidate/profile', label: 'My Profile', icon: User },
      { to: '/candidate/applications', label: 'Applications', icon: FileText },
      { to: '/candidate/saved', label: 'Saved Jobs', icon: Heart }
    ],
    recruiter: [
      { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/recruiter/company', label: 'Company Profile', icon: Building },
      { to: '/recruiter/jobs/new', label: 'Post a Job', icon: PlusCircle },
      { to: '/recruiter/jobs', label: 'Manage Jobs', icon: Briefcase },
      { to: '/recruiter/pipeline', label: 'Pipeline Board', icon: GitPullRequest },
      { to: '/recruiter/analytics', label: 'Analytics', icon: BarChart2 }
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'Users Table', icon: Users },
      { to: '/admin/jobs', label: 'Jobs Moderation', icon: ShieldCheck },
      { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart2 }
    ]
  };

  const currentLinks = links[user.role] || [];
  const activeClasses = 'flex items-center space-x-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-semibold border border-brand-100/50 dark:border-brand-900/40';
  const inactiveClasses = 'flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 font-medium transition-all';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar showSidebarBtn={true} toggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      
      <div className="flex flex-1 relative">
        <Sidebar role={user.role} />

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex flex-col w-64 max-w-xs bg-white dark:bg-slate-900 h-full p-4 border-r border-slate-200 dark:border-slate-800 shadow-2xl animate-slide-right">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="font-bold uppercase tracking-wider text-xs text-slate-400">Navigation</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col space-y-1">
                {currentLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
