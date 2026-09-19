import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  loadingLabel: string;
  retryLabel?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
};

export function ScreenState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  loadingLabel,
  retryLabel,
  onRetry,
  children,
}: Props) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.center} accessibilityLabel={loadingLabel}>
        <ActivityIndicator color={theme.primary} />
        <ThemedText themeColor="textSecondary">{loadingLabel}</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText type="subtitle">{error}</ThemedText>
        {onRetry && retryLabel ? <Button label={retryLabel} onPress={onRetry} /> : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.center}>
        {emptyTitle ? <ThemedText type="subtitle">{emptyTitle}</ThemedText> : null}
        {emptyBody ? (
          <ThemedText themeColor="textSecondary" style={styles.body}>
            {emptyBody}
          </ThemedText>
        ) : null}
        {children}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  body: {
    textAlign: 'center',
  },
});
