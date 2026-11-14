import axios, { type AxiosRequestConfig } from 'axios';

export const adminClient = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('xfive_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('xfive_admin_token');
      localStorage.removeItem('xfive_admin_logged');
      delete axios.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => adminClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => adminClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => adminClient.put<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => adminClient.patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => adminClient.delete<T>(url, config),
};

export default adminApi;
