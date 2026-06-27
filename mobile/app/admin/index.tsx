import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../src/services/adminService';
import { Loading } from '../../src/components/ui/Loading';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading fullScreen message="Chargement..." />;

  const cards = [
    { label: 'Utilisateurs', value: stats?.total?.users || 0, icon: 'people-outline' as const, color: Colors.primary },
    { label: 'Perdus', value: stats?.total?.lost || 0, icon: 'search-outline' as const, color: Colors.lost },
    { label: 'Trouvés', value: stats?.total?.found || 0, icon: 'hand-left-outline' as const, color: Colors.found },
    { label: 'Correspondances', value: stats?.total?.matches || 0, icon: 'git-compare-outline' as const, color: Colors.match },
    { label: "Aujourd'hui", value: (stats?.today?.lost || 0) + (stats?.today?.found || 0), icon: 'trending-up-outline' as const, color: Colors.warning },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={28} color={Colors.textInverse} />
        </View>
        <Text style={styles.title}>Administration</Text>
        <Text style={styles.subtitle}>Tableau de bord FindIt</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.cardIconWrap, { backgroundColor: card.color + '15' }]}>
              <Ionicons name={card.icon} size={24} color={card.color} />
            </View>
            <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menu}>
        {[
          { icon: 'people-outline' as const, label: 'Gérer les utilisateurs', route: '/admin/users' },
          { icon: 'document-text-outline' as const, label: 'Gérer les signalements', route: '/admin/reports' },
          { icon: 'bar-chart-outline' as const, label: 'Statistiques détaillées', route: '/admin/stats' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name={item.icon} size={20} color={Colors.text} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {stats?.byCategory && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetags-outline" size={18} color={Colors.text} />
            <Text style={styles.sectionTitle}> Par catégorie</Text>
          </View>
          {stats.byCategory.lost?.slice(0, 5).map((cat: any, i: number) => (
            <View key={i} style={styles.statRow}>
              <Text style={styles.statLabel}>{cat._id}</Text>
              <Text style={styles.statValue}>{cat.count}</Text>
            </View>
          ))}
        </View>
      )}

      {stats?.byCity && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={18} color={Colors.text} />
            <Text style={styles.sectionTitle}> Top villes</Text>
          </View>
          {stats.byCity.lost?.slice(0, 5).map((city: any, i: number) => (
            <View key={i} style={styles.statRow}>
              <Text style={styles.statLabel}>{city._id}</Text>
              <Text style={styles.statValue}>{city.count}</Text>
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
  header: { alignItems: 'center', marginBottom: Spacing.xl, paddingTop: Spacing.md },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardValue: { fontSize: FontSize.xxl, fontWeight: 'bold' },
  cardLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
  menu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  statLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
});