import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { StatusCard, AlertCard } from '../components/Card';
import { Toast } from '../components/Toast';
import { colors, spacing, typography } from '../theme';
import { addCheckIn, getCheckIns } from '../config/storage';
import * as Haptics from 'expo-haptics';

export function SeniorHomeScreen() {
  const [lastCheckIn, setLastCheckIn] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCheckInData();
  }, []);

  const loadCheckInData = async () => {
    const checkins = await getCheckIns();
    if (checkins.length > 0) {
      const latest = checkins[checkins.length - 1];
      setLastCheckIn(formatTimestamp(latest.timestamp));
      setStreak(calculateStreak(checkins));
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Save check-in
    await addCheckIn({
      id: Date.now().toString(),
      userId: 'current-user', // TODO: Get from auth context
      status: 'ok',
      timestamp: new Date().toISOString(),
    });

    // Update UI
    await loadCheckInData();
    setLoading(false);

    // Show success message
    setToastMessage('Great! Your family has been notified.');
    setShowToast(true);

    // Another haptic for success
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleNeedHelp = () => {
    // TODO: Implement help escalation
    setToastMessage('Notifying your family now...');
    setShowToast(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 18) return 'Good afternoon!';
    return 'Good evening!';
  };

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
          <PrimaryButton onPress={handleCheckIn} loading={loading}>
            I'm OK Today
          </PrimaryButton>
          
          <SecondaryButton
            onPress={handleNeedHelp}
            style={styles.helpButton}
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
});

