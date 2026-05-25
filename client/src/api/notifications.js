import { axiosPrivate } from './axios';

export const getNotifications = async () => {
  const res = await axiosPrivate.get('/notifications');
  return res.data;
};

export const markNotificationRead = async (id) => {
  const res = await axiosPrivate.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await axiosPrivate.patch('/notifications/read-all');
  return res.data;
};
