import apiClient from './api';
import { API } from '../constants/api';
import { User } from '../types/user';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  async register(name: string, email: string, password: string, phone?: string) {
    const { data } = await apiClient.post<AuthResponse>(API.ENDPOINTS.AUTH.REGISTER, { name, email, password, phone });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await apiClient.post<AuthResponse>(API.ENDPOINTS.AUTH.LOGIN, { email, password });
    return data;
  },

  async getMe() {
    const { data } = await apiClient.get<{ success: boolean; user: User }>(API.ENDPOINTS.AUTH.ME);
    return data;
  },

  async updateDetails(body: { name?: string; phone?: string }) {
    const { data } = await apiClient.put<{ success: boolean; user: User }>(API.ENDPOINTS.AUTH.UPDATE_DETAILS, body);
    return data;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const { data } = await apiClient.put<AuthResponse>(API.ENDPOINTS.AUTH.UPDATE_PASSWORD, { currentPassword, newPassword });
    return data;
  },

  async updateAvatar(formData: FormData) {
    const { data } = await apiClient.put<{ success: boolean; user: User }>(API.ENDPOINTS.AUTH.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async updatePushToken(expoPushToken: string) {
    const { data } = await apiClient.put(API.ENDPOINTS.AUTH.PUSH_TOKEN, { expoPushToken });
    return data;
  },

  async forgotPassword(email: string) {
    const { data } = await apiClient.post(API.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await apiClient.post<AuthResponse>(`${API.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, { password });
    return data;
  },
};
