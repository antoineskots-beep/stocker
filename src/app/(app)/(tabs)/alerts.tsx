import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useAlerts,
  useDeleteAlert,
  usePauseAlert,
  useReactivateAlert,
  type AlertItem,
} from '@/lib/hooks';

export default function AlertsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const alertsQuery = useAlerts();
  const deleteAlert = useDeleteAlert();
  const pauseAlert = usePauseAlert();
  const reactivateAlert = useReactivateAlert();

  const [activeTab, setActiveTab] = useState<'active' | 'triggered'>('active');

  const alerts = useMemo(() => alertsQuery.data ?? [], [alertsQuery.data]);

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'active' || a.status === 'paused'),
    [alerts],
  );

  const triggeredAlerts = useMemo(
    () => alerts.filter((a) => a.status === 'triggered'),
    [alerts],
  );

  const displayedAlerts = activeTab === 'active' ? activeAlerts : triggeredAlerts;

  const isLoading = alertsQuery.isLoading;
  const isError = alertsQuery.error ? t('states.errorTitle') : null;
  const isOverallEmpty = !isLoading && !isError && alerts.length === 0;

  function getTypeLabel(type: string): string {
    switch (type) {
      case 'price_above':
        return t('alerts.priceAbove');
      case 'price_below':
        return t('alerts.priceBelow');
      case 'buy_zone':
        return t('alerts.buyZone');
      default:
        return type;
    }
  }

  function getStatusBadge(status: string) {
    let color: string = theme.textSecondary;
    let label = t('alerts.pausedStatus');

    if (status === 'active') {
      color = theme.primary;
      label = t('alerts.activeStatus');
    } else if (status === 'triggered') {
      color = theme.delayed;
      label = t('alerts.triggeredStatus');
    }

    return (
      <View style={[styles.badge, { borderColor: color }]}>
        <ThemedText type="smallBold" style={{ color }}>
          {label}
        </ThemedText>
      </View>
    );
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }

  function handleDelete(item: AlertItem) {
    const message = t('alerts.deleteConfirmMessage', { symbol: item.symbol });

    const performDelete = () => {
      void deleteAlert.mutateAsync(item.id);
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        performDelete();
      }
    } else {
      Alert.alert(t('alerts.deleteConfirmTitle'), message, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('alerts.delete'),
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  }

  function renderAlertItem({ item }: { item: AlertItem }) {
    const isPaused = item.status === 'paused';
    const isTriggered = item.status === 'triggered';

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.symbolRow}>
            <ThemedText type="smallBold" style={styles.symbol}>
              {item.symbol}
            </ThemedText>
            {getStatusBadge(item.status)}
          </View>
          <ThemedText type="title" style={styles.targetValue}>
            ${item.value?.toFixed(2)}
          </ThemedText>
        </View>

        <ThemedText type="small" themeColor="textSecondary">
          {getTypeLabel(item.type)}
        </ThemedText>

        {isTriggered && item.triggered_at ? (
          <ThemedText type="small" style={{ color: theme.delayed }}>
            {t('alerts.triggeredAt', { date: formatDate(item.triggered_at) })}
          </ThemedText>
        ) : null}

        {/* Action buttons */}
        <View style={styles.cardActions}>
          {isTriggered ? (
            <Button
              label={t('alerts.reactivate')}
              variant="secondary"
              disabled={reactivateAlert.isPending}
              onPress={() => reactivateAlert.mutate(item.id)}
              style={styles.cardBtn}
            />
          ) : (
            <Button
              label={isPaused ? t('alerts.resume') : t('alerts.pause')}
              variant="secondary"
              disabled={pauseAlert.isPending}
              onPress={() =>
                pauseAlert.mutate({
                  id: item.id,
                  status: isPaused ? 'active' : 'paused',
                })
              }
              style={styles.cardBtn}
            />
          )}

          <Button
            label={t('alerts.delete')}
            variant="danger"
            disabled={deleteAlert.isPending}
            onPress={() => handleDelete(item)}
            style={styles.cardBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <ScreenState
        loading={isLoading}
        error={isError}
        empty={isOverallEmpty}
        emptyTitle={t('alerts.emptyTitle')}
        emptyBody={t('alerts.emptyBody')}
        loadingLabel={t('states.loading')}
        retryLabel={t('states.retry')}
        onRetry={() => void alertsQuery.refetch()}>
        {/* Filter tabs */}
        <View style={styles.tabsRow}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'active' }}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  activeTab === 'active'
                    ? theme.backgroundSelected
                    : theme.backgroundElement,
                borderColor:
                  activeTab === 'active' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setActiveTab('active')}>
            <ThemedText
              type={activeTab === 'active' ? 'smallBold' : 'small'}
              style={{
                color: activeTab === 'active' ? theme.primary : theme.text,
              }}>
              {t('alerts.activeTab', { count: activeAlerts.length })}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'triggered' }}
            style={[
              styles.tabBtn,
              {
                backgroundColor:
                  activeTab === 'triggered'
                    ? theme.backgroundSelected
                    : theme.backgroundElement,
                borderColor:
                  activeTab === 'triggered' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setActiveTab('triggered')}>
            <ThemedText
              type={activeTab === 'triggered' ? 'smallBold' : 'small'}
              style={{
                color: activeTab === 'triggered' ? theme.primary : theme.text,
              }}>
              {t('alerts.triggeredTab', { count: triggeredAlerts.length })}
            </ThemedText>
          </Pressable>
        </View>

        {displayedAlerts.length === 0 ? (
          <View style={styles.tabEmpty}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {activeTab === 'active'
                ? t('alerts.emptyTitle')
                : t('alerts.emptyTriggeredTitle')}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.emptyText}>
              {activeTab === 'active'
                ? t('alerts.emptyBody')
                : t('alerts.emptyTriggeredBody')}
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={displayedAlerts}
            keyExtractor={(item) => item.id}
            renderItem={renderAlertItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={alertsQuery.isFetching}
                onRefresh={() => void alertsQuery.refetch()}
                tintColor={theme.primary}
              />
            }
          />
        )}
      </ScreenState>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  symbol: {
    fontSize: 18,
    lineHeight: 22,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.one,
    paddingVertical: 1,
  },
  targetValue: {
    fontSize: 22,
    lineHeight: 26,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cardBtn: {
    flex: 1,
    minHeight: 40,
  },
  tabEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
  },
});
