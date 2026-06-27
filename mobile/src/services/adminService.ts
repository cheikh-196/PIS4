import apiClient from './api';
import { API } from '../constants/api';

export const adminService = {
  async getUsers(params?: Record<string, any>) {
    const { data } = await apiClient.get(API.ENDPOINTS.ADMIN.USERS, { params });
    return data;
  },

  async getUser(id: string) {
    const { data } = await apiClient.get(API.ENDPOINTS.ADMIN.USER(id));
    return data;
  },

  async updateUserRole(id: string, role: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.ADMIN.USER_ROLE(id), { role });
    return data;
  },

  async deleteUser(id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.ADMIN.USER(id));
    return data;
  },

  async getReports(params?: Record<string, any>) {
    const { data } = await apiClient.get(API.ENDPOINTS.ADMIN.REPORTS, { params });
    return data;
  },

  async deleteReport(type: string, id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.ADMIN.REPORT(type, id));
    return data;
  },

  async getStats() {
    const { data } = await apiClient.get(API.ENDPOINTS.ADMIN.STATS);
    return data;
  },

  async getDailyStats(days?: number) {
    const { data } = await apiClient.get(API.ENDPOINTS.ADMIN.STATS_DAILY, { params: { days } });
    return data;
  },
};
