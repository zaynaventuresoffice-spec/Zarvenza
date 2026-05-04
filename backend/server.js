import express from 'express';
import cors from 'cors';
import authRoutes    from './routes/auth.js';
import orderRoutes   from './routes/orders.js';
import paymentRoutes from './routes/payment.js';
import dotenv from 'dotenv';

dotenv.config();

const app  = express();
const PORT = process.env.PORT ;

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// ── Raw body for Razorpay webhook (BEFORE express.json) ──────────
// Razorpay HMAC verification needs raw Buffer, not parsed JSON
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// ── JSON body for everything else ────────────────────────────────
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

// ── Health ───────────────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'Zarvenza API v2' })
);

// ── 404 ──────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🌸 Zarvenza API  →  http://localhost:${PORT}`);
  console.log(`   Health        →  http://localhost:${PORT}/api/health`);
  // console.log(`   Razorpay key  →  \n`);
});
