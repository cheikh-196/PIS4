import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/colors';

export const MAURITANIA_CITIES = [
  { value: 'Nouakchott', label: 'Nouakchott', lat: 18.0735, lng: -15.9780 },
  { value: 'Nouadhibou', label: 'Nouadhibou', lat: 20.9320, lng: -17.0347 },
  { value: 'Rosso', label: 'Rosso', lat: 16.5148, lng: -15.8080 },
  { value: 'Kiffa', label: 'Kiffa', lat: 16.6166, lng: -11.4045 },
  { value: 'Kaédi', label: 'Kaédi', lat: 16.1453, lng: -13.5047 },
  { value: 'Zouérat', label: 'Zouérat', lat: 22.7161, lng: -12.4721 },
  { value: 'Sélibaby', label: 'Sélibaby', lat: 15.1558, lng: -12.1843 },
  { value: 'Atar', label: 'Atar', lat: 20.5169, lng: -13.0571 },
  { value: 'Aleg', label: 'Aleg', lat: 17.0500, lng: -13.9242 },
  { value: 'Tidjikja', label: 'Tidjikja', lat: 18.5564, lng: -11.4271 },
];

interface CitySelectorProps {
  selected: string;
  onSelect: (city: string) => void;
}

export const CitySelector = ({ selected, onSelect }: CitySelectorProps) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
    {MAURITANIA_CITIES.map((city) => {
      const isSelected = selected === city.value;

      return (
        <TouchableOpacity
          key={city.value}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onSelect(city.value)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={16} color={isSelected ? Colors.textInverse : Colors.textSecondary} />
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
            {city.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: FontSize.sm, color: Colors.text, fontWeight: '500' },
  chipTextSelected: { color: Colors.textInverse },
});
