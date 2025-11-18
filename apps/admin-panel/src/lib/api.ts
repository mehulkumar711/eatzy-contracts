import axios from 'axios';
import { notification } from 'antd';
import { useAuthStore } from '@/stores/authStore';

export const api = axios.create({ baseURL: '/api', timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res => res, error => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }
  notification.error({ message: 'Error', description: error.response?.data?.message || 'Request failed' });
  return Promise.reject(error);
});