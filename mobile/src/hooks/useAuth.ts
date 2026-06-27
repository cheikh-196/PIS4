import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, setAuth, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await storage.getToken();
        const storedUser = await storage.getUser();

        if (storedToken && storedUser) {
          setAuth(storedUser, storedToken);
          const { user: freshUser } = await authService.getMe();
          setUser(freshUser);
          await storage.setUser(freshUser);
        } else {
          setLoading(false);
        }
      } catch {
        await storage.clear();
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    setAuth(res.user, res.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    await storage.setToken(res.token);
    await storage.setUser(res.user);
    setAuth(res.user, res.token);
  };

  const signOut = async () => {
    await storage.clear();
    logout();
  };

  return { user, token, isAuthenticated, isLoading, login, register, signOut };
};
