import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs } from '../../api/jobs';
import { getSavedJobs, saveJob, unsaveJob } from '../../api/candidate';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Heart,
  ChevronDown,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/Button';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import SalaryRange from '../../components/SalaryRange';
import Skeleton from '../../components/Skeleton';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';

const JobsListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Search / filter states from URL query parameters
  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const jobType = searchParams.get('jobType') || '';
  const experienceLevel = searchParams.get('experienceLevel') || '';
  const salaryMin = searchParams.get('salaryMin') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1');

  // Local inputs
  const [keywordInput, setKeywordInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);
  const [minSalaryInput, setMinSalaryInput] = useState(salaryMin);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setKeywordInput(search);
    setLocationInput(location);
    setMinSalaryInput(salaryMin);
  }, [search, location, salaryMin]);

  // Query jobs list
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobs', search, location, jobType, experienceLevel, salaryMin, sort, page],
    queryFn: () => getJobs({
      search,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      sort,
      page,
      limit: 10
    })
  });

  // Query saved jobs for candidate
  const { data: savedJobsData } = useQuery({
    queryKey: ['savedJobsList'],
    queryFn: () => getSavedJobs(),
    enabled: !!(user && user.role === 'candidate')
  });

  const savedJobIds = (savedJobsData?.data || []).map(item => item.jobId?._id);

  // Mutations to save/unsave
  const saveMutation = useMutation({
    mutationFn: (id) => saveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobsList'] });
      toast.success('Job saved successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save job');
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: (id) => unsaveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobsList'] });
      toast.success('Job unsaved successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to unsave job');
    }
  });

  const handleFilterChange = (key, val) => {
    const nextParams = new URLSearchParams(searchParams);
    if (val) {
      nextParams.set(key, val);
    } else {
      nextParams.delete(key);
    }
    nextParams.set('page', '1'); // Reset page
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    
    if (keywordInput) nextParams.set('search', keywordInput);
    else nextParams.delete('search');
    
    if (locationInput) nextParams.set('location', locationInput);
    else nextParams.delete('location');

    if (minSalaryInput) nextParams.set('salaryMin', minSalaryInput);
    else nextParams.delete('salaryMin');

    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setShowMobileFilters(false);
  };

  const clearAllFilters = () => {
    setKeywordInput('');
    setLocationInput('');
    setMinSalaryInput('');
    setSearchParams({});
  };

  const toggleSaveJob = (jobId) => {
    if (!user) {
      toast.error('Please log in as a candidate to save jobs');
      return;
    }
    if (savedJobIds.includes(jobId)) {
      unsaveMutation.mutate(jobId);
    } else {
      saveMutation.mutate(jobId);
    }
  };

  const jobsList = data?.data?.jobs || [];
  const totalPages = data?.data?.pages || 1;

  const jobTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote Only' }
  ];

  const experienceOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      {/* Header and Mobile Filter Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Search Vacancies</h1>
          <p className="text-sm text-slate-400">Discover and apply to verified career opportunities.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>
          
          <Select
            value={sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-40"
            options={[
              { value: 'latest', label: 'Newest First' },
              { value: 'salary', label: 'Highest Salary' }
            ]}
          />
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Sidebar Filters (Desktop) */}
        <aside className="w-64 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 hidden md:block shrink-0">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-sm tracking-wide uppercase text-slate-500">Refine Search</span>
            <button onClick={clearAllFilters} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              Clear All
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Keyword</span>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Title or skill..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</span>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="City or 'remote'..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="pl-9 pr-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Type</span>
              <Select
                value={jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                options={jobTypeOptions}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience Level</span>
              <Select
                value={experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                options={experienceOptions}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Salary (USD)</span>
              <input
                type="number"
                placeholder="e.g. 80000"
                value={minSalaryInput}
                onChange={(e) => setMinSalaryInput(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <Button type="submit" className="w-full">
              Apply Filters
            </Button>
          </form>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowMobileFilters(false)} />
            <div className="relative flex flex-col w-72 bg-white dark:bg-slate-900 h-full p-6 border-r shadow-2xl overflow-y-auto animate-slide-right">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <span className="font-bold text-sm">Refine Search</span>
                <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Keyword</span>
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</span>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Type</span>
                  <Select value={jobType} onChange={(e) => handleFilterChange('jobType', e.target.value)} options={jobTypeOptions} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience Level</span>
                  <Select value={experienceLevel} onChange={(e) => handleFilterChange('experienceLevel', e.target.value)} options={experienceOptions} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Min Salary</span>
                  <input
                    type="number"
                    value={minSalaryInput}
                    onChange={(e) => setMinSalaryInput(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-100 placeholder-slate-400"
                  />
                </div>
                <Button type="submit" className="w-full">Apply Filters</Button>
                <button type="button" onClick={clearAllFilters} className="w-full text-center text-xs text-slate-400 hover:underline">Clear Filters</button>
              </form>
            </div>
          </div>
        )}

        {/* Jobs List Grid Area */}
        <div className="flex-1 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-44 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center space-x-3 text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Failed to connect to search database. Check backend connection.</p>
            </div>
          ) : jobsList.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No open postings found"
              description="No current listings match your search criteria. Try removing filters or adjusting keywords."
              actionText="Reset Search"
              onActionClick={clearAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobsList.map((job) => {
                  const isSaved = savedJobIds.includes(job._id);
                  return (
                    <div
                      key={job._id}
                      className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all duration-200 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-52 relative group"
                    >
                      {/* Save Job Toggle */}
                      {(!user || user.role === 'candidate') && (
                        <button
                          onClick={() => toggleSaveJob(job._id)}
                          className={`absolute top-4 right-4 p-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                            isSaved ? 'text-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'text-slate-400'
                          }`}
                        >
                          <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      )}

                      <Link to={`/jobs/${job._id}`} className="space-y-3 cursor-pointer">
                        <div className="flex items-start space-x-3 pr-8">
                          <Avatar src={job.companyId?.logo} name={job.companyId?.companyName || 'Company'} size="sm" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                              {job.companyId?.companyName}
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            <span className="text-xs text-slate-400 flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              {job.location}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <Badge variant={job.jobType}>{job.jobType}</Badge>
                          <Badge variant="reviewed">{job.experienceLevel}</Badge>
                        </div>
                      </Link>

                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                        <SalaryRange min={job.salary?.min} max={job.salary?.max} currency={job.salary?.currency} />
                        <span className="text-[10px] text-slate-400 font-medium flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => handleFilterChange('page', p.toString())}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsListing;
