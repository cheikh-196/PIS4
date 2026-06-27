import axios from 'axios';
import { API } from '../constants/api';
import { storage } from '../utils/storage';

const apiClient = axios.create({
  baseURL: API.BASE_URL,
  timeout: API.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
