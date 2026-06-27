import apiClient from './api';
import { API } from '../constants/api';

export const notificationService = {
  async getAll(params?: Record<string, any>) {
    const { data } = await apiClient.get(API.ENDPOINTS.NOTIFICATIONS.BASE, { params });
    return data;
  },

  async markAsRead(id: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.NOTIFICATIONS.READ(id));
    return data;
  },

  async markAllAsRead() {
    const { data } = await apiClient.put(API.ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.NOTIFICATIONS.DELETE(id));
    return data;
  },
};
