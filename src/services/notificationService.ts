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
    priority: Notifications.AndroidNotificationPriority.HIGH,
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

  // Configure notification categories with action buttons
  await setupNotificationCategories();

  return token;
}

/**
 * Setup interactive notification categories with action buttons
 */
export async function setupNotificationCategories() {
  // Check-in reminder category
  await Notifications.setNotificationCategoryAsync('check-in', [
    {
      identifier: 'check-in-ok',
      buttonTitle: "I'm OK ✅",
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'check-in-need-help',
      buttonTitle: 'Need Help ⚠️',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  // Fall detection category
  await Notifications.setNotificationCategoryAsync('fall-check', [
    {
      identifier: 'fall-im-ok',
      buttonTitle: "I'm Fine",
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'fall-need-help',
      buttonTitle: 'Send Help',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);

  // Reminder snooze category
  await Notifications.setNotificationCategoryAsync('reminder', [
    {
      identifier: 'reminder-done',
      buttonTitle: 'Done ✓',
      options: {
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'reminder-snooze',
      buttonTitle: 'Snooze 10 min',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  // Family alert category (for family members)
  await Notifications.setNotificationCategoryAsync('family-alert', [
    {
      identifier: 'family-call',
      buttonTitle: 'Call Now 📞',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'family-message',
      buttonTitle: 'Send Message',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
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
      categoryIdentifier: status === 'help' ? 'family-alert' : undefined,
      priority: status === 'help' ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
      sound: true,
    },
    trigger: null, // Send immediately
  });
}

/**
 * Send push notification to specific device token
 */
export async function sendPushNotificationToToken(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high' as const,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export function addNotificationListener(callback: (notification: Notifications.Notification) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Schedule a reminder notification with actions
 */
export async function scheduleReminderNotification(
  title: string,
  body: string,
  triggerDate: Date,
  reminderId: string
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'reminder', reminderId },
      categoryIdentifier: 'reminder',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: triggerDate,
  });

  return notificationId;
}
