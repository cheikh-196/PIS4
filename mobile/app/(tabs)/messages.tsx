import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '../../src/services/messageService';
import { useAuthStore } from '../../src/store/authStore';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { formatDate } from '../../src/utils/formatDate';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';
import { Conversation } from '../../src/types/message';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await loadConversations();
        setLoading(false);
      })();
    }, [loadConversations])
  );

  if (loading) return <Loading fullScreen message="Chargement..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => {
          const msg = item.lastMessage;
          if (!msg || !msg.sender || !msg.receiver) return null;
          const otherUser = msg.sender._id === user?._id ? msg.receiver : msg.sender;

          return (
            <TouchableOpacity
              style={styles.conversation}
              onPress={() => router.push(`/messages/${item._id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="person" size={22} color={Colors.primary} />
              </View>
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {otherUser?.name || 'Utilisateur'}
                  </Text>
                  <Text style={styles.time}>{formatDate(msg.createdAt)}</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={[styles.preview, !msg.read && styles.unread]} numberOfLines={1}>
                    {msg.content}
                  </Text>
                  {item.unread > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Aucune conversation"
            message="Contactez quelqu'un depuis un signalement pour démarrer une discussion."
          />
        }
        contentContainerStyle={conversations.length === 0 ? { flex: 1 } : { paddingBottom: Spacing.xl }}
      />
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
  conversation: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, flex: 1 },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary, marginLeft: Spacing.sm },
  bottomRow: { flexDirection: 'row', alignItems: 'center' },
  preview: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  unread: { fontWeight: '600', color: Colors.text },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  badgeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '600' },
});