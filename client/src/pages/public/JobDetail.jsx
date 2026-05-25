import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobById, getJobs } from '../../api/jobs';
import { saveJob, unsaveJob } from '../../api/candidate';
import { applyToJob, withdrawApplication } from '../../api/applications';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import toast from 'react-hot-toast';
import {
  MapPin,
  Briefcase,
  Building,
  Users,
  DollarSign,
  Heart,
  ChevronLeft,
  Calendar,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import SalaryRange from '../../components/SalaryRange';
import Skeleton from '../../components/Skeleton';
import Modal from '../../components/Modal';
import Textarea from '../../components/Textarea';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fetchNotifications } = useNotifications();

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Fetch job detail
  const { data, isLoading, isError } = useQuery({
    queryKey: ['jobDetail', id],
    queryFn: () => getJobById(id),
    retry: false
  });

  const jobData = data?.data?.job;
  const isApplied = data?.data?.isApplied || false;
  const isSaved = data?.data?.isSaved || false;

  // Fetch related jobs
  const { data: relatedData } = useQuery({
    queryKey: ['relatedJobs', jobData?.skills],
    queryFn: () => getJobs({ skills: jobData?.skills?.join(','), limit: 3 }),
    enabled: !!jobData?.skills
  });

  const relatedJobs = (relatedData?.data?.jobs || []).filter(j => j._id !== id);

  // Toggle Save Job mutation
  const saveMutation = useMutation({
    mutationFn: () => saveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      toast.success('Job saved to bookmarks');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save job');
    }
  });

  const unsaveMutation = useMutation({
    mutationFn: () => unsaveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      toast.success('Job removed from bookmarks');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove job');
    }
  });

  // Apply to Job mutation
  const applyMutation = useMutation({
    mutationFn: (applyData) => applyToJob(applyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      toast.success('Application submitted successfully');
      setApplyModalOpen(false);
      setCoverLetter('');
      fetchNotifications();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  });

  // Withdraw Application mutation
  // We need the application ID. If isApplied is true, we should get the application ID. Wait! Does the getJobById return application ID? No, but we can query candidate's applications list or find the application matching jobId in our candidate's applications cache, or we can fetch candidate's applications list from candidate profile.
  // Wait, let's look at `withdrawApplication` by querying `/api/candidate/applications` first to find the ID, or let's write a utility inside candidateController or in candidate profile.
  // Wait! In `getMyApplications`, we load all applications. Let's find the application that matches our `jobId`!
  const { data: candidateApps } = useQuery({
    queryKey: ['candidateAppsList'],
    queryFn: () => queryClient.ensureQueryData({
      queryKey: ['myApplications'],
      queryFn: async () => {
        const res = await queryClient.fetchQuery({
          queryKey: ['myApplicationsFetch'],
          queryFn: () => axiosPrivate.get('/candidate/applications').then(r => r.data)
        });
        return res;
      }
    }),
    // Wait, let's fetch candidate applications from cache/API dynamically
    enabled: !!(user && user.role === 'candidate' && isApplied)
  });

  const getApplicationId = async () => {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['candidateAppsQuery'],
        queryFn: () => import('../../api/candidate').then(m => m.getCandidateApplications())
      });
      const apps = res.data || [];
      const match = apps.find(a => a.jobId?._id === id);
      return match?._id;
    } catch (err) {
      return null;
    }
  };

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const appId = await getApplicationId();
      if (!appId) throw new Error('Application ID not found');
      return withdrawApplication(appId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      toast.success('Application withdrawn successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to withdraw application');
    }
  });

  const handleApply = (e) => {
    e.preventDefault();
    applyMutation.mutate({ jobId: id, coverLetter });
  };

  const toggleSave = () => {
    if (!user) {
      toast.error('Please log in to save jobs');
      return;
    }
    if (isSaved) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <Skeleton className="h-6 w-32" />
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (isError || !jobData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold">Job Post Not Found</h2>
        <p className="text-slate-400">This vacancy may have been filled, deleted, or suspended by the platform moderator.</p>
        <Link to="/jobs">
          <Button variant="secondary">Back to Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Back Button */}
      <Link to="/jobs" className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-semibold transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar src={jobData.companyId?.logo} name={jobData.companyId?.companyName} size="lg" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-400">{jobData.companyId?.companyName}</h3>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                      {jobData.title}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={jobData.jobType}>{jobData.jobType}</Badge>
                  <Badge variant="reviewed">{jobData.experienceLevel}</Badge>
                  <span className="text-xs text-slate-400 flex items-center bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    {jobData.location}
                  </span>
                </div>
              </div>

              {/* Bookmark Toggle */}
              {(!user || user.role === 'candidate') && (
                <button
                  onClick={toggleSave}
                  className={`p-3 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start ${
                    isSaved ? 'text-rose-500 bg-rose-50/50 dark:bg-rose-950/20' : 'text-slate-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-800 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="space-y-1">
                <span>Salary Band</span>
                <SalaryRange min={jobData.salary?.min} max={jobData.salary?.max} currency={jobData.salary?.currency} className="block mt-0.5 text-sm normal-case font-bold" />
              </div>
              <div className="space-y-1">
                <span>Applicants</span>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {jobData.applicantCount} applied
                </span>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <span>Deadline</span>
                <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {new Date(jobData.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Job Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {jobData.description}
              </p>
            </div>

            {/* Requirements */}
            {jobData.requirements && jobData.requirements.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-2 pl-2">
                  {jobData.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {jobData.skills && jobData.skills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jobData.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Panel (Company Details & CTA Actions) */}
        <aside className="space-y-6">
          {/* Apply/Verification Actions card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
            {user ? (
              user.role === 'candidate' ? (
                isApplied ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-sm font-semibold flex items-center justify-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Application Submitted</span>
                    </div>
                    <Button
                      variant="danger"
                      className="w-full"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to withdraw your application?')) {
                          withdrawMutation.mutate();
                        }
                      }}
                      loading={withdrawMutation.isPending}
                    >
                      Withdraw Application
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full py-3 text-sm font-bold shadow-lg" onClick={() => setApplyModalOpen(true)}>
                    Apply Now
                  </Button>
                )
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs text-slate-400">
                  Logged in as a {user.role}. Postings are only open to candidates.
                </div>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-medium">Log in as a candidate to apply for this job.</p>
                <Link to="/login" className="block">
                  <Button className="w-full">Login to Apply</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Company details card */}
          <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400">About the Company</h3>
            <div className="flex items-center space-x-3">
              <Avatar src={jobData.companyId?.logo} name={jobData.companyId?.companyName} size="md" />
              <div>
                <h4 className="font-bold text-sm">{jobData.companyId?.companyName}</h4>
                <span className="text-xs text-slate-400">{jobData.companyId?.industry || 'Tech'}</span>
              </div>
            </div>
            {jobData.companyId?.about && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                {jobData.companyId.about}
              </p>
            )}
            <div className="space-y-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Headquarters:</span>
                <span className="text-slate-700 dark:text-slate-200">{jobData.companyId?.location || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Company Size:</span>
                <span className="text-slate-700 dark:text-slate-200">{jobData.companyId?.size || '1-10'} employees</span>
              </div>
              {jobData.companyId?.website && (
                <a
                  href={jobData.companyId.website.startsWith('http') ? jobData.companyId.website : `https://${jobData.companyId.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-brand-600 dark:text-brand-400 hover:underline pt-2"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Jobs Section */}
      {relatedJobs.length > 0 && (
        <section className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-8">
          <h2 className="text-xl font-bold">Similar Openings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedJobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="glass-card p-5 rounded-2xl hover:shadow-md hover:-translate-y-0.5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-44 transition-all"
              >
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{job.companyId?.companyName}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{job.title}</h4>
                  <Badge variant={job.jobType}>{job.jobType}</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-3">
                  <SalaryRange min={job.salary?.min} max={job.salary?.max} currency={job.salary?.currency} />
                  <span className="text-[10px] text-slate-400">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Apply Modal */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply for ${jobData.title}`}>
        <form onSubmit={handleApply} className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            By applying, your HireFlow profile and uploaded resume will be shared with <strong>{jobData.companyId?.companyName}</strong>. You can optionally write a cover letter below to stand out.
          </p>

          <Textarea
            label="Cover Letter / Introduction"
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={5}
          />

          <div className="flex items-center justify-end space-x-3 border-t dark:border-slate-800 pt-4">
            <Button variant="secondary" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={applyMutation.isPending}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;
