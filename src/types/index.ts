export type UserRole = 'administrator' | 'adult' | 'child';

export interface User {
  id: string;
  family_id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  color?: string;
  birthday?: string;
}

export interface Family {
  id: string;
  name: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id?: string | null;
  name: string;
  role: UserRole;
  color: string;
  avatar_url?: string | null;
  birthday?: string | null;
  is_active: number;
  user_email?: string | null;
}

export interface Calendar {
  id: string;
  family_id: string;
  member_id?: string | null;
  member_name?: string | null;
  member_color?: string | null;
  name: string;
  color: string;
  description?: string | null;
  is_default: number;
  source: 'yimly' | 'google';
  google_calendar_id?: string | null;
  is_read_only: number;
  sync_enabled: number;
}

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type SyncStatus = 'local_only' | 'synced' | 'pending';

export interface CalendarEvent {
  id: string;
  family_id: string;
  calendar_id: string;
  calendar_name?: string;
  calendar_source?: 'yimly' | 'google';
  title: string;
  description?: string | null;
  location?: string | null;
  color: string;
  start_time: string; // ISO String
  end_time: string;   // ISO String
  all_day: boolean;
  recurring_rule: RecurrenceRule;
  recurring_until?: string | null;
  assigned_member_ids: string[];
  google_event_id?: string | null;
  google_calendar_id?: string | null;
  sync_status: SyncStatus;
  created_by?: string | null;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  family_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  completed: boolean;
  completed_at?: string | null;
  assigned_member_id?: string | null;
  member_name?: string | null;
  member_color?: string | null;
  member_avatar?: string | null;
  priority: Priority;
}

export interface BirthdayItem {
  member_id: string;
  name: string;
  role: UserRole;
  color: string;
  avatar_url?: string | null;
  birthday: string;
  next_birthday_date: string;
  days_until: number;
  turning_age?: number;
}

export interface GoogleAccount {
  id: string;
  google_email: string;
  sync_status: string;
  sync_error?: string | null;
  last_synced_at?: string | null;
  created_at: string;
}

export interface GoogleSyncLog {
  id: string;
  sync_type: string;
  status: string;
  events_synced: number;
  details?: string | null;
  created_at: string;
}

export interface GoogleConfigResponse {
  isConfigured: boolean;
  redirectUri: string;
  hasClientId: boolean;
  connectedAccounts: GoogleAccount[];
}

export interface SystemStats {
  status: string;
  version: string;
  familyId: string;
  members: number;
  events: number;
  tasks: number;
  calendars: number;
  googleSync: {
    google_email?: string;
    sync_status?: string;
    last_synced_at?: string;
  };
  serverTime: string;
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';
