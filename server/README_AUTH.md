Simple PostgreSQL Auth (Login-Only)

Tables
- auth_users(id serial pk, email unique, password, name, created_at, updated_at)

Behavior
- On server start, table is created/altered if needed
- Default admin auto-created: stads98@gmail.com / Bigapples1!
- POST /api/auth/login -> sets session, returns user
- POST /api/auth/logout -> clears session

Env
- DATABASE_URL=postgres://USER:PASS@HOST:5432/mediavault
- SESSION_SECRET=your-random-secret

Install deps
- npm install pg bcryptjs

