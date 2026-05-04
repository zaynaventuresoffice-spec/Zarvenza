import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Generate order number
function genOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZRV-${ts}-${rand}`;
}

// Status label map for tracking events
const STATUS_MESSAGES = {
  awaiting_payment: 'Your order has been placed and is awaiting payment.',
  pending:          'Your order has been placed and is awaiting payment confirmation.',
  confirmed:        'Payment confirmed! Your order has been accepted and is being prepared.',
  processing:       'Our team is carefully packaging your luxury items.',
  shipped:          'Your order is on its way! Tracking details will be sent to your email.',
  delivered:        'Your order has been delivered. We hope you love your Zarvenza experience!',
  cancelled:        'Your order has been cancelled. Any payment will be refunded within 5-7 business days.',
};

// ── POST /api/orders ─────────────────────────────────────────────
router.post('/', requireAuth, (req, res) => {
  const { items, address, subtotal, shipping, total, paymentMethod, upiRef, notes } = req.body;

  if (!items?.length) return res.status(400).json({ error: 'Order must have at least one item' });
  if (!address) return res.status(400).json({ error: 'Delivery address is required' });

  const orderNumber = genOrderNumber();

  // Save address snapshot inline
  const addrLine = `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} ${address.zip}, ${address.country}`;

  // Insert order
  const orderResult = db.prepare(`
    INSERT INTO orders (order_number, user_id, subtotal, shipping, total, status, payment_method, payment_status, upi_ref, notes)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, 'pending', ?, ?)
  `).run(orderNumber, req.user.id, subtotal, shipping, total, paymentMethod || 'gpay', upiRef || null, addrLine);

  const orderId = orderResult.lastInsertRowid;

  // Insert items
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, name, price, qty, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const item of items) {
    insertItem.run(orderId, item.id, item.name, item.price, item.qty, item.images?.[0] || null);
  }

  // Insert initial tracking event
  db.prepare(`
    INSERT INTO order_tracking (order_id, status, message)
    VALUES (?, 'pending', ?)
  `).run(orderId, STATUS_MESSAGES.pending);

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json({ order, orderNumber });
});

// ── GET /api/orders ──────────────────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, 
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);

  res.json(orders);
});

// ── GET /api/orders/track/:orderNumber ───────────────────────────
// NOTE: must be registered BEFORE /:id so Express doesn't swallow it
router.get('/track/:orderNumber', requireAuth, (req, res) => {
  const order = db.prepare(`
    SELECT * FROM orders WHERE order_number = ? AND user_id = ?
  `).get(req.params.orderNumber, req.user.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const tracking = db.prepare('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

  res.json({ ...order, items, tracking });
});

// ── GET /api/orders/:id ──────────────────────────────────────────
router.get('/:id', requireAuth, (req, res) => {
  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const tracking = db.prepare('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

  res.json({ ...order, items, tracking });
});

// ── PUT /api/orders/:id/confirm-payment ──────────────────────────
router.put('/:id/confirm-payment', requireAuth, (req, res) => {
  const { upiRef } = req.body;

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.payment_status === 'paid') return res.status(400).json({ error: 'Payment already confirmed' });

  db.prepare(`
    UPDATE orders SET payment_status = 'paid', status = 'confirmed', upi_ref = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(upiRef || null, order.id);

  db.prepare(`
    INSERT INTO order_tracking (order_id, status, message)
    VALUES (?, 'confirmed', ?)
  `).run(order.id, STATUS_MESSAGES.confirmed);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
  const tracking = db.prepare('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

  res.json({ ...updated, tracking });
});

// ── PUT /api/orders/:id/cancel ───────────────────────────────────
router.put('/:id/cancel', requireAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
    return res.status(400).json({ error: `Cannot cancel an order that is ${order.status}` });
  }

  db.prepare(`UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(order.id);
  db.prepare(`INSERT INTO order_tracking (order_id, status, message) VALUES (?, 'cancelled', ?)`).run(order.id, STATUS_MESSAGES.cancelled);

  res.json({ success: true });
});

export default router;
