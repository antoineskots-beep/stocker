import type { ConfigContext, ExpoConfig } from 'expo/config';

function googleIosUrlScheme(): string | undefined {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!clientId?.endsWith('.apps.googleusercontent.com')) {
    return undefined;
  }
  const id = clientId.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${id}`;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosScheme = googleIosUrlScheme();

  return {
    ...config,
    name: 'Stocker',
    slug: 'stocker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'stocker',
    userInterfaceStyle: 'automatic',
    ios: {
      icon: './assets/expo.icon',
      bundleIdentifier: 'ca.stocker.app',
      usesAppleSignIn: true,
      infoPlist: {
        CFBundleAllowMixedLocalizations: true,
        CFBundleURLTypes: iosScheme
          ? [{ CFBundleURLSchemes: ['stocker', iosScheme] }]
          : [{ CFBundleURLSchemes: ['stocker'] }],
      },
    },
    android: {
      package: 'ca.stocker.app',
      adaptiveIcon: {
        backgroundColor: '#1F6B4A',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'stocker' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#1F6B4A',
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      ],
      'expo-secure-store',
      'expo-localization',
      'expo-apple-authentication',
      'expo-web-browser',
      'expo-notifications',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
};
