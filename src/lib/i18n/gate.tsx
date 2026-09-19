import { useEffect, useState, type ReactNode } from 'react';

import { initI18n } from '@/lib/i18n';

export function I18nGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }

  return children;
}
