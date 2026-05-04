import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { runMigrations } from './db.js';
import authRoutes    from './routes/auth.js';
import orderRoutes   from './routes/orders.js';
import paymentRoutes from './routes/payment.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://zarvenza.vercel.app'
    ,
  ].filter(Boolean),
  credentials: true,
}));

// ── Raw body for Razorpay webhook (MUST be before express.json) ──
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// ── JSON body for all other routes ───────────────────────────────
app.use(express.json({ limit: '2mb' }));

// ── Request logger ───────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/payment', paymentRoutes);

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'Zarvenza API v2' })
);

// ── 404 ──────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Boot: run migrations then start listening ─────────────────────
runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🌸 Zarvenza API    →  http://localhost:${PORT}`);
      console.log(`   Health          →  http://localhost:${PORT}/api/health`);
      console.log(`   Razorpay key    →  All set`);
      console.log(`   DB              →  ${process.env.DATABASE_URL ? '✅ Connected' : '⚠ DATABASE_URL not set'}\n`);
    });
  })
  .catch((err) => {
    console.error('[Boot] ❌ Migration failed:', err.message);
    process.exit(1);
  });
