import axios from 'axios';
import { API_URL } from '../config/env';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('slads_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if trying to login
      const isAuthRoute = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('slads_token');
        localStorage.removeItem('slads_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  googleLogin: (idToken) => api.post('/auth/google', { idToken }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// Logs Services
export const logsApi = {
  getLogs: (params) => api.get('/logs', { params }),
  getLogStats: () => api.get('/logs/stats'),
  uploadLogs: (formData) =>
    api.post('/logs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getLogById: (id) => api.get(`/logs/${id}`)
};

// Alerts Services
export const alertsApi = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlertStats: () => api.get('/alerts/stats'),
  getAlertById: (id) => api.get(`/alerts/${id}`),
  updateStatus: (id, status) => api.patch(`/alerts/${id}/status`, { status })
};

// Machine Learning Services
export const mlApi = {
  train: (payload) => api.post('/ml/train', payload),
  detect: (payload) => api.post('/ml/detect', payload),
  getInfo: () => api.get('/ml/info'),
  getHealth: () => api.get('/ml/health')
};

// Webhooks Services (Admin)
export const webhooksApi = {
  getWebhooks: () => api.get('/webhooks'),
  createWebhook: (data) => api.post('/webhooks', data),
  deleteWebhook: (id) => api.delete(`/webhooks/${id}`),
  testWebhook: (id) => api.post(`/webhooks/${id}/test`)
};

// Users Services (Admin)
export const usersApi = {
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role })
};

export default api;
