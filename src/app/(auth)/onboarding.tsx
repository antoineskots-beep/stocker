import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <ThemedText type="smallBold" themeColor="primary">
            {t('appName')}
          </ThemedText>
          <ThemedText type="subtitle">{t('onboarding.title')}</ThemedText>
          <ThemedText themeColor="textSecondary">{t('onboarding.body')}</ThemedText>
        </View>
        <View style={styles.actions}>
          <Link href="/(auth)/sign-up" asChild>
            <Button label={t('onboarding.cta')} />
          </Link>
          <Link href="/(auth)/sign-in" asChild>
            <Button label={t('onboarding.hasAccount')} variant="secondary" />
          </Link>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  hero: {
    gap: Spacing.three,
    marginTop: Spacing.six,
  },
  actions: {
    gap: Spacing.two,
  },
});
