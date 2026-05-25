import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import axios from 'axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, accessToken } = useAuth();
  const socket = useSocket();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const list = res.data.data;
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user && accessToken) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, accessToken]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      toast(notif.message, {
        icon: '🔔',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
    };

    const handleApplicationUpdate = (data) => {
      toast.success(`Application Status: ${data.jobTitle} changed to ${data.newStatus}`, {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#1e3a8a',
          color: '#eff6ff',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }
      });
    };

    const handleNewApplicant = (data) => {
      toast.success(`New Applicant! ${data.candidateName} applied to "${data.jobTitle}"`, {
        duration: 5000,
        style: {
          borderRadius: '10px',
          background: '#064e3b',
          color: '#ecfdf5',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }
      });
    };

    socket.on('notification', handleNotification);
    socket.on('application_update', handleApplicationUpdate);
    socket.on('new_applicant', handleNewApplicant);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('application_update', handleApplicationUpdate);
      socket.off('new_applicant', handleNewApplicant);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
