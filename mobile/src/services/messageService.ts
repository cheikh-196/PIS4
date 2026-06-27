import apiClient from './api';
import { API } from '../constants/api';

export const messageService = {
  async getConversations() {
    const { data } = await apiClient.get(API.ENDPOINTS.MESSAGES.CONVERSATIONS);
    return data;
  },

  async getMessages(reportId: string) {
    const { data } = await apiClient.get(API.ENDPOINTS.MESSAGES.BY_REPORT(reportId));
    return data;
  },

  async sendMessage(reportId: string, content: string, receiver: string, reportType: string) {
    const { data } = await apiClient.post(API.ENDPOINTS.MESSAGES.BY_REPORT(reportId), { content, receiver, reportType });
    return data;
  },

  async markAsRead(id: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.MESSAGES.READ(id));
    return data;
  },

  async markConversationAsRead(reportId: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.MESSAGES.CONVERSATION_READ(reportId));
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(API.ENDPOINTS.MESSAGES.DELETE(id));
    return data;
  },

  async update(id: string, content: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.MESSAGES.UPDATE(id), { content });
    return data;
  },
};
