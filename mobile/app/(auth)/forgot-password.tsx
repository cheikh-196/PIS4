import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { authService } from '../../src/services/authService';
import { Colors, Spacing, FontSize, Shadow } from '../../src/constants/colors';
import { validateEmail } from '../../src/utils/validators';
import { useResponsive } from '../../src/hooks/useResponsive';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { contentMaxWidth } = useResponsive();

  const handleSend = async () => {
    const emailErr = validateEmail(email);
    setError(emailErr);
    if (emailErr) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerSection}>
        <TouchableOpacity style={[styles.backBtn, { maxWidth: contentMaxWidth, width: '100%' }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Ionicons name="lock-closed" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Mot de passe oublié ?</Text>
        <Text style={styles.subtitle}>Pas d'inquiétude, on s'en occupe</Text>
      </View>

      <View style={styles.formCard}>
        {sent ? (
          <View style={styles.sentContainer}>
            <View style={styles.sentIconWrap}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            </View>
            <Text style={styles.sentTitle}>Email envoyé !</Text>
            <Text style={styles.sentMessage}>
              Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.
            </Text>
            <Button title="Retour à la connexion" onPress={() => router.push('/(auth)/login')} variant="outline" fullWidth />
          </View>
        ) : (
          <View style={{ maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
            <Text style={styles.description}>
              Entrez votre email et nous vous enverrons un lien de réinitialisation.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
              icon="mail-outline"
            />
            <Button title="Envoyer le lien" onPress={handleSend} loading={loading} fullWidth size="lg" icon="send-outline" />
            <Button
              title="Retour à la connexion"
              onPress={() => router.push('/(auth)/login')}
              variant="ghost"
              fullWidth
              icon="arrow-back-outline"
              style={styles.backButton}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  backBtn: { position: 'absolute', top: 60, left: Spacing.lg, zIndex: 10 },
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xl,
    position: 'relative',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: 'bold',
    color: Colors.textInverse,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    ...Shadow.lg,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 20,
  },
  backButton: { marginTop: Spacing.sm },
  sentContainer: { alignItems: 'center', paddingTop: Spacing.xxxl },
  sentIconWrap: { marginBottom: Spacing.lg },
  sentTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  sentMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
});