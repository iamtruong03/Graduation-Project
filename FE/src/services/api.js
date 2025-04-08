import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi baseURL theo địa chỉ API của bạn
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    if (error.response) {
      // Xử lý các lỗi response (status code không phải 2xx)
      switch (error.response.status) {
        case 401:
          // Xử lý lỗi unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Xử lý lỗi forbidden
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default api;