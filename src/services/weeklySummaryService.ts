/**
 * Weekly Summary Service
 * Generates and sends weekly activity summaries to family members
 */

import * as Notifications from 'expo-notifications';
import {
  getCheckIns,
  getFallEvents,
  getReminders,
  getCurrentUser,
  getEmergencyContacts,
} from '../config/storage';
import { sendPushNotificationToToken } from './notificationService';

export interface WeeklySummary {
  seniorName: string;
  weekStart: string;
  weekEnd: string;
  checkIns: {
    total: number;
    ok: number;
    needHelp: number;
  };
  fallEvents: {
    total: number;
    resolved: number;
    unresolved: number;
  };
  reminders: {
    completed: number;
    missed: number;
  };
  overallStatus: 'good' | 'attention' | 'urgent';
}

/**
 * Generate weekly summary data
 */
export async function generateWeeklySummary(): Promise<WeeklySummary | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Get date range (last 7 days)
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // Get check-ins
    const allCheckIns = await getCheckIns();
    const weekCheckIns = allCheckIns.filter(c => 
      new Date(c.timestamp) >= weekStart && new Date(c.timestamp) <= weekEnd
    );

    const checkInsOk = weekCheckIns.filter(c => c.status === 'ok').length;
    const checkInsHelp = weekCheckIns.filter(c => c.status === 'help').length;

    // Get fall events
    const allFallEvents = await getFallEvents();
    const weekFallEvents = allFallEvents.filter(f => 
      new Date(f.timestamp) >= weekStart && new Date(f.timestamp) <= weekEnd
    );

    const fallsResolved = weekFallEvents.filter(f => f.type === 'user_ok').length;
    const fallsUnresolved = weekFallEvents.filter(f => 
      f.type === 'fall_confirmed'
    ).length;

    // Get reminders
    const allReminders = await getReminders();
    const weekReminders = allReminders.filter(r => 
      new Date(r.createdAt) >= weekStart && new Date(r.createdAt) <= weekEnd
    );

    const remindersCompleted = weekReminders.filter(r => 
      r.status === 'completed'
    ).length;
    const remindersMissed = weekReminders.filter(r => 
      r.status === 'missed'
    ).length;

    // Determine overall status
    let overallStatus: 'good' | 'attention' | 'urgent' = 'good';
    
    if (fallsUnresolved > 0 || checkInsHelp > 2) {
      overallStatus = 'urgent';
    } else if (
      weekCheckIns.length < 3 || 
      remindersMissed > 3 || 
      fallsResolved > 0
    ) {
      overallStatus = 'attention';
    }

    return {
      seniorName: user.name,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      checkIns: {
        total: weekCheckIns.length,
        ok: checkInsOk,
        needHelp: checkInsHelp,
      },
      fallEvents: {
        total: weekFallEvents.length,
        resolved: fallsResolved,
        unresolved: fallsUnresolved,
      },
      reminders: {
        completed: remindersCompleted,
        missed: remindersMissed,
      },
      overallStatus,
    };
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return null;
  }
}

/**
 * Format summary into readable text
 */
function formatSummaryText(summary: WeeklySummary): { title: string; body: string } {
  const { seniorName, checkIns, fallEvents, overallStatus } = summary;

  let title = '';
  let body = '';

  switch (overallStatus) {
    case 'good':
      title = `✅ ${seniorName} had a great week!`;
      body = `${checkIns.total} check-ins, all good. ${fallEvents.total === 0 ? 'No fall alerts.' : `${fallEvents.resolved} fall alerts resolved.`}`;
      break;
    
    case 'attention':
      title = `⚠️ ${seniorName}'s weekly update`;
      body = `${checkIns.total} check-ins this week. `;
      if (checkIns.total < 3) {
        body += 'Lower activity than usual. ';
      }
      if (fallEvents.resolved > 0) {
        body += `${fallEvents.resolved} fall alerts (all resolved). `;
      }
      body += 'Consider checking in.';
      break;
    
    case 'urgent':
      title = `🚨 ${seniorName} needs attention`;
      body = `${checkIns.needHelp} help requests this week. `;
      if (fallEvents.unresolved > 0) {
        body += `${fallEvents.unresolved} unresolved fall alerts. `;
      }
      body += 'Please reach out soon.';
      break;
  }

  return { title, body };
}

/**
 * Send weekly summary to all family members
 */
export async function sendWeeklySummaryToFamily(): Promise<void> {
  try {
    const summary = await generateWeeklySummary();
    if (!summary) {
      console.log('No summary data available');
      return;
    }

    // Get emergency contacts (family members)
    const contacts = await getEmergencyContacts();
    const familyContacts = contacts.filter(c => 
      c.notificationPreferences.weeklyUpdate
    );

    if (familyContacts.length === 0) {
      console.log('No family members to send summary to');
      return;
    }

    const { title, body } = formatSummaryText(summary);

    // Send to each family member
    for (const contact of familyContacts) {
      try {
        // In production, this would use their expo push token
        // For now, send local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              type: 'weekly_summary',
              summary,
            },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: null, // Immediate
        });

        console.log(`Weekly summary sent to ${contact.name}`);
      } catch (error) {
        console.error(`Error sending summary to ${contact.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending weekly summary:', error);
  }
}

/**
 * Schedule weekly summary notifications
 * Sends every Sunday at 6 PM
 */
export async function scheduleWeeklySummaries(): Promise<void> {
  try {
    // Cancel any existing weekly summaries
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of existingNotifications) {
      if (notification.content.data?.type === 'weekly_summary_trigger') {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }

    // Schedule weekly notification for Sunday at 6 PM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Summary',
        body: 'Generating your weekly activity summary...',
        data: {
          type: 'weekly_summary_trigger',
        },
      },
      trigger: {
        weekday: 1, // Sunday
        hour: 18, // 6 PM
        minute: 0,
        repeats: true,
      },
    });

    console.log('Weekly summary notifications scheduled');
  } catch (error) {
    console.error('Error scheduling weekly summaries:', error);
  }
}

/**
 * Handle weekly summary trigger notification
 * Call this when the trigger notification is received
 */
export async function handleWeeklySummaryTrigger(): Promise<void> {
  console.log('Weekly summary triggered');
  await sendWeeklySummaryToFamily();
}

/**
 * Get summary text for display in app
 */
export function getSummaryDisplayText(summary: WeeklySummary): string {
  const { checkIns, fallEvents, reminders, overallStatus } = summary;
  
  let text = `This Week:\n\n`;
  text += `📊 ${checkIns.total} check-ins (${checkIns.ok} OK, ${checkIns.needHelp} help requests)\n`;
  
  if (fallEvents.total > 0) {
    text += `🚨 ${fallEvents.total} fall alerts (${fallEvents.resolved} resolved)\n`;
  }
  
  text += `⏰ ${reminders.completed} reminders completed, ${reminders.missed} missed\n\n`;
  
  text += `Status: `;
  switch (overallStatus) {
    case 'good':
      text += '✅ All good';
      break;
    case 'attention':
      text += '⚠️ Needs attention';
      break;
    case 'urgent':
      text += '🚨 Urgent';
      break;
  }
  
  return text;
}

/**
 * Test function to send summary immediately
 */
export async function sendTestWeeklySummary(): Promise<void> {
  console.log('Sending test weekly summary...');
  await sendWeeklySummaryToFamily();
}

