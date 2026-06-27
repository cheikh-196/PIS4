import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { adminService } from '../../src/services/adminService';
import { Loading } from '../../src/components/ui/Loading';
import { Badge } from '../../src/components/ui/Badge';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getUsers({ limit: 50 });
        setUsers(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de modifier le rôle.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirmer', `Supprimer l'utilisateur "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await adminService.deleteUser(id);
          setUsers((prev) => prev.filter((u) => u._id !== id));
        },
      },
    ]);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.user}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Badge label={item.role} variant={item.role === 'admin' ? 'warning' : 'default'} />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => toggleRole(item._id, item.role)}>
                <Text style={styles.actionText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.name)}>
                <Text style={styles.actionText}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '600' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  actionText: { fontSize: 18 },
});
