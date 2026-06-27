import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';
import { storage } from '../../src/utils/storage';
import { validateEmail, validatePassword } from '../../src/utils/validators';
import { useResponsive } from '../../src/hooks/useResponsive';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { contentMaxWidth } = useResponsive();

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors({ email: emailErr, password: passErr });
    if (emailErr || passErr) return;

    setLoading(true);
    try {
      const res = await authService.login(email, password);
      await storage.setToken(res.token);
      await storage.setUser(res.user);
      setAuth(res.user, res.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ email: err.response?.data?.error || 'Erreur de connexion', password: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="search-circle" size={72} color={Colors.primary} />
          </View>
          <Text style={styles.brand}>FindIt</Text>
          <Text style={styles.tagline}>Objets perdus & retrouvés</Text>
        </View>

        <View style={[styles.formCard, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="exemple@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            icon="mail-outline"
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            error={errors.password}
            icon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgot}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            fullWidth
            size="lg"
            icon="log-in-outline"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}> S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    ...Shadow.lg,
  },
  forgot: {
    textAlign: 'right',
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    marginTop: -Spacing.md,
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.md },
  footerLink: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
});