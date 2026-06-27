import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../constants/colors';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading = ({ message, fullScreen }: LoadingProps) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={Colors.primary} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  message: {
    marginTop: 12,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});