import apiClient from './api';
import { API } from '../constants/api';
import { LostReport } from '../types/report';

export const lostService = {
  async getAll(params?: Record<string, any>) {
    const { data } = await apiClient.get(API.ENDPOINTS.LOST.BASE, { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ success: boolean; report: LostReport }>(API.ENDPOINTS.LOST.BY_ID(id));
    return data;
  },

  async create(formData: FormData) {
    const { data } = await apiClient.post<{ success: boolean; report: LostReport }>(API.ENDPOINTS.LOST.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: string, body: Partial<LostReport>) {
    const { data } = await apiClient.put<{ success: boolean; report: LostReport }>(API.ENDPOINTS.LOST.BY_ID(id), body);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.LOST.BY_ID(id));
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.LOST.STATUS(id), { status });
    return data;
  },

  async getMy() {
    const { data } = await apiClient.get(API.ENDPOINTS.LOST.MY);
    return data;
  },
};
