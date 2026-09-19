import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { isGoogleConfigured, publicEnv } from '@/lib/env';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export function mapAuthError(message: string | undefined, fallback: string): string {
  if (!message) {
    return fallback;
  }
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'invalid_credentials';
  }
  if (lower.includes('password')) {
    return 'weak_password';
  }
  return fallback;
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email: email.trim(), password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function signInWithApple() {
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { error: new Error('apple_unavailable') as Error, data: { user: null, session: null } };
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    return { error: new Error('apple_unavailable') as Error, data: { user: null, session: null } };
  }

  return supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
}

export function useGoogleAuthRequest() {
  return Google.useAuthRequest({
    webClientId: publicEnv.googleWebClientId || undefined,
    iosClientId: publicEnv.googleIosClientId || undefined,
    androidClientId: publicEnv.googleAndroidClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'stocker' }),
  });
}

export async function signInWithGoogleIdToken(idToken: string) {
  return supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
}

export { isGoogleConfigured, Platform };
