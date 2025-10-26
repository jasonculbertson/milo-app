import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CheckIn, FamilyMember } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: '@milo:current_user',
  FAMILY_MEMBERS: '@milo:family_members',
  CHECKINS: '@milo:checkins',
  PUSH_TOKENS: '@milo:push_tokens',
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
export async function saveCheckIn(checkIn: CheckIn): Promise<void> {
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
    c.user_id === userId && 
    c.timestamp.startsWith(today)
  ) || null;
}

// Push Token Management (for family member devices)
export async function savePushToken(userId: string, token: string, phoneNumber: string): Promise<void> {
  const tokens = await getPushTokens();
  tokens[userId] = { token, phoneNumber, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKENS, JSON.stringify(tokens));
}

export async function getPushTokens(): Promise<Record<string, { token: string; phoneNumber: string; updatedAt: string }>> {
  const tokensJson = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKENS);
  return tokensJson ? JSON.parse(tokensJson) : {};
}

export async function getPushToken(userId: string): Promise<string | null> {
  const tokens = await getPushTokens();
  return tokens[userId]?.token || null;
}

// Sync helpers (can be extended with iCloud later)
export async function exportAllData(): Promise<string> {
  const user = await getCurrentUser();
  const familyMembers = await getFamilyMembers();
  const checkIns = await getCheckIns();
  const pushTokens = await getPushTokens();

  return JSON.stringify({
    user,
    familyMembers,
    checkIns,
    pushTokens,
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
}

