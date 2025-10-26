import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from '../config/storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  // Save token to storage
  await savePushToken('current-user', token); // TODO: Get actual user ID

  // Configure for iOS
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('check-in', [
      {
        identifier: 'check-in-ok',
        buttonTitle: "I'm OK",
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'check-in-need-help',
        buttonTitle: 'I Need Help',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }

  return token;
}

export async function scheduleDailyCheckInNotification(hour: number = 9, minute: number = 0) {
  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning! 🌅',
      body: 'How are you feeling today? Take a moment to check in.',
      categoryIdentifier: 'check-in',
      data: { type: 'daily-check-in' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function sendCheckInReminder(name: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Check-in reminder',
      body: `${name}, don't forget to check in today!`,
      data: { type: 'reminder' },
    },
    trigger: {
      seconds: 3600, // 1 hour from now
    },
  });
}

export async function sendFamilyNotification(seniorName: string, status: 'ok' | 'help') {
  const title = status === 'ok' ? '✓ Check-in received' : '⚠️ Help requested';
  const body =
    status === 'ok'
      ? `${seniorName} checked in and is doing okay.`
      : `${seniorName} needs help. Please reach out.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'family-notification', status, seniorName },
    },
    trigger: null, // Send immediately
  });
}

export function addNotificationListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
