import { useState, useRef, useCallback, useLayoutEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { messageService } from '../../src/services/messageService';
import { useAuthStore } from '../../src/store/authStore';
import { Loading } from '../../src/components/ui/Loading';
import { formatDate } from '../../src/utils/formatDate';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { Message } from '../../src/types/message';

export default function ChatScreen() {
  const { id: reportId, receiverId } = useLocalSearchParams<{ id: string; receiverId?: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const { containerMaxWidth } = useResponsive();

  const fetchMessages = useCallback(async () => {
    try {
      const data = await messageService.getMessages(reportId!);
      setMessages((prev) => {
        if (prev.length === data.messages?.length) return prev;
        return data.messages || [];
      });
    } catch (err) {
      console.error(err);
    }
  }, [reportId]);

  const otherUser = messages.find((m) => m.sender._id !== user?._id)?.sender ||
    messages.find((m) => m.receiver._id !== user?._id)?.receiver;

  useLayoutEffect(() => {
    navigation.setOptions({ title: otherUser?.name || 'Conversation' });
  }, [navigation, otherUser?.name]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        try {
          const [data] = await Promise.all([
            messageService.getMessages(reportId!),
            messageService.markConversationAsRead(reportId!).catch(() => {}),
          ]);
          if (active) setMessages(data.messages || []);
        } catch (err) {
          console.error(err);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();

      const interval = setInterval(async () => {
        if (!active) return;
        await fetchMessages();
      }, 5000);

      return () => {
        active = false;
        clearInterval(interval);
      };
    }, [fetchMessages, reportId])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!content.trim() || !user) return;

    setSending(true);
    try {
      if (editingMessage) {
        const data = await messageService.update(editingMessage._id, content);
        setMessages((prev) => prev.map((m) => (m._id === editingMessage._id ? { ...m, content: data.message.content } : m)));
        setEditingMessage(null);
        setContent('');
      } else {
        let receiver = receiverId ||
          messages.find((m) => m.sender._id !== user._id)?.sender._id ||
          messages.find((m) => m.receiver._id !== user._id)?.receiver._id;

        if (!receiver) {
          console.error('No receiver found');
          return;
        }

        const reportType = messages.find((m) => m.reportType)?.reportType || 'lost';
        const data = await messageService.sendMessage(reportId!, content, receiver, reportType);
        setMessages((prev) => [...prev, data.message]);
        setContent('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleMessageLongPress = (item: Message) => {
    if (item.sender._id !== user?._id) return;

    Alert.alert('Options', 'Que voulez-vous faire ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Modifier', onPress: () => {
          setEditingMessage(item);
          setContent(item.content);
        }
      },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
          try {
            await messageService.delete(item._id);
            setMessages((prev) => prev.filter((m) => m._id !== item._id));
          } catch (err) {
            console.error(err);
          }
        }
      },
    ]);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={{ flex: 1, maxWidth: containerMaxWidth, width: '100%', alignSelf: 'center' }}>
        <FlatList
          ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const isMine = item.sender._id === user?._id;
          return (
            <TouchableOpacity 
              style={[styles.bubbleContainer, isMine ? styles.myBubble : styles.theirBubble]}
              onLongPress={() => handleMessageLongPress(item)}
              delayLongPress={300}
              activeOpacity={0.8}
            >
              <View style={[styles.bubble, isMine ? styles.myBubbleBg : styles.theirBubbleBg]}>
                <Text style={[styles.bubbleText, isMine && styles.myBubbleText]}>{item.content}</Text>
              </View>
              <Text style={[styles.time, isMine ? styles.myTime : styles.theirTime]}>
                {formatDate(item.createdAt)} {isMine && '• Maintenez pour modifier'}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder={editingMessage ? "Modifier le message..." : "Écrivez un message..."}
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity style={[styles.sendBtn, !content.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!content.trim() || sending}>
          <Text style={styles.sendText}>{sending ? '...' : editingMessage ? '✓' : '➤'}</Text>
        </TouchableOpacity>
        {editingMessage && (
          <TouchableOpacity style={styles.cancelEditBtn} onPress={() => { setEditingMessage(null); setContent(''); }}>
            <Text style={styles.cancelEditText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.lg, paddingBottom: Spacing.lg },
  bubbleContainer: { marginBottom: Spacing.md, maxWidth: '80%' },
  myBubble: { alignSelf: 'flex-end' },
  theirBubble: { alignSelf: 'flex-start' },
  bubble: { padding: Spacing.md, borderRadius: BorderRadius.lg },
  myBubbleBg: { backgroundColor: Colors.primary },
  theirBubbleBg: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  myBubbleText: { color: Colors.textInverse },
  time: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 4, paddingHorizontal: 4 },
  myTime: { textAlign: 'right' },
  theirTime: { textAlign: 'left' },
  inputBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    maxHeight: 100,
    marginRight: Spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontSize: 18 },
  cancelEditBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  cancelEditText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
