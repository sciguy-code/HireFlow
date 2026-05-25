import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Sun, Moon, Briefcase, LogOut, User, Menu, X, CheckSquare } from 'lucide-react';
import Avatar from './Avatar';
import Button from './Button';

const Navbar = ({ toggleSidebar, showSidebarBtn = false }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className="glass-nav sticky top-0 z-40 w-full px-6 py-3 flex items-center justify-between border-b transition-colors duration-200">
      <div className="flex items-center space-x-4">
        {showSidebarBtn && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-600 text-white dark:bg-brand-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            HireFlow
          </span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/jobs" className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
          Browse Jobs
        </Link>

        {user ? (
          <>
            <Link to={getDashboardLink()} className="text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Dashboard
            </Link>

            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto z-50 py-2">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (!notif.read) markAsRead(notif._id);
                            if (notif.link) navigate(notif.link);
                            setShowNotifDropdown(false);
                          }}
                          className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-slate-100/50 dark:bg-slate-800/20' : ''
                          }`}
                        >
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {user ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <Avatar src={user.profilePhoto} name={user.name} size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-none">{user.name}</span>
              <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      <div className="flex items-center space-x-3 md:hidden">
        <button
          onClick={() => setDark(!dark)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          {dark ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 glass-card mx-6 p-4 rounded-xl shadow-2xl flex flex-col space-y-4 md:hidden border z-50">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Browse Jobs
          </Link>
          {user ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar src={user.profilePhoto} name={user.name} size="sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-semibold">Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="ghost" size="sm" className="w-full">Login</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
