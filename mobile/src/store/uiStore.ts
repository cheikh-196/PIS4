import { create } from 'zustand';

interface UIState {
  unreadNotifications: number;
  setUnreadNotifications: (count: number) => void;
  isOnline: boolean;
  setOnline: (online: boolean) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  unreadNotifications: 0,
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  isOnline: true,
  setOnline: (isOnline) => set({ isOnline }),
  selectedTab: 'index',
  setSelectedTab: (tab) => set({ selectedTab: tab }),
}));
