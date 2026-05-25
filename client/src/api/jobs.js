import { axiosPublic } from './axios';

export const getJobs = async (params) => {
  const res = await axiosPublic.get('/jobs', { params });
  return res.data;
};

export const getJobById = async (id) => {
  const res = await axiosPublic.get(`/jobs/${id}`);
  return res.data;
};
