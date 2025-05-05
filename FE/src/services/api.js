import axios from 'axios';
import AuthService from './AuthService';

const api = axios.create({
  baseURL: 'http://localhost:8080/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Interceptor để xử lý request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    if (error.response && error.response.status === 401) {
      try {
        // Thử refresh token trước khi logout
        await AuthService.refreshToken();
        // Nếu refresh thành công, thử lại request ban đầu
        const token = localStorage.getItem('token');
        error.config.headers.Authorization = `Bearer ${token}`;
        return api.request(error.config);
      } catch (refreshError) {
        // Nếu refresh thất bại, logout
        await AuthService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;