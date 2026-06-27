import apiClient from './api';
import { API } from '../constants/api';
import { FoundReport } from '../types/report';

export const foundService = {
  async getAll(params?: Record<string, any>) {
    const { data } = await apiClient.get(API.ENDPOINTS.FOUND.BASE, { params });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get<{ success: boolean; report: FoundReport }>(API.ENDPOINTS.FOUND.BY_ID(id));
    return data;
  },

  async create(formData: FormData) {
    const { data } = await apiClient.post<{ success: boolean; report: FoundReport }>(API.ENDPOINTS.FOUND.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: string, body: Partial<FoundReport>) {
    const { data } = await apiClient.put<{ success: boolean; report: FoundReport }>(API.ENDPOINTS.FOUND.BY_ID(id), body);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.FOUND.BY_ID(id));
    return data;
  },

  async updateStatus(id: string, status: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.FOUND.STATUS(id), { status });
    return data;
  },

  async getMy() {
    const { data } = await apiClient.get(API.ENDPOINTS.FOUND.MY);
    return data;
  },
};
