import { axiosPrivate } from './axios';

export const getAdminStats = async () => {
  const res = await axiosPrivate.get('/admin/stats');
  return res.data;
};

export const getUsers = async (params) => {
  const res = await axiosPrivate.get('/admin/users', { params });
  return res.data;
};

export const getUserById = async (id) => {
  const res = await axiosPrivate.get(`/admin/users/${id}`);
  return res.data;
};

export const toggleBlockUser = async (id) => {
  const res = await axiosPrivate.patch(`/admin/users/${id}/block`);
  return res.data;
};

export const toggleApproveRecruiter = async (id) => {
  const res = await axiosPrivate.patch(`/admin/users/${id}/approve`);
  return res.data;
};

export const getAdminJobs = async (params) => {
  const res = await axiosPrivate.get('/admin/jobs', { params });
  return res.data;
};

export const updateJobStatusByAdmin = async (id, status) => {
  const res = await axiosPrivate.patch(`/admin/jobs/${id}/status`, { status });
  return res.data;
};

export const deleteJobByAdmin = async (id) => {
  const res = await axiosPrivate.delete(`/admin/jobs/${id}`);
  return res.data;
};

export const getAdminApplications = async (params) => {
  const res = await axiosPrivate.get('/admin/applications', { params });
  return res.data;
};
