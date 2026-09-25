import { useLayoutEffect, useMemo } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ExchangeBadge } from '@/components/exchange-badge';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useEvents,
  useQuote,
  useRemoveFromWatchlist,
  useWatchlist,
} from '@/lib/hooks';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const symbolStr = typeof symbol === 'string' ? symbol : '';
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();

  const quoteQuery = useQuote(symbolStr);
  const eventsQuery = useEvents(symbolStr);
  const watchlistQuery = useWatchlist();
  const removeFromWatchlist = useRemoveFromWatchlist();

  const quote = quoteQuery.data;
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);

  const watchlistItem = useMemo(() => {
    return (watchlistQuery.data ?? []).find(
      (item) => item.symbol.toUpperCase() === symbolStr.toUpperCase(),
    );
  }, [watchlistQuery.data, symbolStr]);

  useLayoutEffect(() => {
    if (symbolStr) {
      navigation.setOptions({
        title: symbolStr,
      });
    }
  }, [navigation, symbolStr]);

  const isLoading = quoteQuery.isLoading || eventsQuery.isLoading;
  const error = quoteQuery.error || eventsQuery.error ? t('states.errorTitle') : null;
  const notFound = !isLoading && !error && !quote;

  const exDividendEvent = events.find((e) => e.type === 'ex_dividend');
  const earningsEvent = events.find((e) => e.type === 'earnings');

  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) {
      return t('stock.noEvents');
    }
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (!year || !month || !day) {
        return dateStr;
      }
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  function handleRemove() {
    const message = t('stock.removeConfirmMessage', { symbol: symbolStr });

    const performRemoval = async () => {
      try {
        await removeFromWatchlist.mutateAsync(symbolStr);
        router.back();
      } catch {
        // Handled by mutation error state
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        void performRemoval();
      }
    } else {
      Alert.alert(t('stock.removeConfirmTitle'), message, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('stock.removeConfirmAction'),
          style: 'destructive',
          onPress: () => {
            void performRemoval();
          },
        },
      ]);
    }
  }

  const changeColor = quote && quote.change >= 0 ? theme.primary : theme.danger;

  const pctBelowHigh =
    quote && quote.high52w > 0
      ? ((quote.high52w - quote.price) / quote.high52w) * 100
      : 0;

  const refPrice = watchlistItem?.reference_price ?? null;
  const changeSinceAdded =
    quote && refPrice != null ? quote.price - refPrice : null;
  const changeSinceAddedPct =
    changeSinceAdded != null && refPrice && refPrice > 0
      ? (changeSinceAdded / refPrice) * 100
      : null;
  const changeSinceAddedColor =
    changeSinceAdded != null && changeSinceAdded >= 0 ? theme.primary : theme.danger;

  return (
    <ThemedView style={styles.flex}>
      <ScreenState
        loading={isLoading}
        error={error}
        empty={notFound}
        emptyTitle={t('stock.notFound')}
        emptyBody={t('stock.notFoundBody')}
        loadingLabel={t('states.loading')}
        retryLabel={t('states.retry')}
        onRetry={() => {
          void quoteQuery.refetch();
          void eventsQuery.refetch();
        }}>
        {quote ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}>
            {/* Header info */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <View style={styles.titleRow}>
                <ThemedText type="subtitle" style={styles.name}>
                  {quote.name}
                </ThemedText>
                <ExchangeBadge exchange={quote.exchange} />
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {quote.symbol}
              </ThemedText>

              <View style={styles.priceRow}>
                <ThemedText type="title" style={styles.price}>
                  ${quote.price.toFixed(2)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.currency}>
                  {quote.currency}
                </ThemedText>
              </View>

              <View style={styles.changeRow}>
                <ThemedText type="smallBold" style={{ color: changeColor }}>
                  {quote.change >= 0 ? '+' : ''}
                  {quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}
                  {quote.changePercent.toFixed(2)}%)
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('stock.dayChange')}
                </ThemedText>
              </View>
            </View>

            {/* Statistics */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                {t('stock.details')}
              </ThemedText>

              <View style={styles.statRow}>
                <ThemedText themeColor="textSecondary">{t('stock.high52w')}</ThemedText>
                <ThemedText type="smallBold">
                  ${quote.high52w.toFixed(2)} {quote.currency}
                </ThemedText>
              </View>

              <View style={[styles.separator, { backgroundColor: theme.border }]} />

              <View style={styles.statRow}>
                <ThemedText themeColor="textSecondary">{t('stock.pctBelowHigh')}</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.danger }}>
                  -{pctBelowHigh.toFixed(2)}%
                </ThemedText>
              </View>

              {refPrice != null ? (
                <>
                  <View style={[styles.separator, { backgroundColor: theme.border }]} />
                  <View style={styles.statRow}>
                    <ThemedText themeColor="textSecondary">
                      {t('stock.referencePrice')}
                    </ThemedText>
                    <ThemedText type="smallBold">
                      ${refPrice.toFixed(2)} {quote.currency}
                    </ThemedText>
                  </View>

                  <View style={[styles.separator, { backgroundColor: theme.border }]} />
                  <View style={styles.statRow}>
                    <ThemedText themeColor="textSecondary">{t('stock.sinceAdded')}</ThemedText>
                    <ThemedText type="smallBold" style={{ color: changeSinceAddedColor }}>
                      {changeSinceAdded != null && changeSinceAdded >= 0 ? '+' : ''}
                      {changeSinceAdded?.toFixed(2)} (
                      {changeSinceAddedPct != null && changeSinceAddedPct >= 0 ? '+' : ''}
                      {changeSinceAddedPct?.toFixed(2)}%)
                    </ThemedText>
                  </View>
                </>
              ) : null}
            </View>

            {/* Events */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}>
              <ThemedText type="smallBold" style={styles.sectionHeader}>
                {t('stock.upcomingEvents')}
              </ThemedText>

              <View style={styles.statRow}>
                <ThemedText themeColor="textSecondary">{t('stock.exDividendDate')}</ThemedText>
                <ThemedText type="smallBold">{formatDate(exDividendEvent?.date)}</ThemedText>
              </View>

              <View style={[styles.separator, { backgroundColor: theme.border }]} />

              <View style={styles.statRow}>
                <ThemedText themeColor="textSecondary">{t('stock.earningsDate')}</ThemedText>
                <ThemedText type="smallBold">{formatDate(earningsEvent?.date)}</ThemedText>
              </View>
            </View>

            {/* Remove button */}
            {watchlistItem ? (
              <Button
                label={t('stock.remove')}
                variant="danger"
                disabled={removeFromWatchlist.isPending}
                onPress={handleRemove}
              />
            ) : null}

            {/* Disclaimer */}
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.disclaimer}>
              {t('disclaimer')}
            </ThemedText>
          </ScrollView>
        ) : null}
      </ScreenState>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  name: {
    fontSize: 22,
    lineHeight: 28,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  price: {
    fontSize: 34,
    lineHeight: 40,
  },
  currency: {
    fontWeight: '600',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionHeader: {
    marginBottom: Spacing.one,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.half,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
});
