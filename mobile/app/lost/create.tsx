import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { CategorySelector } from '../../src/components/reports/CategorySelector';
import { CitySelector, MAURITANIA_CITIES } from '../../src/components/ui/CitySelector';
import { ImagePickerComponent } from '../../src/components/reports/ImagePicker';
import { lostService } from '../../src/services/lostService';
import { useLocation } from '../../src/hooks/useLocation';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';
import { Category } from '../../src/types/report';

export default function CreateLostScreen() {
  const { location } = useLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [city, setCity] = useState('Nouakchott');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reward, setReward] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { contentMaxWidth } = useResponsive();

  useEffect(() => {
    if (location?.city) setCity(location.city);
  }, [location]);

  const handleSubmit = async () => {
    if (!title || !description || !category || !city || !date) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('city', city);
      const cityData = MAURITANIA_CITIES.find(c => c.value === city);
      formData.append('coordinates', JSON.stringify([
        cityData?.lng || location?.longitude || -15.9780,
        cityData?.lat || location?.latitude || 18.0735,
      ]));
      formData.append('date', new Date(date).toISOString());
      if (reward) formData.append('reward', reward);

      images.forEach((img) => {
        formData.append('images', {
          uri: img.uri,
          type: 'image/jpeg',
          name: img.fileName || 'photo.jpg',
        } as any);
      });

      await lostService.create(formData);
      Alert.alert('Succès', 'Votre signalement a été publié.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={[styles.scroll, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]} keyboardShouldPersistTaps="handled">
        <View style={styles.sectionHeader}>
          <Ionicons name="search" size={20} color={Colors.lost} />
          <Text style={[styles.section, { color: Colors.lost }]}> Catégorie *</Text>
        </View>
        <CategorySelector selected={category} onSelect={setCategory} />

        <Input label="Titre *" value={title} onChangeText={setTitle} placeholder="Ex: iPhone 15 bleu" icon="text-outline" />
        <Input label="Description *" value={description} onChangeText={setDescription} placeholder="Décrivez l'objet en détail..." multiline icon="document-text-outline" />
        
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color={Colors.text} />
          <Text style={styles.section}> Ville *</Text>
        </View>
        <CitySelector selected={city} onSelect={setCity} />

        <Input label="Date de perte *" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" icon="calendar-outline" />
        <Input label="Récompense (UM)" value={reward} onChangeText={setReward} placeholder="Optionnel" keyboardType="numeric" icon="cash-outline" />

        <View style={styles.sectionHeader}>
          <Ionicons name="images-outline" size={20} color={Colors.text} />
          <Text style={styles.section}> Photos</Text>
        </View>
        <ImagePickerComponent images={images} onImagesSelected={setImages} />

        <Button
          title="Publier le signalement"
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          fullWidth
          size="lg"
          icon="cloud-upload-outline"
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.md },
  section: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  button: { marginTop: Spacing.xl },
});