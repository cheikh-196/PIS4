import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';
import { storage } from '../../src/utils/storage';
import { Colors, Spacing, FontSize, Shadow } from '../../src/constants/colors';
import { validateName, validateEmail, validatePassword, validatePhone } from '../../src/utils/validators';
import { useResponsive } from '../../src/hooks/useResponsive';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { contentMaxWidth } = useResponsive();

  const handleRegister = async () => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confirmErr = password !== confirmPassword ? 'Les mots de passe ne correspondent pas' : null;
    const phoneErr = validatePhone(phone);

    setErrors({ name: nameErr, email: emailErr, password: passErr, confirmPassword: confirmErr, phone: phoneErr });
    if (nameErr || emailErr || passErr || confirmErr || phoneErr) return;

    setLoading(true);
    try {
      const res = await authService.register(name, email, password, phone || undefined);
      await storage.setToken(res.token);
      await storage.setUser(res.user);
      setAuth(res.user, res.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrors({ email: err.response?.data?.error || "Erreur lors de l'inscription" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez la communauté FindIt</Text>
        </View>

        <View style={[styles.formCard, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
          <Input
            label="Nom complet"
            value={name}
            onChangeText={setName}
            placeholder="Jean Dupont"
            error={errors.name}
            icon="person-outline"
            autoCapitalize="words"
          />

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
            label="Téléphone (optionnel)"
            value={phone}
            onChangeText={setPhone}
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
            icon="call-outline"
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 8 caractères"
            secureTextEntry
            error={errors.password}
            icon="lock-closed-outline"
          />

          <Input
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Répétez le mot de passe"
            secureTextEntry
            error={errors.confirmPassword}
            icon="lock-closed-outline"
          />

          <Button
            title="Créer mon compte"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            fullWidth
            size="lg"
            icon="person-add-outline"
            style={styles.submitBtn}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 2,
    paddingBottom: Spacing.xl,
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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    ...Shadow.lg,
  },
  submitBtn: { marginTop: Spacing.sm },
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