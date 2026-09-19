import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { EmailAuthForm } from '@/components/email-auth-form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  isGoogleConfigured,
  mapAuthError,
  signInWithApple,
  signInWithEmail,
  signInWithGoogleIdToken,
  useGoogleAuthRequest,
} from '@/lib/auth';
import { useAuth } from '@/lib/auth-session';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { configured } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleRequest, googleResponse, promptGoogle] = useGoogleAuthRequest();

  useEffect(() => {
    const token =
      googleResponse?.type === 'success'
        ? (googleResponse.params.id_token ?? googleResponse.authentication?.idToken)
        : undefined;
    if (!token) {
      return;
    }
    setBusy(true);
    signInWithGoogleIdToken(token)
      .then(({ error: authError }) => {
        if (authError) {
          setError(t('auth.genericError'));
        }
      })
      .finally(() => setBusy(false));
  }, [googleResponse, t]);

  async function onEmail(email: string, password: string) {
    setBusy(true);
    setError(null);
    const { error: authError } = await signInWithEmail(email, password);
    if (authError) {
      const code = mapAuthError(authError.message, 'generic');
      setError(code === 'invalid_credentials' ? t('auth.invalidCredentials') : t('auth.genericError'));
    }
    setBusy(false);
  }

  async function onApple() {
    setBusy(true);
    setError(null);
    const { error: authError } = await signInWithApple();
    if (authError) {
      setError(
        authError.message === 'apple_unavailable' ? t('auth.appleUnavailable') : t('auth.genericError'),
      );
    }
    setBusy(false);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">{t('auth.signInTitle')}</ThemedText>
          {!configured ? (
            <ThemedText themeColor="danger">{t('auth.missingConfig')}</ThemedText>
          ) : null}
          {error ? <ThemedText themeColor="danger">{error}</ThemedText> : null}

          {Platform.OS === 'ios' ? (
            <Button label={t('auth.continueWithApple')} variant="secondary" onPress={onApple} disabled={busy} />
          ) : null}
          {isGoogleConfigured() ? (
            <Button
              label={t('auth.continueWithGoogle')}
              variant="secondary"
              disabled={busy || !googleRequest}
              onPress={() => promptGoogle()}
            />
          ) : null}

          <ThemedText type="small" themeColor="textSecondary" style={styles.or}>
            {t('auth.orEmail')}
          </ThemedText>

          <EmailAuthForm
            emailLabel={t('auth.email')}
            passwordLabel={t('auth.password')}
            submitLabel={t('auth.signIn')}
            onSubmit={onEmail}
            busy={busy || !configured}
          />

          <View style={styles.row}>
            <ThemedText>{t('auth.noAccount')}</ThemedText>
            <Link href="/(auth)/sign-up">
              <ThemedText type="linkPrimary">{t('auth.signUp')}</ThemedText>
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
  or: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
});
