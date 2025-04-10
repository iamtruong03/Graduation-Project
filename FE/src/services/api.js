import axios from 'axios';
import AuthService from './AuthService';

const api = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý request
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response && error.response.status === 403) {
      await AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;