import { axiosPublic, axiosPrivate } from './axios';

export const loginUser = async (credentials) => {
  const res = await axiosPublic.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await axiosPublic.post('/auth/register', userData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosPublic.post('/auth/logout');
  return res.data;
};

export const getMe = async () => {
  const res = await axiosPrivate.get('/auth/me');
  return res.data;
};
