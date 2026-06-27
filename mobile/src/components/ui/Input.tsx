import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/colors';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string | null;
  editable?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export const Input = ({
  label, value, onChangeText, placeholder, secureTextEntry,
  multiline, keyboardType, autoCapitalize, error, editable,
  icon, rightIcon, onRightIconPress,
}: InputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        focused && styles.inputFocused,
        error && styles.inputError,
        multiline && styles.inputMultiline,
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? Colors.primary : Colors.textTertiary}
            style={styles.prefixIcon}
          />
        )}
        <TextInput
          style={[styles.input, multiline && styles.multilineText]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.suffixIcon}>
            <Ionicons name={rightIcon} size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  inputFocused: { borderColor: Colors.primary },
  inputError: { borderColor: Colors.danger },
  inputMultiline: { minHeight: 100, alignItems: 'flex-start' },
  prefixIcon: { marginRight: Spacing.sm },
  suffixIcon: { marginLeft: Spacing.sm, padding: 4 },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  multilineText: { minHeight: 80, paddingTop: Spacing.sm },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
});