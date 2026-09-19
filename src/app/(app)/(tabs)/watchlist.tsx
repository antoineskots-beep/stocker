import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { DelayedPricesBanner } from '@/components/delayed-prices-banner';
import { ScreenState } from '@/components/screen-state';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function WatchlistScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.flex}>
      <ThemedView style={styles.banner}>
        <DelayedPricesBanner label={t('delayedPrices')} />
      </ThemedView>
      <ScreenState
        empty
        emptyTitle={t('watchlist.emptyTitle')}
        emptyBody={t('watchlist.emptyBody')}
        loadingLabel={t('states.loading')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  banner: { padding: Spacing.three },
});
