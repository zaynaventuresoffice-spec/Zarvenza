import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// ── POST /api/auth/signup ────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Invalid email address' });

  try {
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]
    );
    if (existing.rows.length)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name.trim(), email.trim().toLowerCase(), hash]
    );

    const user  = rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });

  } catch (err) {
    console.error('[Auth] signup error:', err.message);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]
    );
    if (!rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const row   = rows[0];
    const match = await bcrypt.compare(password, row.password);
    if (!match)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user  = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = signToken(user);
    res.json({ token, user });

  } catch (err) {
    console.error('[Auth] login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// ── PUT /api/auth/profile ────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });

    const row     = rows[0];
    const updates = {};

    if (name?.trim()) updates.name = name.trim();

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: 'Current password required' });
      const match = await bcrypt.compare(currentPassword, row.password);
      if (!match)
        return res.status(401).json({ error: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    if (!Object.keys(updates).length)
      return res.status(400).json({ error: 'No changes to update' });

    const keys   = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

    const { rows: updated } = await db.query(
      `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}
       RETURNING id, name, email, role`,
      [...values, req.user.id]
    );
    res.json({ user: updated[0] });

  } catch (err) {
    console.error('[Auth] profile update error:', err.message);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

export default router;
