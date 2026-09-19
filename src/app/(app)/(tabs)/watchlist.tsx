import { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { DelayedPricesBanner } from '@/components/delayed-prices-banner';
import { ScreenState } from '@/components/screen-state';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function WatchlistScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          label={t('watchlist.add')}
          variant="ghost"
          onPress={() => router.push('/search')}
          style={styles.headerButton}
        />
      ),
    });
  }, [navigation, t]);

  return (
    <ThemedView style={styles.flex}>
      <ThemedView style={styles.banner}>
        <DelayedPricesBanner label={t('delayedPrices')} />
      </ThemedView>
      <ScreenState
        empty
        emptyTitle={t('watchlist.emptyTitle')}
        emptyBody={t('watchlist.emptyBody')}
        loadingLabel={t('states.loading')}>
        <Button label={t('watchlist.search')} onPress={() => router.push('/search')} />
      </ScreenState>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: { padding: Spacing.three },
  headerButton: {
    borderWidth: 0,
    paddingHorizontal: Spacing.two,
  },
});
