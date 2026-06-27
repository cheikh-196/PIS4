import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { foundService } from '../../src/services/foundService';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Loading } from '../../src/components/ui/Loading';
import { formatDate } from '../../src/utils/formatDate';
import { CATEGORY_LABELS } from '../../src/constants/categories';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { FoundReport } from '../../src/types/report';
import { getImageUrl } from '../../src/utils/getImageUrl';

export default function FoundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [report, setReport] = useState<FoundReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await foundService.getById(id!);
        setReport(data.report);
      } catch {
        Alert.alert('Erreur', 'Signalement introuvable.');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !report) return <Loading fullScreen />;

  const isOwner = user?._id === report.user?._id;
  const isAdmin = user?.role === 'admin';

  const handleContact = () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour contacter cette personne.');
      return;
    }
    router.push(`/messages/${report._id}?receiverId=${report.user._id}`);
  };

  const handleDelete = () => {
    Alert.alert('Confirmer', 'Supprimer ce signalement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => { await foundService.delete(id!); router.back(); },
      },
    ]);
  };

  const handleResolve = () => {
    Alert.alert('Confirmer', 'Marquer ce signalement comme résolu ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Oui',
        onPress: async () => {
          try {
            await foundService.updateStatus(id!, 'returned');
            setReport({ ...report, status: 'returned' });
          } catch (e) {
            Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
      {report.images?.[0] && (
        <Image source={{ uri: getImageUrl(report.images[0].url)! }} style={styles.image} />
      )}

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.title}>{report.title}</Text>
          <Badge label={report.status === 'active' ? 'Actif' : 'Rendu'} variant={report.status === 'active' ? 'warning' : 'success'} />
        </View>

        <Text style={styles.category}>{CATEGORY_LABELS[report.category] || report.category}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>📍 {report.city}</Text>
          <Text style={styles.meta}>🗓 Trouvé le {formatDate(report.foundDate)}</Text>
        </View>

        {report.heldAt && (
          <View style={styles.heldBox}>
            <Text style={styles.heldText}>🏛 Déposé à : {report.heldAt}</Text>
          </View>
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{report.description}</Text>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Signalé par</Text>
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{report.user?.name?.[0] || '?'}</Text>
          </View>
          <Text style={styles.userName}>{report.user?.name}</Text>
        </View>

        <View style={styles.actions}>
          {!isOwner && (
            <Button title="Contacter" onPress={handleContact} icon="chatbubble-ellipses-outline" fullWidth />
          )}
          {isOwner && report.status !== 'returned' && (
            <Button title="Marquer comme résolu" onPress={handleResolve} variant="primary" icon="checkmark-circle-outline" fullWidth style={{ marginBottom: 12 }} />
          )}
          {(isOwner || isAdmin) && (
            <Button title="Supprimer" onPress={handleDelete} variant="danger" icon="trash-outline" fullWidth />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  body: { padding: Spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: Spacing.md },
  category: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  meta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  heldBox: {
    backgroundColor: '#E5F5FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  heldText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.info },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 22 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.found, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: '600' },
  userName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  actions: { marginTop: Spacing.xxl, gap: Spacing.md },
});