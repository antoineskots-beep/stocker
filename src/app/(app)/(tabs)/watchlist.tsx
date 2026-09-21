import { useCallback, useLayoutEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/button';
import { DelayedPricesBanner } from '@/components/delayed-prices-banner';
import { ExchangeBadge } from '@/components/exchange-badge';
import { ScreenState } from '@/components/screen-state';
import { Sparkline } from '@/components/sparkline';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useQuotes, useWatchlist, watchlistQueryKey } from '@/lib/hooks';
import { useAuth } from '@/lib/auth-session';
import type { Quote } from '@/lib/market-data/types';
import type { WatchlistItem } from '@/lib/hooks';

export default function WatchlistScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const watchlist = useWatchlist();
  const items = useMemo(() => watchlist.data ?? [], [watchlist.data]);

  const symbols = useMemo(() => items.map((item) => item.symbol), [items]);
  const quotes = useQuotes(symbols);

  const quoteMap = useMemo(() => {
    const map = new Map<string, Quote>();
    for (const q of quotes.data ?? []) {
      map.set(q.symbol.toUpperCase(), q);
    }
    return map;
  }, [quotes.data]);

  const isLoading = watchlist.isLoading || (items.length > 0 && quotes.isLoading);
  const errorMessage =
    watchlist.error || quotes.error ? t('states.errorTitle') : null;
  const isEmpty = !isLoading && !errorMessage && items.length === 0;

  const onRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey(user?.id) }),
      queryClient.invalidateQueries({ queryKey: ['quotes'] }),
    ]);
  }, [queryClient, user?.id]);

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

  function formatPrice(price: number): string {
    return price.toFixed(2);
  }

  function formatChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  }

  function formatChangePercent(pct: number): string {
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  }

  function renderRow({ item }: { item: WatchlistItem }) {
    const quote = quoteMap.get(item.symbol.toUpperCase());
    const changeColor = quote && quote.change >= 0 ? theme.primary : theme.danger;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
        onPress={() => router.push(`/stock/${item.symbol}`)}
        accessibilityRole="button"
        accessibilityLabel={item.company_name ?? item.symbol}>
        <View style={styles.rowLeft}>
          <ThemedText type="smallBold">{item.company_name ?? item.symbol}</ThemedText>
          <View style={styles.symbolRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {item.symbol}
            </ThemedText>
            <ExchangeBadge exchange={item.exchange ?? null} />
          </View>
        </View>

        {quote ? (
          <View style={styles.rowRight}>
            <View style={styles.priceBlock}>
              <ThemedText type="smallBold">
                ${formatPrice(quote.price)} {quote.currency}
              </ThemedText>
              <View style={styles.changeRow}>
                <ThemedText type="small" style={{ color: changeColor }}>
                  {formatChange(quote.change)}
                </ThemedText>
                <ThemedText type="small" style={{ color: changeColor }}>
                  ({formatChangePercent(quote.changePercent)})
                </ThemedText>
              </View>
            </View>
            <Sparkline
              data={quote.sparkline}
              width={64}
              height={32}
              colorUp={theme.primary}
              colorDown={theme.danger}
            />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <View style={styles.banner}>
        <DelayedPricesBanner label={t('delayedPrices')} />
      </View>

      <ScreenState
        loading={isLoading}
        error={errorMessage}
        empty={isEmpty}
        emptyTitle={t('watchlist.emptyTitle')}
        emptyBody={t('watchlist.emptyBody')}
        loadingLabel={t('states.loading')}
        retryLabel={t('states.retry')}
        onRetry={() => {
          void watchlist.refetch();
          void quotes.refetch();
        }}>
        <Button label={t('watchlist.search')} onPress={() => router.push('/search')} />
      </ScreenState>

      {!isLoading && !errorMessage && items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          style={styles.flex}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={watchlist.isFetching || quotes.isFetching}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        />
      ) : null}
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
  list: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  rowLeft: {
    flex: 1,
    gap: Spacing.half,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
  changeRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
});
