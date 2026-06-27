import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/colors';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatDate';
import { CATEGORY_LABELS } from '../../constants/categories';
import { getImageUrl } from '../../utils/getImageUrl';

interface ReportCardProps {
  id: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  city: string;
  date: string;
  image?: string;
  status: string;
  userName: string;
  reward?: number;
}

export const ReportCard = ({
  id, type, title, category, city, date, image, status, userName, reward,
}: ReportCardProps) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.7}
    onPress={() => router.push(type === 'lost' ? `/lost/${id}` : `/found/${id}`)}
  >
    <View style={styles.imageContainer}>
      {image ? (
        <Image source={{ uri: getImageUrl(image)! }} style={styles.image} />
      ) : (
        <View style={[styles.placeholder, type === 'lost' ? styles.lostBg : styles.foundBg]}>
          <Ionicons
            name={type === 'lost' ? 'search' : 'hand-left'}
            size={28}
            color={type === 'lost' ? Colors.lost : Colors.found}
          />
        </View>
      )}
      <Badge
        label={type === 'lost' ? 'Perdu' : 'Trouvé'}
        variant={type === 'lost' ? 'lost' : 'found'}
      />
    </View>
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="pricetag-outline" size={12} color={Colors.textTertiary} />
        <Text style={styles.categoryText}>{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
        <Text style={styles.metaText}>{city}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Ionicons name="calendar-outline" size={12} color={Colors.textTertiary} />
        <Text style={styles.metaText}>{formatDate(date)}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.userRow}>
          <Ionicons name="person-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.userText}>{userName}</Text>
        </View>
        {reward != null && reward > 0 && (
          <View style={styles.rewardBadge}>
            <Ionicons name="cash-outline" size={12} color={Colors.warning} />
            <Text style={styles.rewardText}>{reward}€</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  imageContainer: { width: 110, position: 'relative' },
  image: { width: '100%', height: 130, resizeMode: 'cover' },
  placeholder: {
    width: '100%',
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lostBg: { backgroundColor: Colors.dangerLight },
  foundBg: { backgroundColor: Colors.foundLight },
  content: { flex: 1, padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  categoryText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  metaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  metaDot: { fontSize: FontSize.xs, color: Colors.textTertiary, marginHorizontal: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  userText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  rewardText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: '600' },
});