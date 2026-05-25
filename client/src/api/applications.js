import { axiosPrivate } from './axios';

export const applyToJob = async (applicationData) => {
  const res = await axiosPrivate.post('/applications', applicationData);
  return res.data;
};

export const withdrawApplication = async (id) => {
  const res = await axiosPrivate.delete(`/applications/${id}`);
  return res.data;
};
