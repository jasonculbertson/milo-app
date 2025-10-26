export type UserRole = 'mom' | 'family';

export interface User {
  id: string;
  phone_number: string;
  name: string;
  role: UserRole;
  expo_push_token: string | null;
  notification_time: string;
  alert_time: string;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  status: 'ok' | 'need_help';
  message: string | null;
  timestamp: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  family_member_id: string;
  created_at: string;
  family_member?: User;
}

