import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { StatusCard, AlertCard } from '../components/Card';
import { Toast } from '../components/Toast';
import { colors, spacing, typography } from '../theme';
import { addCheckIn, getCheckIns, getCurrentUser, getSettings } from '../config/storage';
import * as Haptics from 'expo-haptics';
import { getUserFriendlyError } from '../utils/errorHandling';

export function SeniorHomeScreen() {
  const [lastCheckIn, setLastCheckIn] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userName, setUserName] = useState('');
  const [hapticEnabled, setHapticEnabled] = useState(true);

  useEffect(() => {
    loadCheckInData();
  }, []);

  const loadCheckInData = async () => {
    try {
      setIsLoadingData(true);
      
      // Load user info
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.name);
      }
      
      // Load settings
      const settings = await getSettings();
      setHapticEnabled(settings.hapticFeedbackEnabled);
      
      // Load check-in data
      const checkins = await getCheckIns();
      if (checkins.length > 0) {
        const latest = checkins[checkins.length - 1];
        setLastCheckIn(formatTimestamp(latest.timestamp));
        setStreak(calculateStreak(checkins));
      }
    } catch (error) {
      console.error('Error loading check-in data:', error);
      setToastMessage('Could not load check-in history');
      setShowToast(true);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      
      const user = await getCurrentUser();
      if (!user) {
        setToastMessage('Please sign in first');
        setShowToast(true);
        return;
      }
      
      // Haptic feedback
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Save check-in
      await addCheckIn({
        id: Date.now().toString(),
        userId: user.id,
        status: 'ok',
        timestamp: new Date().toISOString(),
      });

      // Update UI
      await loadCheckInData();

      // Show success message with personalization
      setToastMessage(`Great job, ${userName}! Family notified.`);
      setShowToast(true);

      // Success haptic
      if (hapticEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      const friendlyMessage = getUserFriendlyError(error as Error);
      setToastMessage(friendlyMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNeedHelp = async () => {
    try {
      if (hapticEnabled) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      // TODO: Implement proper emergency escalation
      // For now, show message
      setToastMessage('Alerting your emergency contacts...');
      setShowToast(true);
      
      // Save as help check-in
      const user = await getCurrentUser();
      if (user) {
        await addCheckIn({
          id: Date.now().toString(),
          userId: user.id,
          status: 'help',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error requesting help:', error);
      setToastMessage('Failed to send alert. Please call directly.');
      setShowToast(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = userName ? `, ${userName}` : '';
    if (hour < 12) return `Good morning${name}!`;
    if (hour < 18) return `Good afternoon${name}!`;
    return `Good evening${name}!`;
  };

  // Show loading state
  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subheading}>How are you feeling today?</Text>
        </View>

        {/* Big Check-In Button */}
        <View style={styles.heroSection}>
          <PrimaryButton 
            onPress={handleCheckIn} 
            loading={loading}
            accessible={true}
            accessibilityLabel="I'm OK today"
            accessibilityHint="Double tap to let your family know you're doing well"
            accessibilityRole="button"
          >
            I'm OK Today
          </PrimaryButton>
          
          <SecondaryButton
            onPress={handleNeedHelp}
            style={styles.helpButton}
            accessible={true}
            accessibilityLabel="I need help"
            accessibilityHint="Double tap to alert your emergency contacts"
            accessibilityRole="button"
          >
            I Need Help
          </SecondaryButton>
        </View>

        {/* Status Card */}
        {lastCheckIn && (
          <StatusCard
            title="Daily Check-In"
            subtitle={`Last check-in: ${lastCheckIn}`}
            badge={
              streak > 0
                ? { icon: '🔥', text: `${streak} day${streak > 1 ? 's' : ''}` }
                : undefined
            }
          />
        )}

        {/* Today's Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Reminders</Text>
          
          <AlertCard
            title="Take medication"
            message="Remember to take your evening pills at 8:00 PM"
            severity="info"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="📞"
              label="Call Family"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="⏰"
              label="Add Reminder"
              onPress={() => {}}
            />
            <QuickActionButton
              icon="⚙️"
              label="Settings"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>

      <Toast
        message={toastMessage}
        visible={showToast}
        type="success"
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.quickActionButton}>
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </View>
  );
}

// Helper functions
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function calculateStreak(checkins: any[]): number {
  if (checkins.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = checkins.length - 1; i >= 0; i--) {
    const checkinDate = new Date(checkins[i].timestamp);
    checkinDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  
  greeting: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  
  subheading: {
    ...typography.bodyLarge,
  },
  
  heroSection: {
    marginBottom: spacing.xl,
  },
  
  helpButton: {
    marginTop: spacing.md,
  },
  
  section: {
    marginTop: spacing.xl,
  },
  
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray600,
  },
});

