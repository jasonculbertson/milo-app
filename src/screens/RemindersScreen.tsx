import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Input } from '../components/Input';
import { Toast } from '../components/Toast';
import * as Haptics from 'expo-haptics';
import { createReminder } from '../services/aiService';
import * as Notifications from 'expo-notifications';
import {
  getReminders,
  addReminder as saveReminder,
  updateReminder as saveUpdateReminder,
  deleteReminder as saveDeleteReminder,
  getCurrentUser,
  Reminder,
} from '../config/storage';

export function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminderText, setNewReminderText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setIsLoadingData(true);
      const stored = await getReminders();
      setReminders(stored);
    } catch (error) {
      console.error('Error loading reminders:', error);
      setToastMessage('Failed to load reminders');
      setShowToast(true);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderText.trim()) {
      return;
    }

    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Parse and create reminder using AI
      const response = await createReminder({
        text: newReminderText,
      });

      // Schedule local notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reminder ⏰',
          body: newReminderText,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: new Date(response.when_iso),
        },
      });

      const newReminder: Reminder = {
        id: response.reminder_id,
        userId: user.id,
        text: newReminderText,
        when_iso: response.when_iso,
        status: 'scheduled',
        notificationId,
        createdAt: new Date().toISOString(),
      };

      // Save to persistent storage
      await saveReminder(newReminder);
      await loadReminders(); // Reload from storage

      setNewReminderText('');
      setShowAddModal(false);
      setToastMessage('Reminder set!');
      setShowToast(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding reminder:', error);
      setToastMessage('Could not create reminder. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReminder = async (reminder: Reminder) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Cancel notification if scheduled
      if (reminder.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        } catch (err) {
          console.log('Notification already fired or cancelled');
        }
      }

      // Update in storage
      await saveUpdateReminder(reminder.id, { status: 'completed' });
      await loadReminders(); // Reload from storage

      setToastMessage('Done! ✓');
      setShowToast(true);
    } catch (error) {
      console.error('Error completing reminder:', error);
      setToastMessage('Failed to complete reminder');
      setShowToast(true);
    }
  };

  const handleDeleteReminder = async (reminder: Reminder) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              // Cancel notification
              if (reminder.notificationId) {
                try {
                  await Notifications.cancelScheduledNotificationAsync(
                    reminder.notificationId
                  );
                } catch (err) {
                  console.log('Notification already fired or cancelled');
                }
              }

              // Delete from storage
              await saveDeleteReminder(reminder.id);
              await loadReminders(); // Reload from storage
            } catch (error) {
              console.error('Error deleting reminder:', error);
              setToastMessage('Failed to delete reminder');
              setShowToast(true);
            }
          },
        },
      ]
    );
  };

  const upcomingReminders = reminders.filter((r) => r.status === 'scheduled');
  const completedReminders = reminders.filter((r) => r.status === 'completed');

  // Show loading state
  if (isLoadingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reminders</Text>
          <Text style={styles.subtitle}>
            I'll remind you at just the right time
          </Text>
        </View>

        {/* Add Reminder Button */}
        <PrimaryButton onPress={() => setShowAddModal(true)}>
          + Add Reminder
        </PrimaryButton>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleCompleteReminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </View>
        )}

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={handleCompleteReminder}
                onDelete={handleDeleteReminder}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>⏰</Text>
            <Text style={styles.emptyStateTitle}>No reminders yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first reminder using natural language like "Remind me to take pills at 8 PM"
            </Text>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• "Remind me in 2 hours"</Text>
          <Text style={styles.tipText}>• "Medicine at 8 PM"</Text>
          <Text style={styles.tipText}>• "Call John tomorrow"</Text>
          <Text style={styles.tipText}>• "Take pills at 9:30 AM"</Text>
        </View>
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Reminder</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="What do you want to be reminded about?"
              placeholder="e.g., Take medication at 8 PM"
              value={newReminderText}
              onChangeText={setNewReminderText}
              multiline
              numberOfLines={3}
              autoFocus
            />

            <Text style={styles.helperText}>
              I'll understand natural language like "in 2 hours" or "tomorrow at 3 PM"
            </Text>

            <PrimaryButton
              onPress={handleAddReminder}
              loading={loading}
              disabled={!newReminderText.trim()}
            >
              Create Reminder
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </Modal>

      <Toast
        message={toastMessage}
        visible={showToast}
        type="success"
        onHide={() => setShowToast(false)}
      />
    </SafeAreaView>
  );
}

function ReminderCard({
  reminder,
  onComplete,
  onDelete,
}: {
  reminder: Reminder;
  onComplete: (reminder: Reminder) => void;
  onDelete: (reminder: Reminder) => void;
}) {
  const when = new Date(reminder.when_iso);
  const now = new Date();
  const isPast = when < now;
  const isCompleted = reminder.status === 'completed';

  const formatTime = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whenDate = new Date(when);
    whenDate.setHours(0, 0, 0, 0);

    const timeStr = when.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (whenDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`;
    } else if (whenDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return when.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  return (
    <View
      style={[
        styles.reminderCard,
        isCompleted && styles.reminderCardCompleted,
      ]}
    >
      <View style={styles.reminderContent}>
        <Text
          style={[
            styles.reminderText,
            isCompleted && styles.reminderTextCompleted,
          ]}
        >
          {reminder.text}
        </Text>
        <Text
          style={[
            styles.reminderTime,
            isPast && !isCompleted && styles.reminderTimePast,
          ]}
        >
          {formatTime()}
        </Text>
      </View>

      <View style={styles.reminderActions}>
        {!isCompleted && (
          <TouchableOpacity
            style={styles.reminderActionButton}
            onPress={() => onComplete(reminder)}
          >
            <Text style={styles.reminderActionIcon}>✓</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.reminderActionButton}
          onPress={() => onDelete(reminder)}
        >
          <Text style={[styles.reminderActionIcon, { color: colors.error }]}>
            ×
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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

  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodyLarge,
    marginBottom: spacing.lg,
  },

  section: {
    marginTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.md,
  },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  reminderCardCompleted: {
    opacity: 0.6,
  },

  reminderContent: {
    flex: 1,
  },

  reminderText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.gray800,
    marginBottom: spacing.xs,
  },

  reminderTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray600,
  },

  reminderTime: {
    fontSize: 14,
    color: colors.gray600,
  },

  reminderTimePast: {
    color: colors.warning,
    fontWeight: '600',
  },

  reminderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  reminderActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  reminderActionIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.success,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },

  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },

  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.sm,
  },

  emptyStateText: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },

  tipsContainer: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.sm,
  },

  tipText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 24,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  modalCancel: {
    fontSize: 16,
    color: colors.primary,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },

  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },

  helperText: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
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

