import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CheckIn, FamilyMember } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: '@milo:current_user',
  FAMILY_MEMBERS: '@milo:family_members',
  CHECKINS: '@milo:checkins',
  PUSH_TOKENS: '@milo:push_tokens',
  REMINDERS: '@milo:reminders',
  MESSAGES: '@milo:messages',
  FALL_EVENTS: '@milo:fall_events',
  SETTINGS: '@milo:settings',
  EMERGENCY_CONTACTS: '@milo:emergency_contacts',
};

// User Storage
export async function saveCurrentUser(user: User): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<User | null> {
  const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
}

export async function clearCurrentUser(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Family Members Storage
export async function saveFamilyMembers(members: User[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
}

export async function getFamilyMembers(): Promise<User[]> {
  const membersJson = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
  return membersJson ? JSON.parse(membersJson) : [];
}

export async function addFamilyMember(member: User): Promise<void> {
  const members = await getFamilyMembers();
  members.push(member);
  await saveFamilyMembers(members);
}

// Check-ins Storage
export async function addCheckIn(checkIn: CheckIn): Promise<void> {
  const checkIns = await getCheckIns();
  checkIns.unshift(checkIn);
  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = checkIns.filter(c => new Date(c.timestamp) > thirtyDaysAgo);
  await AsyncStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered));
}

export async function getCheckIns(): Promise<CheckIn[]> {
  const checkInsJson = await AsyncStorage.getItem(STORAGE_KEYS.CHECKINS);
  return checkInsJson ? JSON.parse(checkInsJson) : [];
}

export async function getTodayCheckIn(userId: string): Promise<CheckIn | null> {
  const checkIns = await getCheckIns();
  const today = new Date().toISOString().split('T')[0];
  return checkIns.find(c => 
    c.userId === userId && 
    c.timestamp.startsWith(today)
  ) || null;
}

// Push Token Management (for family member devices)
export async function savePushToken(userId: string, token: string): Promise<void> {
  const tokens = await getPushTokens();
  tokens[userId] = token;
  await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKENS, JSON.stringify(tokens));
}

export async function getPushTokens(): Promise<Record<string, string>> {
  const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKENS);
  return tokensJson ? JSON.parse(tokensJson) : {};
}

export async function getPushToken(userId: string): Promise<string | null> {
  const tokens = await getPushTokens();
  return tokens[userId] || null;
}

export async function removePushToken(userId: string): Promise<void> {
  const tokens = await getPushTokens();
  delete tokens[userId];
  await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKENS, JSON.stringify(tokens));
}

// Reminders Storage
export interface Reminder {
  id: string;
  userId: string;
  text: string;
  when_iso: string;
  status: 'scheduled' | 'completed' | 'missed';
  notificationId?: string;
  createdAt: string;
}

export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
}

export async function getReminders(): Promise<Reminder[]> {
  const remindersJson = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
  return remindersJson ? JSON.parse(remindersJson) : [];
}

export async function addReminder(reminder: Reminder): Promise<void> {
  const reminders = await getReminders();
  reminders.push(reminder);
  await saveReminders(reminders);
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === id);
  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...updates };
    await saveReminders(reminders);
  }
}

export async function deleteReminder(id: string): Promise<void> {
  const reminders = await getReminders();
  await saveReminders(reminders.filter(r => r.id !== id));
}

// Messages Storage (Voice Chat History)
export interface Message {
  id: string;
  userId: string;
  type: 'user' | 'milo';
  text: string;
  timestamp: string;
}

export async function saveMessages(messages: Message[]): Promise<void> {
  // Keep only last 100 messages
  const limited = messages.slice(-100);
  await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(limited));
}

export async function getMessages(userId: string): Promise<Message[]> {
  const messagesJson = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
  const allMessages = messagesJson ? JSON.parse(messagesJson) : [];
  return allMessages.filter((m: Message) => m.userId === userId);
}

export async function addMessage(message: Message): Promise<void> {
  const messages = await getMessages(message.userId);
  messages.push(message);
  await saveMessages(messages);
}

