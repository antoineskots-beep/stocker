import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Show notification alerts when received in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getNotificationPermissionStatus(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return null;
    }

    if (!Device.isDevice) {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1F6B4A',
      });
    }

    const current = await Notifications.getPermissionsAsync();
    let finalStatus = current.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenResponse.data;

    if (token) {
      const { error } = await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS as 'ios' | 'android',
        },
        { onConflict: 'token' },
      );

      if (error) {
        console.warn('Failed to upsert push token:', error.message);
      }
    }

    return token;
  } catch (err) {
    console.warn('Push notification registration not completed in current environment:', err);
    return null;
  }
}
