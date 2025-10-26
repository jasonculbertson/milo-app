import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { CheckIn } from '../types';
import {
  saveCheckIn,
  getTodayCheckIn,
  getCheckIns,
  getFamilyMembers,
  saveCurrentUser,
} from '../config/storage';
import { sendPushNotificationToToken } from '../services/notificationService';

export default function CheckInScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);

  useEffect(() => {
    checkTodayStatus();
    loadRecentCheckIns();
  }, []);

  const checkTodayStatus = async () => {
    if (!user) return;

    try {
      const todayCheckIn = await getTodayCheckIn(user.id);
      setHasCheckedInToday(!!todayCheckIn);
    } catch (error) {
      console.error('Error checking today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentCheckIns = async () => {
    if (!user) return;

    try {
      const allCheckIns = await getCheckIns();
      const userCheckIns = allCheckIns
        .filter(c => c.user_id === user.id)
        .slice(0, 7);
      setRecentCheckIns(userCheckIns);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  };

  const handleCheckIn = async (status: 'ok' | 'need_help') => {
    if (!user) return;

    try {
      // Create check-in
      const checkIn: CheckIn = {
        id: generateId(),
        user_id: user.id,
        status,
        message: null,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      await saveCheckIn(checkIn);

      // Get family members and send notifications
      const familyMembers = await getFamilyMembers();
      const notificationTitle =
        status === 'ok' ? `${user.name} checked in! ✅` : `${user.name} needs help! ⚠️`;
      const notificationBody =
        status === 'ok'
          ? `${user.name} is doing well today.`
          : `${user.name} indicated they need help. Please check on them.`;

      // Send push notifications to family members who have tokens
      for (const member of familyMembers) {
        if (member.id !== user.id && member.expo_push_token) {
          try {
            await sendPushNotificationToToken(
              member.expo_push_token,
              notificationTitle,
              notificationBody,
              {
                type: 'checkin',
                status,
                from_user_id: user.id,
                from_user_name: user.name,
              }
            );
          } catch (error) {
            console.error(`Error sending notification to ${member.name}:`, error);
          }
        }
      }

      setHasCheckedInToday(true);
      Alert.alert(
        'Success!',
        status === 'ok'
          ? "Your family has been notified that you're doing well!"
          : 'Your family has been notified that you need help.'
      );

      await loadRecentCheckIns();
    } catch (error) {
      Alert.alert('Error', 'Failed to check in. Please try again.');
      console.error('Error checking in:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {!hasCheckedInToday ? (
        <View style={styles.checkInContainer}>
          <Text style={styles.title}>How are you doing today?</Text>
          <Text style={styles.subtitle}>
            Let your family know you're doing well with one tap
          </Text>

          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => handleCheckIn('ok')}
          >
            <Text style={styles.checkInButtonText}>I'm OK ✅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => handleCheckIn('need_help')}
          >
            <Text style={styles.helpButtonText}>I Need Help ⚠️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.checkedInContainer}>
          <Text style={styles.checkedInTitle}>✅ All Set!</Text>
          <Text style={styles.checkedInText}>
            You've already checked in today. Your family has been notified!
          </Text>
        </View>
      )}

      {recentCheckIns.length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Recent Check-Ins</Text>
          {recentCheckIns.map((checkIn) => (
            <View key={checkIn.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {new Date(checkIn.timestamp).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.historyStatus}>
                {checkIn.status === 'ok' ? '✅ OK' : '⚠️ Need Help'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    padding: 8,
  },
  signOutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  checkInContainer: {
    padding: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  checkInButton: {
    backgroundColor: '#34C759',
    padding: 32,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  checkInButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: '#FF9500',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  helpButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  checkedInContainer: {
    margin: 20,
    padding: 40,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    alignItems: 'center',
  },
  checkedInTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2E7D32',
  },
  checkedInText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4CAF50',
    lineHeight: 24,
  },
  historyContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDate: {
    fontSize: 16,
    color: '#666',
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
});