export async function clearMessages(userId: string): Promise<void> {
  const allMessages = await getMessages(userId);
  const otherMessages = allMessages.filter((m: Message) => m.userId !== userId);
  await saveMessages(otherMessages);
}

// Fall Events Storage
export interface FallEvent {
  id: string;
  userId: string;
  type: 'fall_detected' | 'fall_confirmed' | 'user_ok' | 'family_notified';
  timestamp: string;
  acceleration_g?: number;
  inactive_duration_ms?: number;
  location?: { lat: number; lng: number };
  battery?: number;
}

export async function saveFallEvents(events: FallEvent[]): Promise<void> {
  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = events.filter(e => new Date(e.timestamp) > thirtyDaysAgo);
  await AsyncStorage.setItem(STORAGE_KEYS.FALL_EVENTS, JSON.stringify(filtered));
}

export async function getFallEvents(userId?: string): Promise<FallEvent[]> {
  const eventsJson = await AsyncStorage.getItem(STORAGE_KEYS.FALL_EVENTS);
  const allEvents = eventsJson ? JSON.parse(eventsJson) : [];
  return userId ? allEvents.filter((e: FallEvent) => e.userId === userId) : allEvents;
}

export async function addFallEvent(event: FallEvent): Promise<void> {
  const events = await getFallEvents();
  events.push(event);
  await saveFallEvents(events);
}

// Emergency Contacts Storage
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  notificationPreferences: {
    fallAlerts: boolean;
    missedCheckIns: boolean;
    weeklyUpdate: boolean;
  };
}

export async function saveEmergencyContacts(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
  return contactsJson ? JSON.parse(contactsJson) : [];
}

export async function addEmergencyContact(contact: EmergencyContact): Promise<void> {
  const contacts = await getEmergencyContacts();
  contacts.push(contact);
  await saveEmergencyContacts(contacts);
}

export async function updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<void> {
  const contacts = await getEmergencyContacts();
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updates };
    await saveEmergencyContacts(contacts);
  }
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  const contacts = await getEmergencyContacts();
  await saveEmergencyContacts(contacts.filter(c => c.id !== id));
}

// Settings Storage
export interface AppSettings {
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  soundEnabled: boolean;
  fallDetectionEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  voiceSpeed: number; // 0.5 to 1.5
  lastSyncAt?: string;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
  const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  const defaultSettings: AppSettings = {
    notificationsEnabled: true,
    dailyReminderTime: '09:00',
    soundEnabled: true,
    fallDetectionEnabled: false,
    hapticFeedbackEnabled: true,
    voiceSpeed: 0.85,
  };
  return settingsJson ? { ...defaultSettings, ...JSON.parse(settingsJson) } : defaultSettings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, ...updates });
}

// Sync helpers (can be extended with iCloud later)
export async function exportAllData(): Promise<string> {
  const user = await getCurrentUser();
  const familyMembers = await getFamilyMembers();
  const checkIns = await getCheckIns();
  const pushTokens = await getPushTokens();
  const reminders = await getReminders();
  const messages = await getMessages(user?.id || '');
  const fallEvents = await getFallEvents();
  const emergencyContacts = await getEmergencyContacts();
  const settings = await getSettings();

  return JSON.stringify({
    user,
    familyMembers,
    checkIns,
    pushTokens,
    reminders,
    messages,
    fallEvents,
    emergencyContacts,
    settings,
    exportedAt: new Date().toISOString(),
  });
}

export async function importAllData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  
  if (data.user) await saveCurrentUser(data.user);
  if (data.familyMembers) await saveFamilyMembers(data.familyMembers);
  if (data.checkIns) {
    await AsyncStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(data.checkIns));
  }
  if (data.pushTokens) {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKENS, JSON.stringify(data.pushTokens));
  }
  if (data.reminders) await saveReminders(data.reminders);
  if (data.messages) await saveMessages(data.messages);
  if (data.fallEvents) await saveFallEvents(data.fallEvents);
  if (data.emergencyContacts) await saveEmergencyContacts(data.emergencyContacts);
  if (data.settings) await saveSettings(data.settings);
}

// Clear all app data (for sign out or reset)
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}

