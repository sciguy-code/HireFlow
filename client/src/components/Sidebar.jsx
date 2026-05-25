import React from 'react';
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

const Sidebar = ({ role }) => {
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

  const activeClasses = 'flex items-center space-x-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-semibold border border-brand-100/50 dark:border-brand-900/40 shadow-sm';
  const inactiveClasses = 'flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 font-medium transition-all';

  const currentLinks = links[role] || [];

  return (
    <aside className="w-64 glass-card h-[calc(100vh-64px)] hidden lg:flex flex-col p-4 space-y-2 border-r select-none transition-colors duration-200">
      <div className="flex flex-col space-y-1">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
