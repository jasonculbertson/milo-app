import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SignInScreen from './src/screens/SignInScreen';
import CheckInScreen from './src/screens/CheckInScreen';
import FamilyDashboard from './src/screens/FamilyDashboard';
import {
  registerForPushNotificationsAsync,
  setupNotificationCategories,
  scheduleDailyCheckinNotification,
} from './src/services/notificationService';
import {
  getCurrentUser,
  saveCurrentUser,
  saveCheckIn,
  getFamilyMembers,
} from './src/config/storage';
import { sendPushNotificationToToken } from './src/services/notificationService';

function AppContent() {
  const { user, loading, refreshUser } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Set up notifications
    setupNotifications();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // Refresh data when notification is received
      refreshUser();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('Notification response:', response);

        const actionIdentifier = response.actionIdentifier;

        // Handle interactive notification actions
        if (actionIdentifier === 'CHECKIN_OK') {
          await handleCheckInFromNotification('ok');
        } else if (actionIdentifier === 'CHECKIN_NEED_HELP') {
          await handleCheckInFromNotification('need_help');
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user && expoPushToken) {
      // Update user's push token
      updatePushToken(expoPushToken);

      // Schedule daily check-in notification for mom
      if (user.role === 'mom') {
        const [hour, minute] = user.notification_time.split(':').map(Number);
        scheduleDailyCheckinNotification(hour, minute);
      }
    }
  }, [user, expoPushToken]);

  const setupNotifications = async () => {
    await setupNotificationCategories();
    const token = await registerForPushNotificationsAsync();
    setExpoPushToken(token);
  };

  const updatePushToken = async (token: string) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, expo_push_token: token };
      await saveCurrentUser(updatedUser);
      await refreshUser();
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  };

  const handleCheckInFromNotification = async (status: 'ok' | 'need_help') => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;

    try {
      // Create check-in
      const checkIn = {
        id: generateId(),
        user_id: currentUser.id,
        status,
        message: null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      await saveCheckIn(checkIn);

      // Get family members and send notifications
      const familyMembers = await getFamilyMembers();
      const notificationTitle =
        status === 'ok' ? `${currentUser.name} checked in! ✅` : `${currentUser.name} needs help! ⚠️`;
      const notificationBody =
        status === 'ok'
          ? `${currentUser.name} is doing well today.`
          : `${currentUser.name} indicated they need help. Please check on them.`;

      // Send push notifications to family members
      for (const member of familyMembers) {
        if (member.id !== currentUser.id && member.expo_push_token) {
          try {
            await sendPushNotificationToToken(
              member.expo_push_token,
              notificationTitle,
              notificationBody,
              {
                type: 'checkin',
                status,
                from_user_id: currentUser.id,
                from_user_name: currentUser.name,
              }
            );
          } catch (error) {
            console.error(`Error sending notification to ${member.name}:`, error);
          }
        }
      }

      // Send local confirmation
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Check-in Recorded! ✅',
          body: 'Your family has been notified.',
          sound: true,
        },
        trigger: null,
      });

      await refreshUser();
    } catch (error) {
      console.error('Error checking in from notification:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return <SignInScreen />;
  }

  // Show appropriate screen based on user role
  return user.role === 'mom' ? <CheckInScreen /> : <FamilyDashboard />;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <AppContent />
    </AuthProvider>
  );
}
