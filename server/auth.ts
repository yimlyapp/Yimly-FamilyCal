import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const JWT_SECRET = process.env.SESSION_SECRET || 'yimly-familycal-super-secret-key-2026';
const TOKEN_COOKIE_NAME = 'yimly_token';

export interface AuthUser {
  id: string;
  family_id: string;
  email: string;
  name: string;
  role: 'administrator' | 'adult' | 'child';
  avatar_url?: string;
  color?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      family_id: user.family_id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      color: user.color,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // Check Cookie
  if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
    token = req.cookies[TOKEN_COOKIE_NAME];
  }

  // Check Authorization Header
  const authHeader = req.headers['authorization'];
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    // Verify user still exists in database
    const user = db.prepare('SELECT id, family_id, email, name, role, avatar_url, color FROM users WHERE id = ?').get(decoded.id) as unknown as AuthUser | undefined;
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists', code: 401 });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token', code: 401 });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required', code: 401 });
  }
  if (req.user.role !== 'administrator') {
    return res.status(403).json({ error: 'Administrator access required', code: 403 });
  }
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;
  if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
    token = req.cookies[TOKEN_COOKIE_NAME];
  }
  const authHeader = req.headers['authorization'];
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      const user = db.prepare('SELECT id, family_id, email, name, role, avatar_url, color FROM users WHERE id = ?').get(decoded.id) as unknown as AuthUser | undefined;
      if (user) {
        req.user = user;
      }
    } catch {
      // ignore
    }
  }
  next();
}

export { TOKEN_COOKIE_NAME };
