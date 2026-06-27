import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { adminService } from '../../src/services/adminService';
import { Loading } from '../../src/components/ui/Loading';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';

export default function AdminStatsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [daily, setDaily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, dailyData] = await Promise.all([
          adminService.getStats(),
          adminService.getDailyStats(14),
        ]);
        setStats(statsData.stats);
        setDaily(dailyData.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Vue d'ensemble</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total utilisateurs</Text>
          <Text style={styles.statValue}>{stats?.total?.users || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Objets perdus</Text>
          <Text style={styles.statValue}>{stats?.total?.lost || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Objets trouvés</Text>
          <Text style={styles.statValue}>{stats?.total?.found || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Correspondances</Text>
          <Text style={styles.statValue}>{stats?.total?.matches || 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✅ Statuts</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Perdus actifs</Text>
          <Text style={[styles.statValue, { color: Colors.lost }]}>{stats?.active?.lost || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Trouvés actifs</Text>
          <Text style={[styles.statValue, { color: Colors.found }]}>{stats?.active?.found || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Résolus (perdus)</Text>
          <Text style={styles.statValue}>{stats?.resolved?.lost || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Rendus (trouvés)</Text>
          <Text style={styles.statValue}>{stats?.resolved?.found || 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Aujourd'hui</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Nouveaux inscrits</Text>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{stats?.today?.users || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Nouveaux perdus</Text>
          <Text style={[styles.statValue, { color: Colors.lost }]}>{stats?.today?.lost || 0}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Nouveaux trouvés</Text>
          <Text style={[styles.statValue, { color: Colors.found }]}>{stats?.today?.found || 0}</Text>
        </View>
      </View>

      {daily?.daily?.lost && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Activité (14 jours)</Text>
          {daily.daily.lost.slice(-7).map((d: any, i: number) => (
            <View key={i} style={styles.statRow}>
              <Text style={styles.statLabel}>{d._id}</Text>
              <Text style={styles.statValue}>
                🔴 {d.count}
                {daily.daily.found?.[i] && ` 🟢 ${daily.daily.found[i]?.count || 0}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {stats?.byCategory?.lost && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷 Par catégorie</Text>
          {stats.byCategory.lost.map((cat: any, i: number) => (
            <View key={i} style={styles.statRow}>
              <Text style={styles.statLabel}>{cat._id}</Text>
              <Text style={styles.statValue}>{cat.count}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  statLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
});
