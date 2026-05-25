import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplicants, updateApplicationStatus } from '../../api/recruiter';
import { ArrowLeft, User, FileText, Calendar, CheckSquare, MessageSquare, Briefcase, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Input from '../../components/Input';

const ApplicantsList = () => {
  const { id: jobId } = useParams();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Status edit form states
  const [editStatus, setEditStatus] = useState('');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  // Fetch applicants
  const { data, isLoading } = useQuery({
    queryKey: ['applicantsList', jobId, activeTab],
    queryFn: () => getApplicants(jobId, activeTab === 'all' ? '' : activeTab)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status, note, date }) => updateApplicationStatus(appId, {
      status,
      recruiterNote: note,
      interviewDate: date
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicantsList', jobId] });
      queryClient.invalidateQueries({ queryKey: ['recruiterAnalytics'] });
      toast.success('Applicant status updated successfully');
      setSelectedApp(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update applicant status');
    }
  });

  const applicants = data?.data || [];

  const handleOpenDetailModal = (app) => {
    setSelectedApp(app);
    setEditStatus(app.status);
    setRecruiterNote(app.recruiterNote || '');
    setInterviewDate(app.interviewDate ? app.interviewDate.split('T')[0] : '');
  };

  const handleSaveStatusUpdate = (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    updateStatusMutation.mutate({
      appId: selectedApp._id,
      status: editStatus,
      note: recruiterNote,
      date: editStatus === 'interview' ? interviewDate : ''
    });
  };

  const tabs = [
    { value: 'all', label: 'All Candidates' },
    { value: 'applied', label: 'Applied' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interviews' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const statusDropdownOptions = [
    { value: 'applied', label: 'Applied' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center space-x-2">
        <Link to="/recruiter/jobs" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Job Applicants</h1>
          <p className="text-sm text-slate-400">Review profiles, cover letters, resumes, and progress applications.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold border-b-2 focus:outline-none transition-all ${
                isActive
                  ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Applicants List Grid */}
      <div className="space-y-4">
        {applicants.length === 0 ? (
          <div className="py-10">
            <EmptyState
              icon={User}
              title={`No candidates found`}
              description="No applications have been registered in this phase for this vacancy."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicants.map((app) => (
              <div
                key={app._id}
                onClick={() => handleOpenDetailModal(app)}
                className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-44 relative group"
              >
                <div className="flex items-start space-x-3.5">
                  <Avatar src={app.candidateId?.profilePhoto} name={app.candidateId?.name} size="md" />
                  <div className="space-y-0.5 max-w-[70%]">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors">
                      {app.candidateId?.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold truncate leading-none">
                      {app.candidateProfile?.headline || 'Candidate'}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center pt-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-4">
                  <span className="text-[10px] text-slate-400 font-bold truncate">
                    {app.candidateProfile?.location || 'Location unspecified'}
                  </span>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Candidate: ${selectedApp.candidateId?.name}`}
          size="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Candidate Info Profile Column */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar src={selectedApp.candidateId?.profilePhoto} name={selectedApp.candidateId?.name} size="lg" />
                <div>
                  <h3 className="text-lg font-extrabold">{selectedApp.candidateId?.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{selectedApp.candidateProfile?.headline || 'Job Candidate'}</p>
                  <p className="text-[10px] text-slate-400 flex items-center mt-1">
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    {selectedApp.candidateId?.email}
                  </p>
                </div>
              </div>

              {selectedApp.candidateProfile?.bio && (
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Biography</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedApp.candidateProfile.bio}
                  </p>
                </div>
              )}

              {selectedApp.coverLetter && (
                <div className="space-y-1.5 text-xs p-3.5 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl">
                  <span className="font-bold text-slate-400 uppercase tracking-wide">Cover Letter</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.coverLetter}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedApp.candidateProfile?.skills && selectedApp.candidateProfile.skills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApp.candidateProfile.skills.map((s, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-800 border dark:border-slate-700/50 px-2.5 py-0.5 rounded text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {selectedApp.candidateProfile?.portfolioLinks && selectedApp.candidateProfile.portfolioLinks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Portfolio Links</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedApp.candidateProfile.portfolioLinks.map((l, idx) => (
                      <a
                        key={idx}
                        href={l.startsWith('http') ? l : `https://${l}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center space-x-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Link #{idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Form Update status Column */}
            <aside className="p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-400">Moderator Control</h4>
              
              <div className="space-y-1 text-xs">
                <span className="font-semibold">Current State:</span>
                <span className="block mt-0.5"><Badge variant={selectedApp.status}>{selectedApp.status}</Badge></span>
              </div>

              <form onSubmit={handleSaveStatusUpdate} className="space-y-4 text-xs font-medium">
                <Select
                  label="Update Pipeline Stage"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  options={statusDropdownOptions}
                />

                {editStatus === 'interview' && (
                  <Input
                    label="Interview Date"
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    required
                  />
                )}

                <Textarea
                  label="Response Note to Candidate"
                  placeholder="Share details, meeting links, or feedback notes..."
                  value={recruiterNote}
                  onChange={(e) => setRecruiterNote(e.target.value)}
                  rows={4}
                />

                <div className="pt-2 border-t dark:border-slate-800">
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-1 p-2 rounded bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-950/40 dark:hover:bg-brand-950/80 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-900 text-xs mb-3 text-center"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download PDF Resume</span>
                  </a>

                  <Button
                    type="submit"
                    className="w-full font-bold py-2"
                    loading={updateStatusMutation.isPending}
                  >
                    Save & Notify Candidate
                  </Button>
                </div>
              </form>
            </aside>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApplicantsList;
