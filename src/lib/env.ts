export const publicEnv = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  marketDataProvider: process.env.EXPO_PUBLIC_MARKET_DATA_PROVIDER ?? 'mock',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
};

export function isSupabaseConfigured(): boolean {
  return (
    publicEnv.supabaseUrl.startsWith('https://') &&
    !publicEnv.supabaseUrl.includes('YOUR_PROJECT') &&
    publicEnv.supabaseAnonKey.length > 20
  );
}

export function isGoogleConfigured(): boolean {
  return publicEnv.googleWebClientId.includes('apps.googleusercontent.com');
}
