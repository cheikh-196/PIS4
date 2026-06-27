import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/colors';

interface CardProps {
  title: string;
  subtitle?: string;
  description?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const Card = ({ title, subtitle, description, left, right, onPress, style }: CardProps) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
      </View>
      {right && <View style={styles.right}>{right}</View>}
      {onPress && <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    alignItems: 'center',
    ...Shadow.sm,
  },
  left: { marginRight: Spacing.md },
  content: { flex: 1 },
  right: { marginLeft: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  description: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 4 },
});