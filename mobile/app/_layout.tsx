import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { storage } from '../src/utils/storage';
import { authService } from '../src/services/authService';
import { useNotifications } from '../src/hooks/useNotifications';
import { Colors, FontSize, Spacing } from '../src/constants/colors';

const queryClient = new QueryClient();

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <View style={styles.splashLogo}>
        <Ionicons name="search-circle" size={80} color={Colors.primary} />
      </View>
      <Text style={styles.splashBrand}>FindIt</Text>
      <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: Spacing.xl }} />
    </View>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const { isAuthenticated, isLoading, setAuth, setUser, setLoading, logout } = useAuthStore();

  useNotifications(isAuthenticated, (data) => {
    const reportId = data?.reportId as string | undefined;
    const reportType = data?.reportType as string | undefined;
    if (reportId) {
      if (reportType === 'lost' || reportType === 'found') {
        setTimeout(() => router.push(`/${reportType}/${reportId}`), 500);
      } else {
        setTimeout(() => router.push(`/messages/${reportId}`), 500);
      }
    }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const token = await storage.getToken();
        const storedUser = await storage.getUser();

        if (token && storedUser) {
          setAuth(storedUser, token);
          try {
            const { user } = await authService.getMe();
            setUser(user);
            await storage.setUser(user);
          } catch {
            await storage.clear();
            logout();
          }
        }
      } catch {
        // Ignorer les erreurs de stockage
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lost/create" options={{ headerShown: true, title: 'Signaler perdu', presentation: 'modal', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="lost/[id]" options={{ headerShown: true, title: 'Détail', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="found/create" options={{ headerShown: true, title: 'Signaler trouvé', presentation: 'modal', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="found/[id]" options={{ headerShown: true, title: 'Détail', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="messages/[id]" options={{ headerShown: true, title: 'Conversation', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="notifications/index" options={{ headerShown: true, title: 'Notifications', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="admin/index" options={{ headerShown: true, title: 'Administration', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="admin/users" options={{ headerShown: true, title: 'Utilisateurs', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="admin/reports" options={{ headerShown: true, title: 'Signalements', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
          <Stack.Screen name="admin/stats" options={{ headerShown: true, title: 'Statistiques', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }} />
        </Stack>
      </AuthGate>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  splashLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  splashBrand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
});