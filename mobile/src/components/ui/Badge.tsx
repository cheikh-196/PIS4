import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, BorderRadius } from '../../constants/colors';

interface BadgeProps {
  label: string;
  variant?: 'lost' | 'found' | 'success' | 'warning' | 'default';
  icon?: keyof typeof Ionicons.glyphMap;
}

const badgeConfig = {
  lost: { bg: Colors.lostLight, text: Colors.lost, icon: 'search' as const },
  found: { bg: Colors.foundLight, text: Colors.found, icon: 'hand-left' as const },
  success: { bg: Colors.successLight, text: Colors.success, icon: 'checkmark-circle' as const },
  warning: { bg: Colors.warningLight, text: Colors.warning, icon: 'alert-circle' as const },
  default: { bg: Colors.background, text: Colors.textSecondary, icon: undefined },
};

export const Badge = ({ label, variant = 'default', icon }: BadgeProps) => {
  const config = badgeConfig[variant];
  const showIcon = icon || config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      {showIcon && <Ionicons name={showIcon} size={12} color={config.text} style={styles.icon} />}
      <Text style={[styles.text, { color: config.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: 3 },
  text: { fontSize: FontSize.xs, fontWeight: '600' },
});