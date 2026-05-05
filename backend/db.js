import pg from 'pg';

const { Pool } = pg;

// ── Connection pool ───────────────────────────────────────────────
// Supabase gives you a DATABASE_URL in this format:
//   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }   // required for Supabase / Railway / Render
    : false,                          // no SSL in local dev
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// ── Convenience query helper ─────────────────────────────────────
// Usage:  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id])
export const db = {
  query: (text, params) => pool.query(text, params),
};

// ── Schema migration (runs on every startup, idempotent) ─────────
export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT        NOT NULL,
      email      TEXT        NOT NULL UNIQUE,
      password   TEXT        NOT NULL,
      role       TEXT        NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label      TEXT        NOT NULL DEFAULT 'Home',
      line1      TEXT        NOT NULL,
      line2      TEXT,
      city       TEXT        NOT NULL,
      state      TEXT        NOT NULL,
      zip        TEXT        NOT NULL,
      country    TEXT        NOT NULL DEFAULT 'India',
      is_default BOOLEAN     NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id                  SERIAL PRIMARY KEY,
      order_number        TEXT        NOT NULL UNIQUE,
      user_id             INTEGER     NOT NULL REFERENCES users(id),
      address_id          INTEGER     REFERENCES addresses(id),
      subtotal            NUMERIC(10,2) NOT NULL,
      shipping            NUMERIC(10,2) NOT NULL DEFAULT 0,
      total               NUMERIC(10,2) NOT NULL,
      status              TEXT        NOT NULL DEFAULT 'pending',
      payment_method      TEXT        NOT NULL DEFAULT 'razorpay',
      payment_status      TEXT        NOT NULL DEFAULT 'pending',
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature  TEXT,
      notes               TEXT,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         SERIAL PRIMARY KEY,
      order_id   INTEGER       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER       NOT NULL,
      name       TEXT          NOT NULL,
      price      NUMERIC(10,2) NOT NULL,
      qty        INTEGER       NOT NULL,
      image_url  TEXT
    );

    CREATE TABLE IF NOT EXISTS order_tracking (
      id         SERIAL PRIMARY KEY,
      order_id   INTEGER     NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status     TEXT        NOT NULL,
      message    TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id             SERIAL PRIMARY KEY,
      user_id        INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id     INTEGER       NOT NULL,
      name           TEXT,
      price          NUMERIC(10,2),
      image_url      TEXT,
      category       TEXT,
      original_price NUMERIC(10,2),
      badge          TEXT,
      rating         NUMERIC(3,1),
      reviews        INTEGER,
      images         TEXT,
      added_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS cart (
      id             SERIAL PRIMARY KEY,
      user_id        INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id     INTEGER       NOT NULL,
      name           TEXT,
      price          NUMERIC(10,2),
      qty            INTEGER       NOT NULL DEFAULT 1,
      image_url      TEXT,
      category       TEXT,
      original_price NUMERIC(10,2),
      badge          TEXT,
      rating         NUMERIC(3,1),
      reviews        INTEGER,
      images         TEXT,
      added_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
  `);

  console.log('[DB] ✅ Migrations complete');
}

export default pool;
