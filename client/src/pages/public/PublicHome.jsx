import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '../../api/jobs';
import { Search, MapPin, Briefcase, Building, Users, ArrowRight } from 'lucide-react';
import Button from '../../components/Button';
import SalaryRange from '../../components/SalaryRange';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Skeleton from '../../components/Skeleton';

const PublicHome = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['featuredJobs'],
    queryFn: () => getJobs({ limit: 6 })
  });

  const featuredJobs = data?.data?.jobs || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.set('search', keyword);
    if (location) queryParams.set('location', location);
    navigate(`/jobs?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-16 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-16 space-y-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Find Your Next Dream Job on{' '}
          <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            HireFlow
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl">
          Discover top remote opportunities, connect with verified tech companies, and streamline your recruitment workflow in a few clicks.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="glass-card p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center space-x-2 px-3 flex-1 w-full border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-3 md:pb-0">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or skills..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-0 text-sm focus:outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center space-x-2 px-3 flex-1 w-full pb-3 md:pb-0">
            <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="City, state, or 'remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent border-0 text-sm focus:outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100"
            />
          </div>
          <Button type="submit" className="w-full md:w-auto px-6 py-2.5">
            Search Jobs
          </Button>
        </form>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold">12,450+</h4>
            <p className="text-xs text-slate-400">Total Active Jobs</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold">3,200+</h4>
            <p className="text-xs text-slate-400">Verified Companies</p>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-bold">8,900+</h4>
            <p className="text-xs text-slate-400">Successful Placements</p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="space-y-8">
        <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Featured Jobs</h2>
            <p className="text-sm text-slate-400">Hand-picked career openings posted recently.</p>
          </div>
          <Link to="/jobs" className="text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 text-sm font-semibold">
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : featuredJobs.length === 0 ? (
          <p className="text-slate-400 text-center py-10">No jobs posted recently. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="glass-card p-6 rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-52"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar src={job.companyId?.logo} name={job.companyId?.companyName || 'Company'} size="sm" />
                    <div>
                      <h4 className="text-xs text-slate-400 font-semibold">{job.companyId?.companyName}</h4>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{job.title}</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={job.jobType}>{job.jobType}</Badge>
                    <Badge variant="reviewed">{job.experienceLevel}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <SalaryRange min={job.salary?.min} max={job.salary?.max} currency={job.salary?.currency} />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
        <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-2xl font-bold">Are you a Job Seeker?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Build your professional candidate profile, upload your resume, track application stages in real-time, and get notified about career matches.
          </p>
          <Link to="/register?role=candidate" className="inline-block pt-2">
            <Button>Create Candidate Account</Button>
          </Link>
        </div>
        <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-gradient-to-br from-brand-500/5 to-indigo-500/5">
          <h3 className="text-2xl font-bold">Looking to Hire Talent?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create a company page, post active vacancies, manage candidate applications, customize applicant Kanban pipelines, and track job analytics.
          </p>
          <Link to="/register?role=recruiter" className="inline-block pt-2">
            <Button variant="secondary">Start Recruiting</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PublicHome;
