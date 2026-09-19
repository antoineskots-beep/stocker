import { Redirect } from 'expo-router';

import { ScreenState } from '@/components/screen-state';
import { useAuth } from '@/lib/auth-session';
import { useTranslation } from 'react-i18next';

export default function Index() {
  const { session, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <ScreenState loading loadingLabel={t('states.loading')} />;
  }

  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return <Redirect href="/(app)/(tabs)/watchlist" />;
}
