import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../src/services/notificationService';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatDate } from '../../src/utils/formatDate';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { AppNotification } from '../../src/types/notification';

const TYPE_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  match_found: { name: 'locate', color: Colors.match },
  new_message: { name: 'chatbubble', color: Colors.primary },
  report_resolved: { name: 'checkmark-circle', color: Colors.success },
  admin_alert: { name: 'notifications', color: Colors.warning },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { contentMaxWidth } = useResponsive();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadNotifications();
        setLoading(false);
      })();
    }, [loadNotifications])
  );

  const handlePress = async (item: AppNotification) => {
    if (!item.read) {
      await notificationService.markAsRead(item._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
      );
    }

    const reportId = item.data?.reportId as string | undefined;
    const reportType = item.data?.reportType as string | undefined;
    if (reportId) {
      if (reportType === 'lost' || reportType === 'found') {
        router.push(`/${reportType}/${reportId}`);
      } else {
        router.push(`/messages/${reportId}`);
      }
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => {
          const iconConfig = TYPE_ICONS[item.type] || { name: 'notifications-outline', color: Colors.textTertiary };

          return (
            <TouchableOpacity
              style={[styles.item, !item.read && styles.unread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconConfig.color + '15' }]}>
                <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="notifications-outline" title="Aucune notification" message="Vous serez notifié lors des correspondances." />
        }
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: Spacing.xl }}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
  item: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  unread: { backgroundColor: Colors.primaryLight },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: { flex: 1 },
  title: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  unreadText: { fontWeight: '700' },
  body: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
});