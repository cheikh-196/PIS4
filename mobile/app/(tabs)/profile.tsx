import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useAuth } from '../../src/hooks/useAuth';
import { lostService } from '../../src/services/lostService';
import { foundService } from '../../src/services/foundService';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { contentMaxWidth } = useResponsive();
  
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lostRes, foundRes] = await Promise.all([
          lostService.getMy(),
          foundService.getMy()
        ]);
        
        const lostReports = lostRes.reports || [];
        const foundReports = foundRes.reports || [];
        
        const resolvedLost = lostReports.filter((r: any) => r.status === 'resolved').length;
        const resolvedFound = foundReports.filter((r: any) => r.status === 'returned').length;

        setStats({
          lost: lostReports.length,
          found: foundReports.length,
          resolved: resolvedLost + resolvedFound,
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      }
    };
    fetchStats();
  }, []);

  const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; route: string | null; color?: string }[] = [
    { icon: 'person-outline', label: 'Modifier le profil', route: null },
    { icon: 'lock-closed-outline', label: 'Changer mot de passe', route: null },
    { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
    { icon: 'help-circle-outline', label: 'Centre d\'aide', route: null },
  ];

  if (user?.role === 'admin') {
    menuItems.unshift({ icon: 'shield-checkmark-outline', label: 'Administration', route: '/admin', color: Colors.secondary });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editAvatar}>
            <Ionicons name="camera" size={14} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.phone}>{user.phone}</Text>
          </View>
        )}
        <View style={styles.roleBadge}>
          <Ionicons name={user?.role === 'admin' ? 'shield-checkmark' : 'person'} size={14} color={Colors.textSecondary} />
          <Text style={styles.roleText}>{user?.role === 'admin' ? ' Administrateur' : ' Utilisateur'}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="search" size={20} color={Colors.lost} />
          <Text style={styles.statNumber}>{stats.lost}</Text>
          <Text style={styles.statLabel}>Perdus</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="hand-left" size={20} color={Colors.found} />
          <Text style={styles.statNumber}>{stats.found}</Text>
          <Text style={styles.statLabel}>Trouvés</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.statNumber}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Résolus</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
            onPress={() => item.route && router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, item.color ? { backgroundColor: item.color + '20' } : undefined]}>
              <Ionicons name={item.icon} size={20} color={item.color || Colors.text} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}> Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl + 20,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  name: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.text },
  email: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  phone: { fontSize: FontSize.sm, color: Colors.textSecondary },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  stat: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statNumber: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text, marginTop: Spacing.sm },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  menu: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadow.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.danger },
});