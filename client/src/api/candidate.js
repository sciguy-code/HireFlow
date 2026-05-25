import { axiosPrivate } from './axios';

export const getCandidateProfile = async () => {
  const res = await axiosPrivate.get('/candidate/profile');
  return res.data;
};

export const updateCandidateProfile = async (profileData) => {
  const res = await axiosPrivate.put('/candidate/profile', profileData);
  return res.data;
};

export const uploadResume = async (formData) => {
  const res = await axiosPrivate.post('/candidate/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const deleteResume = async () => {
  const res = await axiosPrivate.delete('/candidate/resume');
  return res.data;
};

export const getCandidateApplications = async () => {
  const res = await axiosPrivate.get('/candidate/applications');
  return res.data;
};

export const getSavedJobs = async () => {
  const res = await axiosPrivate.get('/candidate/saved-jobs');
  return res.data;
};

export const saveJob = async (jobId) => {
  const res = await axiosPrivate.post(`/candidate/saved-jobs/${jobId}`);
  return res.data;
};

export const unsaveJob = async (jobId) => {
  const res = await axiosPrivate.delete(`/candidate/saved-jobs/${jobId}`);
  return res.data;
};
