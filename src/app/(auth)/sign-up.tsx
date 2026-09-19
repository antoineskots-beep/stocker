import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { EmailAuthForm } from '@/components/email-auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { mapAuthError, signUpWithEmail } from '@/lib/auth';
import { useAuth } from '@/lib/auth-session';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onEmail(email: string, password: string) {
    if (password.length < 8) {
      setError(t('auth.weakPassword'));
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: authError } = await signUpWithEmail(email, password);
    if (authError) {
      const code = mapAuthError(authError.message, 'generic');
      setError(code === 'weak_password' ? t('auth.weakPassword') : t('auth.genericError'));
    } else if (!data.session) {
      setNotice(t('auth.checkEmail'));
    }
    setBusy(false);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">{t('auth.signUpTitle')}</ThemedText>
          {!configured ? (
            <ThemedText themeColor="danger">{t('auth.missingConfig')}</ThemedText>
          ) : null}
          {error ? <ThemedText themeColor="danger">{error}</ThemedText> : null}
          {notice ? <ThemedText>{notice}</ThemedText> : null}

          <EmailAuthForm
            emailLabel={t('auth.email')}
            passwordLabel={t('auth.password')}
            submitLabel={t('auth.signUp')}
            onSubmit={onEmail}
            busy={busy || !configured}
          />

          <View style={styles.row}>
            <ThemedText>{t('auth.hasAccount')}</ThemedText>
            <Link href="/(auth)/sign-in">
              <ThemedText type="linkPrimary">{t('auth.signIn')}</ThemedText>
            </Link>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
});
