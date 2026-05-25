import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany, uploadLogo } from '../../api/recruiter';
import { Building, Globe, MapPin, Users, Info, Eye, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import FileUpload from '../../components/FileUpload';
import Skeleton from '../../components/Skeleton';
import Avatar from '../../components/Avatar';

const CompanyProfile = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      companyName: '',
      website: '',
      about: '',
      industry: '',
      location: '',
      size: '1-10'
    }
  });

  const formValues = watch();

  // Fetch company
  const { data: companyRes, isLoading } = useQuery({
    queryKey: ['recruiterCompanyData'],
    queryFn: () => getCompany(),
    onSuccess: (res) => {
      const c = res.data || {};
      reset({
        companyName: c.companyName || '',
        website: c.website || '',
        about: c.about || '',
        industry: c.industry || '',
        location: c.location || '',
        size: c.size || '1-10'
      });
    }
  });

  const company = companyRes?.data || {};

  useEffect(() => {
    if (companyRes?.data) {
      const c = companyRes.data;
      reset({
        companyName: c.companyName || '',
        website: c.website || '',
        about: c.about || '',
        industry: c.industry || '',
        location: c.location || '',
        size: c.size || '1-10'
      });
    }
  }, [companyRes, reset]);

  // Update profile mutation
  const saveMutation = useMutation({
    mutationFn: (companyData) => updateCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterCompanyData'] });
      queryClient.invalidateQueries({ queryKey: ['authMe'] });
      toast.success('Company profile updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save company profile');
    }
  });

  const handleFormSubmit = (data) => {
    saveMutation.mutate(data);
  };

  // Upload logo
  const handleLogoUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      await uploadLogo(formData);
      queryClient.invalidateQueries({ queryKey: ['recruiterCompanyData'] });
      toast.success('Company logo uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const sizeOptions = [
    { value: '1-10', label: '1 - 10 employees' },
    { value: '11-50', label: '11 - 50 employees' },
    { value: '51-200', label: '51 - 200 employees' },
    { value: '201-500', label: '201 - 500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold">Company Profile Preview</h2>
          <Button variant="secondary" size="sm" onClick={() => setIsPreview(false)} className="flex items-center space-x-1">
            <Edit3 className="w-4 h-4" />
            <span>Back to Editor</span>
          </Button>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <Avatar src={company.logo} name={formValues.companyName} size="lg" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{formValues.companyName || 'Untitled Company'}</h1>
              <span className="text-xs text-slate-400 font-semibold">{formValues.industry || 'Tech'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="space-y-1">
              <span>Location</span>
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                {formValues.location || 'N/A'}
              </span>
            </div>
            <div className="space-y-1">
              <span>Company Size</span>
              <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center">
                <Users className="w-4 h-4 mr-1 text-slate-400" />
                {formValues.size} employees
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold">About the Company</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
              {formValues.about || 'No about details set yet.'}
            </p>
          </div>

          {formValues.website && (
            <div className="pt-2">
              <a
                href={formValues.website.startsWith('http') ? formValues.website : `https://${formValues.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Company Website</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Company Profile</h1>
          <p className="text-sm text-slate-400">Configure page details presented to candidates applying to your positions.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsPreview(true)} className="flex items-center space-x-1.5">
          <Eye className="w-4 h-4" />
          <span>Preview Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-2">
              <Info className="w-5 h-5 text-brand-500" />
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Corporate Details</h3>
            </div>

            <Input
              label="Company Legal Name"
              placeholder="e.g. Acme Corp"
              error={errors.companyName}
              required
              {...register('companyName', { required: 'Company name is required' })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Industry / Field"
                placeholder="e.g. SaaS / FinTech"
                error={errors.industry}
                {...register('industry')}
              />
              <Select
                label="Company Size"
                options={sizeOptions}
                {...register('size')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Headquarters Location"
                placeholder="e.g. Boston, MA"
                error={errors.location}
                {...register('location')}
              />
              <Input
                label="Website URL"
                placeholder="e.g. www.acmecorp.com"
                error={errors.website}
                {...register('website')}
              />
            </div>

            <Textarea
              label="About corporate history & culture"
              placeholder="Provide detail on what your company builds, mission values, and work culture..."
              error={errors.about}
              {...register('about')}
            />

            <div className="flex justify-end pt-2 border-t dark:border-slate-800">
              <Button type="submit" loading={saveMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>

        {/* Logo Side Uploader Panel */}
        <aside className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-center">
          <div className="flex items-center space-x-2 border-b dark:border-slate-800 pb-2 text-left">
            <Building className="w-4.5 h-4.5 text-brand-500" />
            <h4 className="font-bold text-xs tracking-wide uppercase text-slate-500">Corporate Logo</h4>
          </div>

          <div className="flex justify-center py-2">
            <Avatar src={company.logo} name={formValues.companyName} size="lg" />
          </div>

          <FileUpload
            accept=".png,.jpg,.jpeg"
            maxSizeMB={2}
            onUpload={handleLogoUpload}
            loading={uploading}
          />
        </aside>
      </div>
    </div>
  );
};

export default CompanyProfile;
