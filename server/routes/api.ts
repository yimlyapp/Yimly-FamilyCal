import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  generateToken,
  TOKEN_COOKIE_NAME,
  AuthRequest,
} from '../auth.js';
import {
  getGoogleConfig,
  generateAuthUrl,
  handleOAuthCallback,
  discoverGoogleCalendars,
  syncTwoWay,
  disconnectGoogle,
} from '../googleSync.js';

export const router = express.Router();

// ==========================================
// 1. AUTHENTICATION & ONBOARDING
// ==========================================

router.get('/auth/setup-status', (req: Request, res: Response) => {
  try {
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    res.json({
      isSetupComplete: userCount > 0,
      userCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { familyName, name, email, password, color, birthday } = req.body;
    if (!familyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Family name, user name, email, and password are required.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const now = new Date().toISOString();
    const familyId = 'fam_' + uuidv4().slice(0, 8);
    const userId = 'usr_' + uuidv4().slice(0, 8);
    const memberId = 'mem_' + uuidv4().slice(0, 8);
    const defaultCalId = 'cal_' + uuidv4().slice(0, 8);
    const passwordHash = bcrypt.hashSync(password, 10);
    const userColor = color || '#FF4FA3';

    // 1. Create Family
    db.prepare(`
      INSERT INTO families (id, name, timezone, created_at, updated_at)
      VALUES (?, ?, 'UTC', ?, ?)
    `).run(familyId, familyName.trim(), now, now);

    // 2. Create User
    db.prepare(`
      INSERT INTO users (id, family_id, email, password_hash, name, role, color, birthday, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'administrator', ?, ?, ?, ?)
    `).run(userId, familyId, email.toLowerCase().trim(), passwordHash, name.trim(), userColor, birthday || null, now, now);

    // 3. Create Admin Family Member
    db.prepare(`
      INSERT INTO family_members (id, family_id, user_id, name, role, color, birthday, is_active, created_at)
      VALUES (?, ?, ?, ?, 'administrator', ?, ?, 1, ?)
    `).run(memberId, familyId, userId, name.trim(), userColor, birthday || null, now);

    // 4. Create Default Family Calendar
    db.prepare(`
      INSERT INTO calendars (id, family_id, name, color, description, is_default, source, is_read_only, sync_enabled, created_at, updated_at)
      VALUES (?, ?, 'Family Hub', ?, 'Main shared household calendar', 1, 'yimly', 0, 1, ?, ?)
    `).run(defaultCalId, familyId, userColor, now, now);

    const authUser = {
      id: userId,
      family_id: familyId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'administrator' as const,
      color: userColor,
    };

    const token = generateToken(authUser);
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: authUser,
      token,
      family: { id: familyId, name: familyName.trim() },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const authUser = {
      id: user.id,
      family_id: user.family_id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      color: user.color,
    };

    const token = generateToken(authUser);
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const family = db.prepare('SELECT id, name, timezone FROM families WHERE id = ?').get(user.family_id);

    res.json({
      user: authUser,
      token,
      family,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie(TOKEN_COOKIE_NAME);
  res.json({ success: true, message: 'Logged out successfully.' });
});

router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const family = db.prepare('SELECT * FROM families WHERE id = ?').get(user.family_id);
    const memberProfile = db.prepare('SELECT * FROM family_members WHERE family_id = ? AND user_id = ?').get(
      user.family_id,
      user.id
    );

    res.json({
      user,
      family,
      memberProfile,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. FAMILY & MEMBERS MANAGEMENT
// ==========================================

router.get('/family', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const family = db.prepare('SELECT * FROM families WHERE id = ?').get(req.user!.family_id);
    const members = db.prepare(`
      SELECT m.*, u.email as user_email
      FROM family_members m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.family_id = ? AND m.is_active = 1
      ORDER BY m.created_at ASC
    `).all(req.user!.family_id);

    res.json({ family, members });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/family', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, timezone } = req.body;
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE families
      SET name = COALESCE(?, name), timezone = COALESCE(?, timezone), updated_at = ?
      WHERE id = ?
    `).run(name || null, timezone || null, now, req.user!.family_id);

    const updated = db.prepare('SELECT * FROM families WHERE id = ?').get(req.user!.family_id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/family/members', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, role, color, avatar_url, birthday } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Member name is required.' });
    }

    const memberId = 'mem_' + uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO family_members (id, family_id, user_id, name, role, color, avatar_url, birthday, is_active, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      memberId,
      req.user!.family_id,
      name.trim(),
      role || 'adult',
      color || '#FF4FA3',
      avatar_url || null,
      birthday || null,
      now
    );

    const newMember = db.prepare('SELECT * FROM family_members WHERE id = ?').get(memberId);
    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/family/members/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, color, avatar_url, birthday } = req.body;

    const existing = db.prepare('SELECT * FROM family_members WHERE id = ? AND family_id = ?').get(
      id,
      req.user!.family_id
    );
    if (!existing) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    db.prepare(`
      UPDATE family_members
      SET name = COALESCE(?, name), role = COALESCE(?, role), color = COALESCE(?, color),
          avatar_url = COALESCE(?, avatar_url), birthday = COALESCE(?, birthday)
      WHERE id = ? AND family_id = ?
    `).run(name || null, role || null, color || null, avatar_url || null, birthday || null, id, req.user!.family_id);

    const updated = db.prepare('SELECT * FROM family_members WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/family/members/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE family_members SET is_active = 0 WHERE id = ? AND family_id = ?').run(
      id,
      req.user!.family_id
    );
    res.json({ success: true, message: 'Member deactivated.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CALENDARS
// ==========================================

router.get('/calendars', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const calendars = db.prepare(`
      SELECT * FROM calendars
      WHERE family_id = ?
      ORDER BY is_default DESC, name ASC
    `).all(req.user!.family_id);

    res.json(calendars);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/calendars', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, color, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Calendar name is required.' });
    }

    const calId = 'cal_' + uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO calendars (id, family_id, name, color, description, is_default, source, is_read_only, sync_enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 0, 'yimly', 0, 1, ?, ?)
    `).run(calId, req.user!.family_id, name.trim(), color || '#FF4FA3', description || null, now, now);

    const created = db.prepare('SELECT * FROM calendars WHERE id = ?').get(calId);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/calendars/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, description, sync_enabled, is_read_only } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE calendars
      SET name = COALESCE(?, name),
          color = COALESCE(?, color),
          description = COALESCE(?, description),
          sync_enabled = COALESCE(?, sync_enabled),
          is_read_only = COALESCE(?, is_read_only),
          updated_at = ?
      WHERE id = ? AND family_id = ?
    `).run(
      name || null,
      color || null,
      description !== undefined ? description : null,
      sync_enabled !== undefined ? (sync_enabled ? 1 : 0) : null,
      is_read_only !== undefined ? (is_read_only ? 1 : 0) : null,
      now,
      id,
      req.user!.family_id
    );

    const updated = db.prepare('SELECT * FROM calendars WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/calendars/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cal = db.prepare('SELECT * FROM calendars WHERE id = ? AND family_id = ?').get(
      id,
      req.user!.family_id
    ) as any;

    if (!cal) return res.status(404).json({ error: 'Calendar not found.' });
    if (cal.is_default) {
      return res.status(400).json({ error: 'Cannot delete the default family calendar.' });
    }

    db.prepare('DELETE FROM calendars WHERE id = ? AND family_id = ?').run(id, req.user!.family_id);
    res.json({ success: true, message: 'Calendar deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. EVENTS & RECURRENCE
// ==========================================

router.get('/events', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { start, end, member_id, calendar_id } = req.query as {
      start?: string;
      end?: string;
      member_id?: string;
      calendar_id?: string;
    };

    let query = `
      SELECT e.*, c.name as calendar_name, c.source as calendar_source
      FROM events e
      JOIN calendars c ON e.calendar_id = c.id
      WHERE e.family_id = ?
    `;
    const params: any[] = [req.user!.family_id];

    if (calendar_id) {
      query += ` AND e.calendar_id = ?`;
      params.push(calendar_id);
    }

    query += ` ORDER BY e.start_time ASC`;

    const rawEvents = db.prepare(query).all(...params) as any[];

    // Parse JSON member IDs and handle client filtering
    let events = rawEvents.map((evt) => {
      let assignedMemberIds: string[] = [];
      try {
        assignedMemberIds = JSON.parse(evt.assigned_member_ids || '[]');
      } catch {
        assignedMemberIds = [];
      }
      return {
        ...evt,
        all_day: Boolean(evt.all_day),
        assigned_member_ids: assignedMemberIds,
      };
    });

    if (member_id) {
      events = events.filter((e) => e.assigned_member_ids.includes(member_id));
    }

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/events', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      calendar_id,
      title,
      description,
      location,
      color,
      start_time,
      end_time,
      all_day,
      recurring_rule,
      recurring_until,
      assigned_member_ids,
    } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Title, start time, and end time are required.' });
    }

    // Default to first family calendar if not provided
    let targetCalId = calendar_id;
    if (!targetCalId) {
      const defaultCal = db.prepare('SELECT id FROM calendars WHERE family_id = ? ORDER BY is_default DESC LIMIT 1').get(
        req.user!.family_id
      ) as { id: string } | undefined;
      targetCalId = defaultCal?.id;
    }

    const eventId = 'evt_' + uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    const cal = db.prepare('SELECT * FROM calendars WHERE id = ? AND family_id = ?').get(
      targetCalId,
      req.user!.family_id
    ) as any;

    const eventColor = color || cal?.color || '#FF4FA3';
    const memberIdsJson = JSON.stringify(assigned_member_ids || []);
    const isGoogleCal = cal?.source === 'google';
    const syncStatus = isGoogleCal ? 'pending' : 'local_only';

    db.prepare(`
      INSERT INTO events (
        id, family_id, calendar_id, title, description, location, color,
        start_time, end_time, all_day, recurring_rule, recurring_until,
        assigned_member_ids, sync_status, created_by, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      req.user!.family_id,
      targetCalId,
      title.trim(),
      description || null,
      location || null,
      eventColor,
      start_time,
      end_time,
      all_day ? 1 : 0,
      recurring_rule || 'none',
      recurring_until || null,
      memberIdsJson,
      syncStatus,
      req.user!.id,
      now,
      now
    );

    const created = db.prepare(`
      SELECT e.*, c.name as calendar_name, c.source as calendar_source
      FROM events e
      JOIN calendars c ON e.calendar_id = c.id
      WHERE e.id = ?
    `).get(eventId) as any;

    res.status(201).json({
      ...created,
      all_day: Boolean(created.all_day),
      assigned_member_ids: JSON.parse(created.assigned_member_ids || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/events/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      calendar_id,
      title,
      description,
      location,
      color,
      start_time,
      end_time,
      all_day,
      recurring_rule,
      recurring_until,
      assigned_member_ids,
    } = req.body;

    const existing = db.prepare('SELECT * FROM events WHERE id = ? AND family_id = ?').get(
      id,
      req.user!.family_id
    ) as any;

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const now = new Date().toISOString();
    const targetCalId = calendar_id || existing.calendar_id;
    const cal = db.prepare('SELECT * FROM calendars WHERE id = ?').get(targetCalId) as any;
    const syncStatus = cal?.source === 'google' ? 'pending' : existing.sync_status;

    db.prepare(`
      UPDATE events
      SET calendar_id = ?,
          title = COALESCE(?, title),
          description = ?,
          location = ?,
          color = COALESCE(?, color),
          start_time = COALESCE(?, start_time),
          end_time = COALESCE(?, end_time),
          all_day = ?,
          recurring_rule = COALESCE(?, recurring_rule),
          recurring_until = ?,
          assigned_member_ids = ?,
          sync_status = ?,
          updated_at = ?
      WHERE id = ? AND family_id = ?
    `).run(
      targetCalId,
      title || null,
      description !== undefined ? description : existing.description,
      location !== undefined ? location : existing.location,
      color || null,
      start_time || null,
      end_time || null,
      all_day !== undefined ? (all_day ? 1 : 0) : existing.all_day,
      recurring_rule || null,
      recurring_until !== undefined ? recurring_until : existing.recurring_until,
      assigned_member_ids ? JSON.stringify(assigned_member_ids) : existing.assigned_member_ids,
      syncStatus,
      now,
      id,
      req.user!.family_id
    );

    const updated = db.prepare(`
      SELECT e.*, c.name as calendar_name, c.source as calendar_source
      FROM events e
      JOIN calendars c ON e.calendar_id = c.id
      WHERE e.id = ?
    `).get(id) as any;

    res.json({
      ...updated,
      all_day: Boolean(updated.all_day),
      assigned_member_ids: JSON.parse(updated.assigned_member_ids || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/events/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM events WHERE id = ? AND family_id = ?').get(
      id,
      req.user!.family_id
    ) as any;

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // If linked to Google, we can mark for remote deletion or remove immediately
    db.prepare('DELETE FROM events WHERE id = ? AND family_id = ?').run(id, req.user!.family_id);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. TASKS & TO-DOS
// ==========================================

router.get('/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const tasks = db.prepare(`
      SELECT t.*, m.name as member_name, m.color as member_color, m.avatar_url as member_avatar
      FROM tasks t
      LEFT JOIN family_members m ON t.assigned_member_id = m.id
      WHERE t.family_id = ?
      ORDER BY t.completed ASC, t.due_date ASC, t.created_at DESC
    `).all(req.user!.family_id);

    res.json(tasks.map((t: any) => ({ ...t, completed: Boolean(t.completed) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tasks', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { title, description, due_date, due_time, assigned_member_id, priority } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const taskId = 'tsk_' + uuidv4().slice(0, 8);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tasks (id, family_id, title, description, due_date, due_time, completed, assigned_member_id, priority, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `).run(
      taskId,
      req.user!.family_id,
      title.trim(),
      description || null,
      due_date || null,
      due_time || null,
      assigned_member_id || null,
      priority || 'medium',
      now,
      now
    );

    const created = db.prepare(`
      SELECT t.*, m.name as member_name, m.color as member_color, m.avatar_url as member_avatar
      FROM tasks t
      LEFT JOIN family_members m ON t.assigned_member_id = m.id
      WHERE t.id = ?
    `).get(taskId) as any;

    res.status(201).json({ ...created, completed: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tasks/:id/toggle', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND family_id = ?').get(
      id,
      req.user!.family_id
    ) as any;

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const newCompleted = task.completed ? 0 : 1;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks
      SET completed = ?, completed_at = ?, updated_at = ?
      WHERE id = ? AND family_id = ?
    `).run(newCompleted, newCompleted ? now : null, now, id, req.user!.family_id);

    const updated = db.prepare(`
      SELECT t.*, m.name as member_name, m.color as member_color, m.avatar_url as member_avatar
      FROM tasks t
      LEFT JOIN family_members m ON t.assigned_member_id = m.id
      WHERE t.id = ?
    `).get(id) as any;

    res.json({ ...updated, completed: Boolean(updated.completed) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tasks/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ? AND family_id = ?').run(id, req.user!.family_id);
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. BIRTHDAYS
// ==========================================

router.get('/birthdays', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const members = db.prepare(`
      SELECT id, name, role, color, avatar_url, birthday
      FROM family_members
      WHERE family_id = ? AND is_active = 1 AND birthday IS NOT NULL AND birthday != ''
    `).all(req.user!.family_id) as Array<{
      id: string;
      name: string;
      role: string;
      color: string;
      avatar_url: string;
      birthday: string;
    }>;

    const today = new Date();
    const currentYear = today.getFullYear();

    const birthdays = members.map((m) => {
      const bDate = new Date(m.birthday);
      const birthMonth = bDate.getMonth();
      const birthDay = bDate.getDate();

      let nextBirthday = new Date(currentYear, birthMonth, birthDay);
      if (nextBirthday.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
        nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
      }

      const diffTime = nextBirthday.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const turningAge = nextBirthday.getFullYear() - bDate.getFullYear();

      return {
        member_id: m.id,
        name: m.name,
        role: m.role,
        color: m.color,
        avatar_url: m.avatar_url,
        birthday: m.birthday,
        next_birthday_date: nextBirthday.toISOString().slice(0, 10),
        days_until: daysUntil,
        turning_age: turningAge > 0 ? turningAge : undefined,
      };
    });

    birthdays.sort((a, b) => a.days_until - b.days_until);
    res.json(birthdays);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. GOOGLE CALENDAR INTEGRATION
// ==========================================

router.get('/calendar/google/config', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const config = getGoogleConfig();
    const accounts = db.prepare(`
      SELECT id, google_email, sync_status, sync_error, last_synced_at, created_at
      FROM google_accounts
      WHERE family_id = ?
    `).all(req.user!.family_id);

    res.json({
      isConfigured: config.isConfigured,
      redirectUri: config.redirectUri,
      hasClientId: Boolean(config.clientId),
      connectedAccounts: accounts,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get(['/calendar/google/auth-url', '/calendar/google/auth'], authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { url, state } = generateAuthUrl(req.user!.id, req.user!.family_id);
    
    // If request accepts json
    if (req.headers.accept?.includes('application/json') || req.query.json === 'true') {
      return res.json({ url, state });
    }
    
    res.redirect(url);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/calendar/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query as { code?: string; state?: string; error?: string };

    if (error) {
      return res.redirect('/#integrations?sync_error=' + encodeURIComponent(error));
    }
    if (!code || !state) {
      return res.status(400).send('Missing authorization code or state token.');
    }

    const result = await handleOAuthCallback(code, state);
    res.redirect('/#integrations?sync_ok=1&account=' + encodeURIComponent(result.googleEmail));
  } catch (err: any) {
    res.redirect('/#integrations?sync_error=' + encodeURIComponent(err.message));
  }
});

router.get('/calendar/google/accounts', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const accounts = db.prepare(`
      SELECT id, google_email, sync_status, sync_error, last_synced_at, created_at
      FROM google_accounts
      WHERE family_id = ?
    `).all(req.user!.family_id);

    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/calendar/google/discover', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { account_id } = req.body;
    const account = db.prepare('SELECT id FROM google_accounts WHERE family_id = ? AND (id = ? OR ? IS NULL) LIMIT 1').get(
      req.user!.family_id,
      account_id || null,
      account_id || null
    ) as { id: string } | undefined;

    if (!account) {
      return res.status(404).json({ error: 'No connected Google account found.' });
    }

    const calendars = await discoverGoogleCalendars(req.user!.family_id, account.id);
    res.json({ success: true, count: calendars.length, calendars });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/calendar/google/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { account_id } = req.body;
    const account = db.prepare('SELECT id FROM google_accounts WHERE family_id = ? AND (id = ? OR ? IS NULL) LIMIT 1').get(
      req.user!.family_id,
      account_id || null,
      account_id || null
    ) as { id: string } | undefined;

    if (!account) {
      return res.status(404).json({ error: 'No connected Google account found. Please connect Google Calendar first.' });
    }

    const outcome = await syncTwoWay(req.user!.family_id, account.id);
    res.json(outcome);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/calendar/google/disconnect', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { account_id } = req.body;
    const result = disconnectGoogle(req.user!.family_id, account_id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/calendar/google/logs', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM google_sync_logs
      WHERE family_id = ?
      ORDER BY created_at DESC
      LIMIT 25
    `).all(req.user!.family_id);

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. SYSTEM STATS & BACKUP EXPORT
// ==========================================

router.get('/system/stats', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const familyId = req.user!.family_id;
    const memberCount = (db.prepare('SELECT COUNT(*) as c FROM family_members WHERE family_id = ?').get(familyId) as any).c;
    const eventCount = (db.prepare('SELECT COUNT(*) as c FROM events WHERE family_id = ?').get(familyId) as any).c;
    const taskCount = (db.prepare('SELECT COUNT(*) as c FROM tasks WHERE family_id = ?').get(familyId) as any).c;
    const calCount = (db.prepare('SELECT COUNT(*) as c FROM calendars WHERE family_id = ?').get(familyId) as any).c;
    const gAccount = db.prepare('SELECT google_email, sync_status, last_synced_at FROM google_accounts WHERE family_id = ?').get(familyId) as any;

    res.json({
      status: 'healthy',
      version: '1.0.0',
      familyId,
      members: memberCount,
      events: eventCount,
      tasks: taskCount,
      calendars: calCount,
      googleSync: gAccount || { sync_status: 'not_connected' },
      serverTime: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/backup/export', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const familyId = req.user!.family_id;
    const family = db.prepare('SELECT * FROM families WHERE id = ?').get(familyId);
    const members = db.prepare('SELECT * FROM family_members WHERE family_id = ?').all(familyId);
    const calendars = db.prepare('SELECT * FROM calendars WHERE family_id = ?').all(familyId);
    const events = db.prepare('SELECT * FROM events WHERE family_id = ?').all(familyId);
    const tasks = db.prepare('SELECT * FROM tasks WHERE family_id = ?').all(familyId);

    const exportData = {
      app: 'Yimly FamilyCal',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      family,
      members,
      calendars,
      events,
      tasks,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="yimly_familycal_backup_${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(exportData, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
