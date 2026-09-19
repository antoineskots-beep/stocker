import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ScreenState } from '@/components/screen-state';
import { ThemedView } from '@/components/themed-view';

export default function AlertsScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.flex}>
      <ScreenState
        empty
        emptyTitle={t('alerts.emptyTitle')}
        emptyBody={t('alerts.emptyBody')}
        loadingLabel={t('states.loading')}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
