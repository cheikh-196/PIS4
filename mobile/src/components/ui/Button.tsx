import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: any;
  fullWidth?: boolean;
}

export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, iconPosition = 'left', style, fullWidth,
}: ButtonProps) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const btnSize = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 36 },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 48 },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl, minHeight: 56 },
  }[size];

  const textSize = {
    sm: FontSize.sm,
    md: FontSize.md,
    lg: FontSize.lg,
  }[size];

  const iconSize = { sm: 16, md: 18, lg: 20 }[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        btnSize,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline || isGhost ? Colors.primary : Colors.textInverse}
          size={size === 'lg' ? 'large' : 'small'}
        />
      ) : (
        <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
          {icon && <Ionicons name={icon} size={iconSize} color={isOutline || isGhost ? Colors.primary : Colors.textInverse} style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight} />}
          <Text style={[styles.text, { fontSize: textSize }, isOutline && styles.outlineText, isGhost && styles.ghostText]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary, ...Shadow.sm },
  secondary: { backgroundColor: Colors.secondary, ...Shadow.sm },
  danger: { backgroundColor: Colors.danger, ...Shadow.sm },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  contentReverse: { flexDirection: 'row-reverse' },
  text: { color: Colors.textInverse, fontWeight: '600' },
  outlineText: { color: Colors.primary },
  ghostText: { color: Colors.primary },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});