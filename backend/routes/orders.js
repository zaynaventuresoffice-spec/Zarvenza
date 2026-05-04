import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function genOrderNumber() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZRV-${ts}-${rand}`;
}

const STATUS_MESSAGES = {
  awaiting_payment: 'Your order has been placed and is awaiting payment.',
  pending:          'Your order has been placed and is awaiting payment confirmation.',
  confirmed:        'Payment confirmed! Your order has been accepted and is being prepared.',
  processing:       'Our team is carefully packaging your luxury items.',
  shipped:          'Your order is on its way! Tracking details will be sent to your email.',
  delivered:        'Your order has been delivered. We hope you love your Zarvenza experience!',
  cancelled:        'Your order has been cancelled. Any payment will be refunded within 5–7 business days.',
};

// ── GET /api/orders ──────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT o.*,
         (SELECT COUNT(*) FROM order_items WHERE order_id = o.id)::int AS item_count
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Orders] list error:', err.message);
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// ── GET /api/orders/track/:orderNumber ───────────────────────────
// Must be before /:id so Express doesn't swallow it
router.get('/track/:orderNumber', requireAuth, async (req, res) => {
  try {
    const { rows: orderRows } = await db.query(
      `SELECT * FROM orders WHERE order_number = $1 AND user_id = $2`,
      [req.params.orderNumber, req.user.id]
    );
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderRows[0];
    const { rows: items }    = await db.query('SELECT * FROM order_items    WHERE order_id = $1', [order.id]);
    const { rows: tracking } = await db.query('SELECT * FROM order_tracking WHERE order_id = $1 ORDER BY created_at ASC', [order.id]);

    res.json({ ...order, items, tracking });
  } catch (err) {
    console.error('[Orders] track error:', err.message);
    res.status(500).json({ error: 'Could not track order' });
  }
});

// ── GET /api/orders/:id ──────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows: orderRows } = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!orderRows.length) return res.status(404).json({ error: 'Order not found' });

    const order = orderRows[0];
    const { rows: items }    = await db.query('SELECT * FROM order_items    WHERE order_id = $1', [order.id]);
    const { rows: tracking } = await db.query('SELECT * FROM order_tracking WHERE order_id = $1 ORDER BY created_at ASC', [order.id]);

    res.json({ ...order, items, tracking });
  } catch (err) {
    console.error('[Orders] detail error:', err.message);
    res.status(500).json({ error: 'Could not fetch order' });
  }
});

// ── PUT /api/orders/:id/cancel ───────────────────────────────────
router.put('/:id/cancel', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Order not found' });

    const order = rows[0];
    if (['shipped', 'delivered', 'cancelled'].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel an order that is ${order.status}` });

    await db.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [order.id]
    );
    await db.query(
      `INSERT INTO order_tracking (order_id, status, message) VALUES ($1, 'cancelled', $2)`,
      [order.id, STATUS_MESSAGES.cancelled]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[Orders] cancel error:', err.message);
    res.status(500).json({ error: 'Could not cancel order' });
  }
});

export default router;
