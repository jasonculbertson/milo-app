export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'senior' | 'family';
  createdAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  status: 'ok' | 'help';
  timestamp: string;
  message?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  userId: string; // The senior's user ID
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  time: string; // ISO string or time format
  recurring: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  sound: boolean;
}
