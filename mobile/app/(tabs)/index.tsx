import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { lostService } from '../../src/services/lostService';
import { foundService } from '../../src/services/foundService';
import { notificationService } from '../../src/services/notificationService';
import { searchService, SearchParams } from '../../src/services/searchService';
import { ReportCard } from '../../src/components/reports/ReportCard';
import { CategorySelector } from '../../src/components/reports/CategorySelector';
import { Loading } from '../../src/components/ui/Loading';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Input } from '../../src/components/ui/Input';
import { useResponsive } from '../../src/hooks/useResponsive';
import { useDebounce } from '../../src/hooks/useDebounce';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';
import { Category } from '../../src/types/report';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filters
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const debouncedQuery = useDebounce(query);

  const [hasUnread, setHasUnread] = useState(false);
  const { isTablet, numColumns, containerMaxWidth } = useResponsive();
  const isSearching = debouncedQuery || category || typeFilter !== 'all';

  const loadData = useCallback(async () => {
    try {
      let fetchedReports: any[] = [];

      if (isSearching) {
        // Use search API
        const params: SearchParams = {};
        if (debouncedQuery) params.q = debouncedQuery;
        if (category) params.category = category;

        if (typeFilter === 'all') {
          const data = await searchService.search(params);
          const lost = (data.results?.lost || []).map((r: any) => ({ ...r, reportType: 'lost' as const }));
          const found = (data.results?.found || []).map((r: any) => ({ ...r, reportType: 'found' as const }));
          fetchedReports = [...lost, ...found];
        } else if (typeFilter === 'lost') {
          const data = await searchService.searchLost(params);
          fetchedReports = (data.reports || []).map((r: any) => ({ ...r, reportType: 'lost' as const }));
        } else {
          const data = await searchService.searchFound(params);
          fetchedReports = (data.reports || []).map((r: any) => ({ ...r, reportType: 'found' as const }));
        }
      } else {
        // Default API
        const [lostData, foundData] = await Promise.all([
          lostService.getAll({ limit: 10 }),
          foundService.getAll({ limit: 10 }),
        ]);
        const lost = (lostData.reports || []).map((r: any) => ({ ...r, reportType: 'lost' as const }));
        const found = (foundData.reports || []).map((r: any) => ({ ...r, reportType: 'found' as const }));
        fetchedReports = [...lost, ...found];
      }

      // Sort by date descending
      fetchedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(fetchedReports);

      // Notifs
      const notifData = await notificationService.getAll();
      setHasUnread(notifData.notifications?.some((n: any) => !n.read) || false);

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedQuery, category, typeFilter]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading && !refreshing) return <Loading fullScreen message="Chargement..." />;

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, { maxWidth: containerMaxWidth, width: '100%', alignSelf: 'center' }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.avatarSmall}>
              <Ionicons name="person-circle" size={40} color={Colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>Bonjour{user ? `, ${user.name.split(' ')[0]}` : ''}</Text>
              <Text style={styles.subtitle}>Objets perdus et trouvés</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {user?.role === 'admin' && (
              <TouchableOpacity style={styles.adminBtn} onPress={() => router.push('/admin')}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.textInverse} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              {hasUnread && <View style={styles.badge} />}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.searchSection, isTablet && styles.searchSectionTablet]}>
        <View style={isTablet ? { flex: 1 } : undefined}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un objet..."
            icon="search-outline"
          />
        </View>

        <View style={[styles.filterRow, isTablet && styles.filterRowTablet]}>
          <View style={[styles.typeToggle, { flex: 1 }]}>
            {(['all', 'lost', 'found'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, typeFilter === t && styles.typeBtnActive, { flex: 1, alignItems: 'center' }]}
                onPress={() => setTypeFilter(t)}
              >
                <Text style={[styles.typeBtnText, typeFilter === t && styles.typeBtnTextActive]}>
                  {t === 'all' ? 'Tous' : t === 'lost' ? 'Perdus' : 'Trouvés'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionLost]} onPress={() => router.push('/lost/create')} activeOpacity={0.85}>
          <View style={styles.actionIconWrap}>
            <Ionicons name="search" size={22} color={Colors.lost} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.lost }]}>J'ai perdu</Text>
          <Text style={styles.actionDesc}>Signaler un objet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionFound]} onPress={() => router.push('/found/create')} activeOpacity={0.85}>
          <View style={[styles.actionIconWrap, { backgroundColor: Colors.foundLight }]}>
            <Ionicons name="hand-left" size={22} color={Colors.found} />
          </View>
          <Text style={[styles.actionLabel, { color: Colors.found }]}>J'ai trouvé</Text>
          <Text style={styles.actionDesc}>Signaler un objet</Text>
        </TouchableOpacity>
      </View>

      <CategorySelector selected={category} onSelect={(cat) => setCategory(cat === category ? null : cat)} />

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {isSearching ? `${reports.length} résultat(s)` : `Derniers signalements (${reports.length})`}
        </Text>
        {!isSearching && (
          <Text style={styles.listSubtitle}>
            Utilisez la recherche pour trouver d'autres objets.
          </Text>
        )}
      </View>

      <FlatList
        style={{ flex: 1 }}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: Spacing.md, paddingHorizontal: Spacing.lg } : undefined}
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={numColumns > 1 ? { flex: 1, maxWidth: '48%' } : undefined}>
            <ReportCard
            id={item._id}
            type={item.reportType}
            title={item.title}
            category={item.category}
            city={item.city}
            date={item.reportType === 'lost' ? item.lostDate : item.foundDate}
            image={item.images?.[0]?.url}
            status={item.status}
            userName={item.user?.name || 'Inconnu'}
            reward={item.reward}
          />
        </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun signalement"
            message="Aucun objet ne correspond à votre recherche."
            actionLabel="Signaler un objet"
            onAction={() => router.push('/lost/create')}
          />
        }
        contentContainerStyle={reports.length === 0 ? { flex: 1 } : { paddingBottom: Spacing.xl }}
      />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  innerContainer: { flex: 1 },
  header: {
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarSmall: { width: 40, height: 40, borderRadius: 20 },
  greeting: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  adminBtn: {
    backgroundColor: Colors.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  notifBtn: {
    padding: Spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  searchSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  typeBtnTextActive: { color: Colors.textInverse },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  actionLost: { backgroundColor: Colors.surface },
  actionFound: { backgroundColor: Colors.surface },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: { fontSize: FontSize.md, fontWeight: '700' },
  actionDesc: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  listHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.text },
  listSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  searchSectionTablet: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  filterRowTablet: {
    flex: 1.5,
    marginBottom: 0,
    marginTop: 0,
  },
});