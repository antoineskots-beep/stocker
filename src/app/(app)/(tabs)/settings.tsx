import { useEffect, useState } from 'react';
import { AppState, Linking, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/lib/auth-session';
import { persistLocale, type AppLocale } from '@/lib/i18n';
import {
  getNotificationPermissionStatus,
  registerForPushNotifications,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkPermissions() {
      const granted = await getNotificationPermissionStatus();
      if (!mounted) {
        return;
      }
      setNotificationsEnabled(granted);
      if (granted && user) {
        void registerForPushNotifications(user.id);
      }
    }

    void checkPermissions();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkPermissions();
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [user]);

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

      <View style={styles.block}>
        <ThemedText type="smallBold">{t('settings.notifications')}</ThemedText>
        <View
          style={[
            styles.notificationRow,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <View style={styles.notificationInfo}>
            <ThemedText
              type="smallBold"
              themeColor={notificationsEnabled ? 'primary' : 'textSecondary'}>
              {notificationsEnabled
                ? t('settings.notificationsEnabled')
                : t('settings.notificationsDisabled')}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {notificationsEnabled
                ? t('settings.notificationsEnabledDesc')
                : t('settings.notificationsDisabledDesc')}
            </ThemedText>
          </View>
          {!notificationsEnabled ? (
            <Button
              label={t('settings.openSettings')}
              variant="secondary"
              onPress={() => {
                void Linking.openSettings();
              }}
            />
          ) : null}
        </View>
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
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  notificationInfo: {
    flex: 1,
    gap: Spacing.half,
  },
});
