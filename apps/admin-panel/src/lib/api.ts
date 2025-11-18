// apps/admin-panel/src/lib/api.ts

import axios from 'axios';
import { notification } from 'antd';
// Use '@/stores/authStore' due to tsconfig path mapping
import { useAuthStore } from '@/stores/authStore'; 

/**
 * @constant api
 * @description Configured Axios instance for all backend communication via Vite proxy.
 */
export const api = axios.create({ 
  baseURL: '/api', 
  timeout: 10000 
});

// Request Interceptor: Inject JWT token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(res => res, error => {
  const status = error.response?.status;
  
  if (status === 401) {
    // CRITICAL: If unauthorized, clear state and force redirect to login
    useAuthStore.getState().logout();
    // Use window.location.href for hard redirect outside of React Router context
    window.location.href = '/login'; 
  }
  
  // Display a consistent Ant Design notification for API errors
  notification.error({ 
    message: 'API Error', 
    description: error.response?.data?.message || 'Request failed unexpectedly',
    placement: 'topRight'
  });
  return Promise.reject(error);
});