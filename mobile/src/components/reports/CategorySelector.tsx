import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../constants/categories';
import { Category } from '../../types/report';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/colors';

const CATEGORY_IONICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  documents: 'document-text-outline',
  electronics: 'tv-outline',
  keys: 'key-outline',
  large_items: 'cube-outline',
  other: 'apps-outline',
};

interface CategorySelectorProps {
  selected: Category | null;
  onSelect: (category: Category) => void;
}

export const CategorySelector = ({ selected, onSelect }: CategorySelectorProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
    {CATEGORIES.map((cat) => {
      const isSelected = selected === cat.value;
      const iconName = CATEGORY_IONICONS[cat.value] || 'apps-outline';

      return (
        <TouchableOpacity
          key={cat.value}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onSelect(cat.value)}
          activeOpacity={0.7}
        >
          <Ionicons name={iconName} size={16} color={isSelected ? Colors.textInverse : Colors.text} />
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  chipTextSelected: { color: Colors.textInverse },
});