import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const axiosPublic = axios.create({
  baseURL: VITE_API_URL
});

export const axiosPrivate = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true
});

export const setupInterceptors = (accessToken, handleRefresh, logout) => {
  const requestInterceptor = axiosPrivate.interceptors.request.use(
    (config) => {
      if (accessToken && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const responseInterceptor = axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newAccessToken = await handleRefresh();
          if (newAccessToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosPrivate(originalRequest);
          }
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return () => {
    axiosPrivate.interceptors.request.eject(requestInterceptor);
    axiosPrivate.interceptors.response.eject(responseInterceptor);
  };
};
