import { View, Image, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/colors';

interface ImagePickerProps {
  images: any[];
  onImagesSelected: (images: any[]) => void;
  max?: number;
}

export const ImagePickerComponent = ({ images, onImagesSelected, max = 5 }: ImagePickerProps) => {
  const pickImage = async () => {
    if (images.length >= max) return;

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: max - images.length,
    });

    if (!result.canceled) {
      onImagesSelected([...images, ...result.assets]);
    }
  };

  const removeImage = (index: number) => {
    onImagesSelected(images.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.uri || item.url }} style={styles.image} />
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
              <Ionicons name="close" size={14} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          images.length < max ? (
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
              <Text style={styles.addText}>{images.length}/{max}</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  imageWrapper: { marginRight: Spacing.sm, position: 'relative' },
  image: { width: 100, height: 100, borderRadius: BorderRadius.md },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  addText: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 4 },
});