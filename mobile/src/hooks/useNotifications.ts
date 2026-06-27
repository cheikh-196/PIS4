import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { authService } from '../services/authService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type NotificationHandler = (data: Record<string, unknown>) => void;

export const useNotifications = (enabled = true, onNotificationResponse?: NotificationHandler) => {
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);
  const onResponseRef = useRef(onNotificationResponse);
  onResponseRef.current = onNotificationResponse;

  const registerForPush = async () => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.manifest?.extra?.eas?.projectId;
      if (!projectId) {
        if (__DEV__) console.warn('Push notifications désactivées : projectId non configuré.');
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });

      await authService.updatePushToken(token.data);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      return token.data;
    } catch (error) {
      console.error('Push registration error:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    registerForPush();
  }, [enabled]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const { data } = response.notification.request.content;
      onResponseRef.current?.(data as Record<string, unknown>);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { registerForPush };
};