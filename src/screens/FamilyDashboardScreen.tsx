import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import {
  getCurrentUser,
  getCheckIns,
  getFallEvents,
  getReminders,
  getMessages,
  CheckIn,
  FallEvent,
  Reminder,
  Message,
} from '../config/storage';
import * as Haptics from 'expo-haptics';

export function FamilyDashboardScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seniorName, setSeniorName] = useState('');
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    checkInsThisWeek: 0,
    remindersActive: 0,
    fallAlertsThisWeek: 0,
    lastActivity: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get current user (senior)
      const user = await getCurrentUser();
      if (user) {
        setSeniorName(user.name);
      }

      // Get recent check-ins
      const checkIns = await getCheckIns();
      const sortedCheckIns = checkIns.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      if (sortedCheckIns.length > 0) {
        setLastCheckIn(sortedCheckIns[0]);
      }

      // Calculate stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const checkInsThisWeek = checkIns.filter(c => 
        new Date(c.timestamp) > oneWeekAgo
      ).length;

      // Get fall events
      const fallEvents = await getFallEvents();
      const fallAlertsThisWeek = fallEvents.filter(f => 
        new Date(f.timestamp) > oneWeekAgo && f.type === 'fall_detected'
      ).length;

      // Get reminders
      const reminders = await getReminders();
      const remindersActive = reminders.filter(r => r.status === 'scheduled').length;

      // Get messages for recent activity
      const messages = await getMessages(user?.id || '');
      
      // Combine recent activity
      const activity: any[] = [];
      
      // Add recent check-ins (last 5)
      sortedCheckIns.slice(0, 5).forEach(checkIn => {
        activity.push({
          type: 'checkin',
          timestamp: checkIn.timestamp,
          status: checkIn.status,
          icon: checkIn.status === 'ok' ? '✅' : '⚠️',
          title: checkIn.status === 'ok' ? 'Checked in - Doing well' : 'Requested help',
          time: formatTimeAgo(checkIn.timestamp),
        });
      });

      // Add recent fall events
      fallEvents.slice(0, 3).forEach(event => {
        activity.push({
          type: 'fall',
          timestamp: event.timestamp,
          icon: event.type === 'user_ok' ? '✓' : '🚨',
          title: event.type === 'fall_detected' ? 'Fall detected' : 
                 event.type === 'fall_confirmed' ? 'Fall confirmed - No response' : 
                 'Reported OK after fall',
          time: formatTimeAgo(event.timestamp),
        });
      });

      // Add recent messages (last 3)
      messages.slice(-3).forEach(msg => {
        if (msg.role === 'user') {
          activity.push({
            type: 'message',
            timestamp: msg.timestamp,
            icon: '💬',
            title: `Asked: "${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}"`,
            time: formatTimeAgo(msg.timestamp),
          });
        }
      });

      // Sort by timestamp
      activity.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivity(activity.slice(0, 10));

      setStats({
        checkInsThisWeek,
        remindersActive,
        fallAlertsThisWeek,
        lastActivity: lastCheckIn ? formatTimeAgo(lastCheckIn.timestamp) : 'No activity yet',
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRefreshing(true);
    await loadDashboardData();
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Family Dashboard</Text>
          <Text style={styles.subtitle}>
            Monitoring {seniorName || 'your loved one'}
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Current Status</Text>
            {lastCheckIn && (
              <View style={[
                styles.statusBadge,
                lastCheckIn.status === 'ok' ? styles.statusBadgeOk : styles.statusBadgeHelp
              ]}>
                <Text style={styles.statusBadgeText}>
                  {lastCheckIn.status === 'ok' ? '✓ OK' : '⚠️ Needs Help'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statusText}>
            {lastCheckIn 
              ? `Last checked in ${formatTimeAgo(lastCheckIn.timestamp)}`
              : 'No check-ins yet'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.checkInsThisWeek}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
            <Text style={styles.statPeriod}>this week</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.remindersActive}</Text>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statPeriod}>reminders</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[
              styles.statNumber,
              stats.fallAlertsThisWeek > 0 && styles.statNumberAlert
            ]}>
              {stats.fallAlertsThisWeek}
            </Text>
            <Text style={styles.statLabel}>Fall alerts</Text>
            <Text style={styles.statPeriod}>this week</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              // TODO: Implement call functionality
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            accessible={true}
            accessibilityLabel={`Call ${seniorName}`}
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📞</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Call {seniorName}</Text>
              <Text style={styles.actionDescription}>Check in with a phone call</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              // TODO: Implement message functionality
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            accessible={true}
            accessibilityLabel="Send a message"
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💬</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Send Message</Text>
              <Text style={styles.actionDescription}>Send a quick text message</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              if (navigation) {
                navigation.navigate('EmergencyContacts');
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            accessible={true}
            accessibilityLabel="Manage emergency contacts"
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>🚨</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Emergency Contacts</Text>
              <Text style={styles.actionDescription}>Manage alert settings</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No recent activity</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {recentActivity.map((item, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.activityIconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: spacing.lg,
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

  header: {
    marginBottom: spacing.xl,
  },

  title: {
    ...typography.h1,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.body,
    color: colors.gray600,
  },

  statusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },

  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  statusTitle: {
    ...typography.h3,
    color: colors.gray900,
  },

  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },

  statusBadgeOk: {
    backgroundColor: colors.successLight,
  },

  statusBadgeHelp: {
    backgroundColor: colors.errorLight,
  },

  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },

  statusText: {
    ...typography.body,
    color: colors.gray600,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },

  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  statNumberAlert: {
    color: colors.error,
  },

  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
    textAlign: 'center',
  },

  statPeriod: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    marginBottom: spacing.md,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  actionIconText: {
    fontSize: 24,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  actionDescription: {
    fontSize: 14,
    color: colors.gray600,
  },

  actionArrow: {
    fontSize: 24,
    color: colors.gray300,
  },

  activityList: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  activityIconText: {
    fontSize: 20,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  activityTime: {
    fontSize: 12,
    color: colors.gray500,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },

  emptyText: {
    ...typography.body,
    color: colors.gray500,
  },
});

