import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';

import { en } from '@/lib/i18n/en';
import { fr } from '@/lib/i18n/fr';

const LOCALE_KEY = 'stocker.locale';

export type AppLocale = 'fr' | 'en';

export function deviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  return code.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

async function readStoredLocale(): Promise<AppLocale | null> {
  try {
    if (Platform.OS === 'web') {
      const value = globalThis.localStorage?.getItem(LOCALE_KEY);
      return value === 'fr' || value === 'en' ? value : null;
    }
    const value = await SecureStore.getItemAsync(LOCALE_KEY);
    return value === 'fr' || value === 'en' ? value : null;
  } catch {
    return null;
  }
}

export async function persistLocale(locale: AppLocale): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(LOCALE_KEY, locale);
      return;
    }
    await SecureStore.setItemAsync(LOCALE_KEY, locale);
  } catch {
    // Persistence is best-effort.
  }
}

export async function initI18n(): Promise<typeof i18n> {
  const stored = await readStoredLocale();
  const lng = stored ?? deviceLocale();

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng,
      fallbackLng: 'en',
      resources: {
        fr: { translation: fr },
        en: { translation: en },
      },
      interpolation: { escapeValue: false },
    });
  } else if (i18n.language !== lng) {
    await i18n.changeLanguage(lng);
  }

  return i18n;
}

export { i18n };
