import apiClient from './api';
import { API } from '../constants/api';

export const matchService = {
  async run(reportId: string, reportType: string) {
    const { data } = await apiClient.post(API.ENDPOINTS.MATCHES.RUN, { reportId, reportType });
    return data;
  },

  async getMy() {
    const { data } = await apiClient.get(API.ENDPOINTS.MATCHES.BASE);
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(API.ENDPOINTS.MATCHES.BY_ID(id));
    return data;
  },

  async accept(id: string) {
    const { data } = await apiClient.post(API.ENDPOINTS.MATCHES.ACCEPT(id));
    return data;
  },

  async reject(id: string) {
    const { data } = await apiClient.post(API.ENDPOINTS.MATCHES.REJECT(id));
    return data;
  },
};
