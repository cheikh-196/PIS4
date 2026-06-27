import * as SecureStore from 'expo-secure-store';

const KEYS = {
  TOKEN: 'findit_token',
  USER: 'findit_user',
};

export const storage = {
  async setToken(token: string) {
    await SecureStore.setItemAsync(KEYS.TOKEN, token);
  },
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.TOKEN);
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
  },
  async setUser(user: any) {
    await SecureStore.setItemAsync(KEYS.USER, JSON.stringify(user));
  },
  async getUser(): Promise<any | null> {
    const data = await SecureStore.getItemAsync(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  async removeUser() {
    await SecureStore.deleteItemAsync(KEYS.USER);
  },
  async clear() {
    await SecureStore.deleteItemAsync(KEYS.TOKEN);
    await SecureStore.deleteItemAsync(KEYS.USER);
  },
};
