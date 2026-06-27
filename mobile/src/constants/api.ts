const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API = {
  BASE_URL: API_URL,
  TIMEOUT: 15000,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      ME: '/auth/me',
      UPDATE_DETAILS: '/auth/update-details',
      UPDATE_PASSWORD: '/auth/update-password',
      AVATAR: '/auth/avatar',
      PUSH_TOKEN: '/auth/push-token',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    LOST: {
      BASE: '/lost',
      MY: '/lost/my',
      BY_ID: (id: string) => `/lost/${id}`,
      STATUS: (id: string) => `/lost/${id}/status`,
      IMAGES: (id: string) => `/lost/${id}/images`,
      IMAGE: (id: string, imageId: string) => `/lost/${id}/images/${imageId}`,
    },
    FOUND: {
      BASE: '/found',
      MY: '/found/my',
      BY_ID: (id: string) => `/found/${id}`,
      STATUS: (id: string) => `/found/${id}/status`,
      IMAGES: (id: string) => `/found/${id}/images`,
      IMAGE: (id: string, imageId: string) => `/found/${id}/images/${imageId}`,
    },
    SEARCH: {
      BASE: '/search',
      LOST: '/search/lost',
      FOUND: '/search/found',
    },
    MATCHES: {
      BASE: '/matches',
      RUN: '/matches/run',
      BY_ID: (id: string) => `/matches/${id}`,
      ACCEPT: (id: string) => `/matches/${id}/accept`,
      REJECT: (id: string) => `/matches/${id}/reject`,
    },
    MESSAGES: {
      CONVERSATIONS: '/messages/conversations',
      CONVERSATION_READ: (reportId: string) => `/messages/conversations/${reportId}/read`,
      BY_REPORT: (reportId: string) => `/messages/${reportId}`,
      READ: (id: string) => `/messages/${id}/read`,
      UPDATE: (id: string) => `/messages/${id}`,
      DELETE: (id: string) => `/messages/${id}`,
    },
    NOTIFICATIONS: {
      BASE: '/notifications',
      READ: (id: string) => `/notifications/${id}/read`,
      READ_ALL: '/notifications/read-all',
      DELETE: (id: string) => `/notifications/${id}`,
    },
    ADMIN: {
      USERS: '/admin/users',
      USER: (id: string) => `/admin/users/${id}`,
      USER_ROLE: (id: string) => `/admin/users/${id}/role`,
      REPORTS: '/admin/reports',
      REPORT: (type: string, id: string) => `/admin/reports/${type}/${id}`,
      STATS: '/admin/stats',
      STATS_DAILY: '/admin/stats/daily',
    },
    MAP: {
      REPORTS: '/map/reports',
      NEARBY: '/map/reports/nearby',
    },
  },
};
