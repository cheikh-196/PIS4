import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { adminService } from '../../src/services/adminService';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { formatDate } from '../../src/utils/formatDate';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getReports({ limit: 50 });
        const all = [
          ...(data.lost || []).map((r: any) => ({ ...r, reportType: 'lost' })),
          ...(data.found || []).map((r: any) => ({ ...r, reportType: 'found' })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = (id: string, type: string) => {
    Alert.alert('Confirmer', 'Supprimer ce signalement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          await adminService.deleteReport(type, id);
          setReports((prev) => prev.filter((r) => r._id !== id));
        },
      },
    ]);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.report}>
            <View style={styles.header}>
              <Badge label={item.reportType === 'lost' ? 'Perdu' : 'Trouvé'} variant={item.reportType === 'lost' ? 'lost' : 'found'} />
              <Badge label={item.status} variant={item.status === 'active' ? 'warning' : 'success'} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.user?.name || 'Inconnu'} · {item.city} · {formatDate(item.createdAt)}
            </Text>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id, item.reportType)}>
              <Text style={styles.deleteText}>🗑 Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Aucun signalement" />}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  report: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  meta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  deleteBtn: { alignSelf: 'flex-end' },
  deleteText: { color: Colors.danger, fontSize: FontSize.sm, fontWeight: '600' },
});
