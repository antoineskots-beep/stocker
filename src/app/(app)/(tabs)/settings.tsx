import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/lib/auth-session';
import { persistLocale, type AppLocale } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  async function setLocale(locale: AppLocale) {
    await i18n.changeLanguage(locale);
    await persistLocale(locale);
    if (user) {
      await supabase.from('profiles').update({ locale }).eq('id', user.id);
    }
  }

  return (
    <ThemedView style={styles.flex}>
      <View style={styles.block}>
        <ThemedText type="smallBold">{t('settings.account')}</ThemedText>
        <ThemedText>
          {t('settings.signedInAs')} {user?.email ?? '—'}
        </ThemedText>
      </View>

      <View style={styles.block}>
        <ThemedText type="smallBold">{t('settings.language')}</ThemedText>
        <Button
          label={t('settings.french')}
          variant={i18n.language.startsWith('fr') ? 'primary' : 'secondary'}
          onPress={() => setLocale('fr')}
        />
        <Button
          label={t('settings.english')}
          variant={i18n.language.startsWith('en') ? 'primary' : 'secondary'}
          onPress={() => setLocale('en')}
        />
      </View>

      <ThemedText themeColor="textSecondary">{t('disclaimer')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('settings.comingSoon')}
      </ThemedText>

      <Button
        label={t('settings.signOut')}
        variant="danger"
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          await signOut();
          setBusy(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  block: {
    gap: Spacing.two,
  },
});
