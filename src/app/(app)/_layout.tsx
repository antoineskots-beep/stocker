import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenState } from '@/components/screen-state';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth-session';

export default function AppLayout() {
  const { session, loading } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading) {
    return <ScreenState loading loadingLabel={t('states.loading')} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: true, title: t('search.title') }} />
    </Stack>
  );
}
