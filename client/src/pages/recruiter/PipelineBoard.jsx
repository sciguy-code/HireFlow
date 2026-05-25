import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyJobs, getApplicants, updateApplicationStatus } from '../../api/recruiter';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { GitPullRequest, LayoutDashboard, SlidersHorizontal, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../../components/Avatar';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Select from '../../components/Select';

const KanbanColumn = ({ id, title, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[270px] p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col space-y-3 transition-colors ${
        isOver ? 'bg-brand-50/40 border-brand-300 dark:bg-brand-950/10' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-500">{title}</h4>
        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-600 dark:text-slate-400">
          {React.Children.count(children)}
        </span>
      </div>
      <div className="flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[60vh] no-scrollbar min-h-[150px]">
        {children}
      </div>
    </div>
  );
};

const KanbanCard = ({ id, app }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-grab active:cursor-grabbing hover:border-brand-300 dark:hover:border-brand-800 transition-colors flex items-center space-x-3 select-none ${
        isDragging ? 'opacity-50 ring-2 ring-brand-500' : ''
      }`}
    >
      <Avatar src={app.candidateId?.profilePhoto} name={app.candidateId?.name} size="sm" />
      <div className="space-y-0.5 text-xs truncate max-w-[80%]">
        <h5 className="font-bold text-slate-900 dark:text-slate-100 truncate">{app.candidateId?.name}</h5>
        <p className="text-[10px] text-slate-400 truncate">{app.candidateProfile?.headline || 'Candidate'}</p>
      </div>
    </div>
  );
};

const PipelineBoard = () => {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState('');

  // Fetch recruiter's jobs
  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['recruiterPipelineJobsList'],
    queryFn: () => getMyJobs({ limit: 100 })
  });

  const jobs = jobsRes?.data?.jobs || [];

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0]._id);
    }
  }, [jobs, selectedJobId]);

  // Fetch applicants for the selected job
  const { data: applicantsRes, isLoading: applicantsLoading } = useQuery({
    queryKey: ['pipelineApplicants', selectedJobId],
    queryFn: () => getApplicants(selectedJobId),
    enabled: !!selectedJobId
  });

  const applicants = applicantsRes?.data || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }) => updateApplicationStatus(appId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelineApplicants', selectedJobId] });
      queryClient.invalidateQueries({ queryKey: ['recruiterAnalytics'] });
      toast.success('Applicant pipeline stage updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update candidate pipeline stage');
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const appId = active.id;
    const targetStatus = over.id;

    const currentApp = applicants.find(a => a._id === appId);
    if (currentApp && currentApp.status !== targetStatus) {
      updateStatusMutation.mutate({ appId, status: targetStatus });
    }
  };

  const columns = [
    { id: 'applied', title: 'Applied' },
    { id: 'reviewed', title: 'Reviewed' },
    { id: 'shortlisted', title: 'Shortlisted' },
    { id: 'interview', title: 'Interview' },
    { id: 'offered', title: 'Offered' },
    { id: 'rejected', title: 'Rejected' }
  ];

  const jobsOptions = jobs.map(j => ({ value: j._id, label: j.title }));

  const loading = jobsLoading || applicantsLoading;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-96 w-64 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-600 text-white dark:bg-brand-500">
            <GitPullRequest className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Pipeline Board</h1>
            <p className="text-sm text-slate-400">Drag applicant cards between columns to update recruitment stages.</p>
          </div>
        </div>

        {jobsOptions.length > 0 && (
          <div className="w-64">
            <Select
              placeholder="Select position..."
              options={jobsOptions}
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            />
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No vacancies posted"
          description="Create a vacancy and select open publish configurations to start gathering applications."
          actionText="Post a Job"
          onActionClick={() => window.location.href = '/recruiter/jobs/new'}
        />
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {columns.map((col) => {
              const colApps = applicants.filter(a => a.status === col.id);
              return (
                <KanbanColumn key={col.id} id={col.id} title={col.title}>
                  {colApps.map((app) => (
                    <KanbanCard key={app._id} id={app._id} app={app} />
                  ))}
                </KanbanColumn>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
};

export default PipelineBoard;
