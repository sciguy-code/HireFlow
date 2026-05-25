import { axiosPrivate } from './axios';

export const getCompany = async () => {
  const res = await axiosPrivate.get('/recruiter/company');
  return res.data;
};

export const updateCompany = async (companyData) => {
  const res = await axiosPrivate.put('/recruiter/company', companyData);
  return res.data;
};

export const uploadLogo = async (formData) => {
  const res = await axiosPrivate.post('/recruiter/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getMyJobs = async (params) => {
  const res = await axiosPrivate.get('/recruiter/jobs', { params });
  return res.data;
};

export const createJob = async (jobData) => {
  const res = await axiosPrivate.post('/recruiter/jobs', jobData);
  return res.data;
};

export const getJobDetail = async (id) => {
  const res = await axiosPrivate.get(`/recruiter/jobs/${id}`);
  return res.data;
};

export const updateJob = async (id, jobData) => {
  const res = await axiosPrivate.put(`/recruiter/jobs/${id}`, jobData);
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await axiosPrivate.delete(`/recruiter/jobs/${id}`);
  return res.data;
};

export const getApplicants = async (jobId, status) => {
  const res = await axiosPrivate.get(`/recruiter/jobs/${jobId}/applicants`, {
    params: { status }
  });
  return res.data;
};

export const getApplicantDetail = async (applicationId) => {
  const res = await axiosPrivate.get(`/recruiter/applicants/${applicationId}`);
  return res.data;
};

export const updateApplicationStatus = async (applicationId, statusData) => {
  const res = await axiosPrivate.patch(`/recruiter/applicants/${applicationId}/status`, statusData);
  return res.data;
};

export const getRecruiterAnalytics = async () => {
  const res = await axiosPrivate.get('/recruiter/analytics');
  return res.data;
};
