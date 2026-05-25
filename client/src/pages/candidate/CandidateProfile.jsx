import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCandidateProfile, updateCandidateProfile, uploadResume, deleteResume } from '../../api/candidate';
import { Plus, Trash2, Calendar, FileText, Globe, GraduationCap, Briefcase, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import TagInput from '../../components/TagInput';
import FileUpload from '../../components/FileUpload';
import Skeleton from '../../components/Skeleton';

const CandidateProfile = () => {
  const queryClient = useQueryClient();
  
  // Dynamic lists states
  const [skills, setSkills] = useState([]);
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  
  // File upload state
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      headline: '',
      bio: '',
      location: ''
    }
  });

  // Query profile
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['candidateProfileData'],
    queryFn: () => getCandidateProfile(),
    onSuccess: (res) => {
      const p = res.data || {};
      reset({
        headline: p.headline || '',
        bio: p.bio || '',
        location: p.location || ''
      });
      setSkills(p.skills || []);
      setPortfolioLinks(p.portfolioLinks || []);
      setExperience(p.experience || []);
      setEducation(p.education || []);
    }
  });

  const profile = profileRes?.data || {};

  // Mutation to save profile
  const saveMutation = useMutation({
    mutationFn: (profileData) => updateCandidateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateProfileData'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    }
  });

  const handleFormSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      skills,
      portfolioLinks,
      experience,
      education
    });
  };

  // Dynamic lists actions
  const addExperience = () => {
    setExperience([...experience, { title: '', company: '', from: '', to: '', current: false, description: '' }]);
  };

  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index, field, val) => {
    setExperience(
      experience.map((exp, i) => (i === index ? { ...exp, [field]: val } : exp))
    );
  };

  const addEducation = () => {
    setEducation([...education, { degree: '', school: '', from: '', to: '' }]);
  };

  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, val) => {
    setEducation(
      education.map((edu, i) => (i === index ? { ...edu, [field]: val } : edu))
    );
  };

  // Resume mutations
  const handleResumeUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await uploadResume(formData);
      queryClient.invalidateQueries({ queryKey: ['candidateProfileData'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      toast.success('Resume uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await deleteResume();
      queryClient.invalidateQueries({ queryKey: ['candidateProfileData'] });
      queryClient.invalidateQueries({ queryKey: ['candidateProfile'] });
      toast.success('Resume deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile</h1>
        <p className="text-sm text-slate-400">Keep your details fresh so recruiters can discover your match.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main profile form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="lg:col-span-2 space-y-8">
          
          {/* Headline and Bio */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-2">
              <Info className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Core Information</h3>
            </div>

            <Input
              label="Professional Headline"
              placeholder="e.g. Senior Frontend Engineer | React & Next.js specialist"
              error={errors.headline}
              {...register('headline')}
            />

            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA (or Remote)"
              error={errors.location}
              {...register('location')}
            />

            <Textarea
              label="Professional Biography"
              placeholder="Tell recruiters about your background, achievements, and what you are looking for..."
              error={errors.bio}
              {...register('bio')}
            />

            <TagInput
              label="Skills & Technologies"
              value={skills}
              onChange={setSkills}
              placeholder="Type a skill and press Enter (e.g. React, Node.js)"
            />

            <TagInput
              label="Portfolio / Profile Links"
              value={portfolioLinks}
              onChange={setPortfolioLinks}
              placeholder="Type link URL and press Enter (e.g. github.com/user)"
            />
          </div>

          {/* Experience History */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Experience History</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addExperience}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </Button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No experience entries listed.</p>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                {experience.map((exp, idx) => (
                  <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-500">Position #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-xs text-rose-500 hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Job Title"
                        placeholder="e.g. Software Engineer"
                        value={exp.title || ''}
                        onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                        required
                      />
                      <Input
                        label="Company Name"
                        placeholder="e.g. Google"
                        value={exp.company || ''}
                        onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="From Date"
                        type="date"
                        value={exp.from ? exp.from.split('T')[0] : ''}
                        onChange={(e) => handleExperienceChange(idx, 'from', e.target.value)}
                        required
                      />
                      {!exp.current && (
                        <Input
                          label="To Date"
                          type="date"
                          value={exp.to ? exp.to.split('T')[0] : ''}
                          onChange={(e) => handleExperienceChange(idx, 'to', e.target.value)}
                        />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`curr-${idx}`}
                        checked={exp.current || false}
                        onChange={(e) => handleExperienceChange(idx, 'current', e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500"
                      />
                      <label htmlFor={`curr-${idx}`} className="text-xs text-slate-500 dark:text-slate-400 font-semibold select-none">
                        I am currently working in this role
                      </label>
                    </div>

                    <Textarea
                      label="Description / Achievements"
                      placeholder="Detail your responsibilities, team structures, and products delivered..."
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education History */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Education History</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={addEducation}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </Button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No education entries listed.</p>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                {education.map((edu, idx) => (
                  <div key={idx} className={`space-y-4 ${idx > 0 ? 'pt-6' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500">Education #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-xs text-rose-500 hover:underline flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Degree / Course"
                        placeholder="e.g. Bachelor of Science in Computer Science"
                        value={edu.degree || ''}
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        required
                      />
                      <Input
                        label="School / University"
                        placeholder="e.g. Stanford University"
                        value={edu.school || ''}
                        onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="From Date"
                        type="date"
                        value={edu.from ? edu.from.split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(idx, 'from', e.target.value)}
                        required
                      />
                      <Input
                        label="To Date"
                        type="date"
                        value={edu.to ? edu.to.split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(idx, 'to', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 border-t dark:border-slate-800 pt-4">
            <Button type="submit" loading={saveMutation.isPending}>
              Save Profile Changes
            </Button>
          </div>

        </form>

        {/* Sidebar panels (Resume Upload & Completeness info) */}
        <aside className="space-y-6">
          
          {/* Profile complete indicator */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="font-bold text-xs tracking-wide uppercase text-slate-400">Profile Completion</h4>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{profile.profileComplete || 0}%</span>
              <span className="text-xs text-slate-400">Status</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${profile.profileComplete || 0}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Completing headline, biography, skills, work experiences, and uploading a PDF resume contributes to reaching 100% completion.
            </p>
          </div>

          {/* Resume uploader */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-2">
              <FileText className="w-4.5 h-4.5 text-brand-500" />
              <h4 className="font-bold text-xs tracking-wide uppercase text-slate-500">PDF Resume</h4>
            </div>

            <FileUpload
              accept=".pdf"
              maxSizeMB={5}
              onUpload={handleResumeUpload}
              loading={uploading}
              currentFileUrl={profile.resumeUrl}
              currentFileName="Resume"
            />

            {profile.resumeUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResumeDelete}
                className="w-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs py-1.5"
              >
                Delete Resume File
              </Button>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
};

export default CandidateProfile;
