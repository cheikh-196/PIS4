import apiClient from './api';
import { API } from '../constants/api';

export interface SearchParams {
  q?: string;
  category?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const searchService = {
  async search(params: SearchParams) {
    const { data } = await apiClient.get(API.ENDPOINTS.SEARCH.BASE, { params });
    return data;
  },

  async searchLost(params: SearchParams) {
    const { data } = await apiClient.get(API.ENDPOINTS.SEARCH.LOST, { params });
    return data;
  },

  async searchFound(params: SearchParams) {
    const { data } = await apiClient.get(API.ENDPOINTS.SEARCH.FOUND, { params });
    return data;
  },
};
