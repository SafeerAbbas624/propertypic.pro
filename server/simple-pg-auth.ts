import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction, Router } from 'express';

export interface PgAuthOptions {
  connectionString?: string;
}

export function createPgPool(): Pool {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL ||
    'postgres://postgres:postgres@localhost:5432/mediavault';
  const pool = new Pool({ connectionString });
  return pool;
}

export async function ensureSchema(pool: Pool) {
  // Use a dedicated table for login-only auth to avoid conflicts with existing "users" schemas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure columns exist (idempotent)
  await pool.query(`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
  await pool.query(`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS password VARCHAR(255);`);
  await pool.query(`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'User';`);
  await pool.query(`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
  await pool.query(`ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

  // Unique index on email (idempotent)
  try {
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS auth_users_email_key ON auth_users (email);`);
  } catch {}

  await pool.query(`UPDATE auth_users SET name = COALESCE(name, 'User');`);
}

export async function ensureDefaultAdmin(pool: Pool) {
  const email = 'stads98@gmail.com';
  const password = 'Bigapples1!';
  const name = 'Admin';
  const { rows } = await pool.query('SELECT id FROM auth_users WHERE email=$1', [email]);
  if (rows.length === 0) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO auth_users (email, password, name) VALUES ($1, $2, $3)',
      [email, hash, name]
    );
    console.log('Default admin user created:', email);
  }
}

export function pgAuthRouter(pool: Pool) {
  const router = Router();

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      const { rows } = await pool.query('SELECT id, email, password, name FROM auth_users WHERE email=$1', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      // set a very simple session cookie
      (req.session as any).user = { id: user.id, email: user.email, name: user.name };
      return res.json({ message: 'Login successful', user: (req.session as any).user });
    } catch (e) {
      console.error('Login error', e);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {});
    res.json({ message: 'Logged out' });
  });

  // Current session user
  router.get('/me', (req: Request, res: Response) => {
    const user = (req.session as any)?.user;
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user });
  });

  return router;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).user) return next();
  return res.status(401).json({ message: 'Not authenticated' });
}

