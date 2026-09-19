import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Exchange } from '@/lib/market-data/types';

export function ExchangeBadge({ exchange }: { exchange: Exchange | null }) {
  const theme = useTheme();

  if (!exchange) {
    return null;
  }

  return (
    <View style={[styles.badge, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">{exchange}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
