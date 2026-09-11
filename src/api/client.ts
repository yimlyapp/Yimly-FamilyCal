import {
  User,
  Family,
  FamilyMember,
  Calendar,
  CalendarEvent,
  Task,
  BirthdayItem,
  GoogleConfigResponse,
  GoogleAccount,
  GoogleSyncLog,
  SystemStats,
} from '../types';

class ApiError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('yimly_jwt_token');
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new ApiError(errorMsg, response.status);
  }

  return response.json();
}

export const api = {
  // Auth
  getSetupStatus: () => fetchJson<{ isSetupComplete: boolean; userCount: number }>('/api/auth/setup-status'),
  
  register: (data: {
    familyName: string;
    name: string;
    email: string;
    password: string;
    color?: string;
    birthday?: string;
  }) => fetchJson<{ user: User; token: string; family: Family }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    fetchJson<{ user: User; token: string; family: Family }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchJson<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetchJson<{ user: User; family: Family; memberProfile?: FamilyMember }>('/api/auth/me'),

  // Family & Members
  getFamily: () => fetchJson<{ family: Family; members: FamilyMember[] }>('/api/family'),
  
  updateFamily: (data: { name?: string; timezone?: string }) =>
    fetchJson<Family>('/api/family', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createMember: (data: Partial<FamilyMember>) =>
    fetchJson<FamilyMember>('/api/family/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (id: string, data: Partial<FamilyMember>) =>
    fetchJson<FamilyMember>(`/api/family/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMember: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/family/members/${id}`, {
      method: 'DELETE',
    }),

  // Calendars
  getCalendars: () => fetchJson<Calendar[]>('/api/calendars'),

  createCalendar: (data: { name: string; color?: string; description?: string }) =>
    fetchJson<Calendar>('/api/calendars', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCalendar: (id: string, data: Partial<Calendar>) =>
    fetchJson<Calendar>(`/api/calendars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCalendar: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/calendars/${id}`, {
      method: 'DELETE',
    }),

  // Events
  getEvents: (params?: { start?: string; end?: string; member_id?: string; calendar_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.start) query.set('start', params.start);
    if (params?.end) query.set('end', params.end);
    if (params?.member_id) query.set('member_id', params.member_id);
    if (params?.calendar_id) query.set('calendar_id', params.calendar_id);
    return fetchJson<CalendarEvent[]>(`/api/events?${query.toString()}`);
  },

  createEvent: (data: Partial<CalendarEvent>) =>
    fetchJson<CalendarEvent>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    fetchJson<CalendarEvent>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEvent: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/events/${id}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTasks: () => fetchJson<Task[]>('/api/tasks'),

  createTask: (data: Partial<Task>) =>
    fetchJson<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleTask: (id: string) =>
    fetchJson<Task>(`/api/tasks/${id}/toggle`, {
      method: 'POST',
    }),

  deleteTask: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Birthdays
  getBirthdays: () => fetchJson<BirthdayItem[]>('/api/birthdays'),

  // Google Calendar Integration
  getGoogleConfig: () => fetchJson<GoogleConfigResponse>('/api/calendar/google/config'),
  
  getGoogleAuthUrl: () => fetchJson<{ url: string; state: string }>('/api/calendar/google/auth-url?json=true'),

  getGoogleAccounts: () => fetchJson<GoogleAccount[]>('/api/calendar/google/accounts'),

  discoverGoogleCalendars: (accountId?: string) =>
    fetchJson<{ success: boolean; count: number; calendars: any[] }>('/api/calendar/google/discover', {
      method: 'POST',
      body: JSON.stringify({ account_id: accountId }),
    }),

  syncGoogle: (accountId?: string) =>
    fetchJson<{ success: boolean; eventsSynced: number; syncedAt: string }>('/api/calendar/google/sync', {
      method: 'POST',
      body: JSON.stringify({ account_id: accountId }),
    }),

  disconnectGoogle: (accountId?: string) =>
    fetchJson<{ success: boolean }>('/api/calendar/google/disconnect', {
      method: 'POST',
      body: JSON.stringify({ account_id: accountId }),
    }),

  getGoogleLogs: () => fetchJson<GoogleSyncLog[]>('/api/calendar/google/logs'),

  // System Stats & Export
  getSystemStats: () => fetchJson<SystemStats>('/api/system/stats'),
};
