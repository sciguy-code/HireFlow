import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobDetail, updateJob } from '../../api/recruiter';
import { Plus, Trash2, Eye, Edit3, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import TagInput from '../../components/TagInput';
import Badge from '../../components/Badge';
import SalaryRange from '../../components/SalaryRange';
import Skeleton from '../../components/Skeleton';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [skills, setSkills] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [reqInput, setReqInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'USD',
      jobType: 'full-time',
      location: '',
      experienceLevel: 'entry',
      deadline: '',
      status: 'open'
    }
  });

  const formValues = watch();

  // Fetch job details
  const { data: jobRes, isLoading } = useQuery({
    queryKey: ['editJobDetails', id],
    queryFn: () => getJobDetail(id),
    onSuccess: (res) => {
      const j = res.data || {};
      reset({
        title: j.title || '',
        description: j.description || '',
        salaryMin: j.salary?.min || 0,
        salaryMax: j.salary?.max || 0,
        currency: j.salary?.currency || 'USD',
        jobType: j.jobType || 'full-time',
        location: j.location || '',
        experienceLevel: j.experienceLevel || 'entry',
        deadline: j.deadline ? j.deadline.split('T')[0] : '',
        status: j.status || 'open'
      });
      setSkills(j.skills || []);
      setRequirements(j.requirements || []);
    }
  });

  // Re-run reset on query success (in case onSuccess callback doesn't run in v5)
  useEffect(() => {
    if (jobRes?.data) {
      const j = jobRes.data;
      reset({
        title: j.title || '',
        description: j.description || '',
        salaryMin: j.salary?.min || 0,
        salaryMax: j.salary?.max || 0,
        currency: j.salary?.currency || 'USD',
        jobType: j.jobType || 'full-time',
        location: j.location || '',
        experienceLevel: j.experienceLevel || 'entry',
        deadline: j.deadline ? j.deadline.split('T')[0] : '',
        status: j.status || 'open'
      });
      setSkills(j.skills || []);
      setRequirements(j.requirements || []);
    }
  }, [jobRes, reset]);

  const mutation = useMutation({
    mutationFn: (jobData) => updateJob(id, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterJobsList'] });
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      toast.success('Job vacancy updated successfully!');
      navigate('/recruiter/jobs');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update vacancy');
    }
  });

  const addRequirement = () => {
    const val = reqInput.trim();
    if (val && !requirements.includes(val)) {
      setRequirements([...requirements, val]);
      setReqInput('');
    }
  };

  const removeRequirement = (req) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const onSubmit = (data) => {
    if (requirements.length === 0) {
      toast.error('Please specify at least one job requirement');
      return;
    }
    mutation.mutate({
      title: data.title,
      description: data.description,
      requirements,
      skills,
      salary: {
        min: Number(data.salaryMin),
        max: Number(data.salaryMax),
        currency: data.currency
      },
      jobType: data.jobType,
      location: data.location,
      experienceLevel: data.experienceLevel,
      deadline: data.deadline,
      status: data.status
    });
  };

  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'remote', label: 'Remote Only' }
  ];

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead / Principal' }
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'INR', label: 'INR (₹)' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open / Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'closed', label: 'Closed / Inactive' }
  ];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold">Posting Preview</h2>
          <Button variant="secondary" size="sm" onClick={() => setIsPreview(false)} className="flex items-center space-x-1">
            <Edit3 className="w-4 h-4" />
            <span>Back to Editor</span>
          </Button>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{formValues.title || 'Untitled Role'}</h1>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant={formValues.jobType}>{formValues.jobType}</Badge>
              <Badge variant="reviewed">{formValues.experienceLevel}</Badge>
              <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full text-slate-400">
                {formValues.location || 'Location unspecified'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <div>
              <span>Salary Range</span>
              <SalaryRange min={Number(formValues.salaryMin)} max={Number(formValues.salaryMax)} currency={formValues.currency} className="block mt-0.5 text-sm normal-case font-bold" />
            </div>
            <div>
              <span>Deadline</span>
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {formValues.deadline ? new Date(formValues.deadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold">Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {formValues.description || 'No description written yet.'}
            </p>
          </div>

          {requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold">Requirements</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                {requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/recruiter/jobs" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Edit Vacancy</h1>
            <p className="text-sm text-slate-400">Modify vacancy configurations and publish settings.</p>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={() => setIsPreview(true)} className="flex items-center space-x-1.5">
          <Eye className="w-4 h-4" />
          <span>Preview Posting</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        <Input
          label="Job Title"
          placeholder="e.g. Senior Backend Engineer (Node.js)"
          error={errors.title}
          required
          {...register('title', { required: 'Job title is required' })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Job Placement Type"
            options={jobTypeOptions}
            {...register('jobType')}
          />
          <Select
            label="Experience Level"
            options={experienceOptions}
            {...register('experienceLevel')}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g. London, UK (or Remote)"
          error={errors.location}
          required
          {...register('location', { required: 'Job location is required' })}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Min Annual Salary"
            type="number"
            placeholder="e.g. 70000"
            error={errors.salaryMin}
            required
            {...register('salaryMin', { required: 'Min salary is required' })}
          />
          <Input
            label="Max Annual Salary"
            type="number"
            placeholder="e.g. 100000"
            error={errors.salaryMax}
            required
            {...register('salaryMax', { required: 'Max salary is required' })}
          />
          <Select
            label="Currency"
            options={currencyOptions}
            {...register('currency')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Application Deadline"
            type="date"
            error={errors.deadline}
            required
            {...register('deadline', { required: 'Application deadline is required' })}
          />
          <Select
            label="Publish Status"
            options={statusOptions}
            {...register('status')}
          />
        </div>

        <Textarea
          label="Detailed Description"
          placeholder="Outline responsibilities, team metrics, daily tasks, and what candidates should expect..."
          error={errors.description}
          required
          {...register('description', { required: 'Description is required' })}
        />

        {/* Requirements Builder */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
            Candidate Requirements
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add requirement"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              className="flex-1 px-4 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addRequirement();
                }
              }}
            />
            <Button variant="secondary" onClick={addRequirement}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-1.5 pt-2">
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                <span>{req}</span>
                <button type="button" onClick={() => removeRequirement(req)} className="text-rose-500 hover:text-rose-700">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <TagInput
          label="Preferred Skills (Tags)"
          value={skills}
          onChange={setSkills}
          placeholder="Type skill tag and press Enter (e.g. AWS, Kubernetes)"
        />

        <div className="flex justify-end space-x-3 border-t dark:border-slate-800 pt-4">
          <Link to="/recruiter/jobs">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" loading={mutation.isPending}>
            Update Vacancy
          </Button>
        </div>

      </form>
    </div>
  );
};

export default EditJob;
