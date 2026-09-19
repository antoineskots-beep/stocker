import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ExchangeBadge } from '@/components/exchange-badge';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAddToWatchlist, useDebouncedValue, useSearch, useWatchlist } from '@/lib/hooks';
import type { SearchResult } from '@/lib/market-data/types';

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const search = useSearch(debouncedQuery);
  const watchlist = useWatchlist();
  const addToWatchlist = useAddToWatchlist();

  const addedSymbols = useMemo(() => {
    return new Set((watchlist.data ?? []).map((item) => item.symbol.toUpperCase()));
  }, [watchlist.data]);

  const trimmed = debouncedQuery.trim();
  const waitingForDebounce = query.trim() !== trimmed;
  const showHint = query.trim().length === 0;
  const isLoading = !showHint && (waitingForDebounce || search.isFetching || watchlist.isLoading);
  const errorMessage = search.error || watchlist.error ? t('states.errorTitle') : null;
  const results = search.data ?? [];
  const isEmpty = !showHint && !isLoading && !errorMessage && results.length === 0;

  function onAdd(item: SearchResult) {
    addToWatchlist.mutate(item);
  }

  return (
    <ThemedView style={styles.flex}>
      <View style={styles.searchBox}>
        <TextInput
          accessibilityLabel={t('search.placeholder')}
          autoCapitalize="none"
          autoCorrect={false}
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}
        />
      </View>

      {addToWatchlist.isError ? (
        <ThemedText themeColor="danger" style={styles.error}>
          {t('search.addFailed')}
        </ThemedText>
      ) : null}

      {showHint ? (
        <ScreenState
          empty
          emptyTitle={t('search.hintTitle')}
          emptyBody={t('search.hintBody')}
          loadingLabel={t('states.loading')}
        />
      ) : (
        <ScreenState
          loading={isLoading}
          error={errorMessage}
          empty={isEmpty}
          emptyTitle={t('search.emptyTitle')}
          emptyBody={t('search.emptyBody')}
          loadingLabel={t('states.loading')}
          retryLabel={t('states.retry')}
          onRetry={() => {
            void search.refetch();
            void watchlist.refetch();
          }}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.symbol}
            style={styles.flex}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const alreadyAdded = addedSymbols.has(item.symbol.toUpperCase());
              const isAdding =
                addToWatchlist.isPending && addToWatchlist.variables?.symbol === item.symbol;

              return (
                <View
                  style={[
                    styles.row,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <View style={styles.rowText}>
                    <ThemedText type="smallBold">{item.symbol}</ThemedText>
                    <ThemedText themeColor="textSecondary">{item.name}</ThemedText>
                    <View style={styles.meta}>
                      <ExchangeBadge exchange={item.exchange} />
                      <ThemedText type="small">{item.currency}</ThemedText>
                    </View>
                  </View>
                  {alreadyAdded ? (
                    <ThemedText type="smallBold" themeColor="primary">
                      {t('search.added')}
                    </ThemedText>
                  ) : (
                    <Button
                      label={t('search.add')}
                      variant="secondary"
                      disabled={isAdding}
                      onPress={() => onAdd(item)}
                    />
                  )}
                </View>
              );
            }}
          />
        </ScreenState>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBox: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  input: {
    minHeight: MinTapTarget,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  error: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
