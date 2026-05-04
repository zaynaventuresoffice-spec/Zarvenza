import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import pool, { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function genOrderNumber() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZRV-${ts}-${rand}`;
}

const MSG = {
  awaiting: 'Razorpay payment session created. Waiting for payment confirmation.',
  confirmed: 'Payment received! Your order is confirmed and being prepared.',
};

// ── POST /api/payment/create-razorpay-order ──────────────────────
router.post('/create-razorpay-order', requireAuth, async (req, res) => {
  const { items, address, subtotal, shipping, total } = req.body;

  if (!items?.length)       return res.status(400).json({ error: 'Cart is empty' });
  if (!address?.line1)      return res.status(400).json({ error: 'Delivery address is required' });
  if (!total || total <= 0) return res.status(400).json({ error: 'Invalid order total' });

  const amountPaise = Math.round(total * 100);

  try {
    // 1. Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes:    { customer_name: req.user.name, customer_email: req.user.email },
    });

    // 2. Save pending order in Postgres — use transaction so items + tracking are atomic
    const orderNumber = genOrderNumber();
    const addrLine    = [address.line1, address.line2, address.city, address.state, address.zip, address.country]
      .filter(Boolean).join(', ');

    const client = await pool.connect();
    let orderId;

    try {
      await client.query('BEGIN');

      const { rows: orderRows } = await client.query(
        `INSERT INTO orders
           (order_number, user_id, subtotal, shipping, total,
            status, payment_method, payment_status, razorpay_order_id, notes)
         VALUES ($1,$2,$3,$4,$5,'awaiting_payment','razorpay','pending',$6,$7)
         RETURNING id`,
        [orderNumber, req.user.id, subtotal, shipping, total, rzpOrder.id, addrLine]
      );
      orderId = orderRows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, name, price, qty, image_url)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [orderId, item.id, item.name, item.price, item.qty, item.images?.[0] ?? null]
        );
      }

      await client.query(
        `INSERT INTO order_tracking (order_id, status, message) VALUES ($1,'awaiting_payment',$2)`,
        [orderId, MSG.awaiting]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // 3. Return everything the frontend Razorpay modal needs
    res.status(201).json({
      razorpayOrderId: rzpOrder.id,
      orderId,
      orderNumber,
      amount:   amountPaise,
      currency: 'INR',
      keyId:    process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('[Razorpay] create-order error:', err.message);
    res.status(502).json({ error: 'Could not initiate payment. Please try again.' });
  }
});

// ── POST /api/payment/verify ─────────────────────────────────────
router.post('/verify', requireAuth, async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId)
    return res.status(400).json({ error: 'Missing payment verification fields' });

  // Signature verification — Razorpay signs: HMAC(order_id|payment_id, key_secret)
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSig !== razorpaySignature) {
    console.warn('[Razorpay] Signature mismatch for orderId', orderId);
    return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
  }

  try {
    const { rows } = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND razorpay_order_id = $3`,
      [orderId, req.user.id, razorpayOrderId]
    );
    if (!rows.length)
      return res.status(404).json({ error: 'Order not found or does not belong to you' });

    const order = rows[0];

    // Idempotent — already confirmed (e.g. webhook fired first)
    if (order.payment_status === 'paid')
      return res.json({ success: true, orderNumber: order.order_number, orderId: order.id });

    // Atomic update
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE orders
         SET payment_status      = 'paid',
             status              = 'confirmed',
             razorpay_payment_id = $1,
             razorpay_signature  = $2,
             updated_at          = NOW()
         WHERE id = $3`,
        [razorpayPaymentId, razorpaySignature, order.id]
      );

      await client.query(
        `INSERT INTO order_tracking (order_id, status, message) VALUES ($1,'confirmed',$2)`,
        [order.id, MSG.confirmed]
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    console.log(`[Order] ✅ Confirmed — ${order.order_number} | Razorpay: ${razorpayPaymentId}`);
    res.json({ success: true, orderNumber: order.order_number, orderId: order.id });

  } catch (err) {
    console.error('[Razorpay] verify error:', err.message);
    res.status(500).json({ error: 'Verification failed. Please contact support.' });
  }
});

// ── POST /api/payment/webhook ────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  if (webhookSecret) {
    const receivedSig = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)   // raw Buffer — registered with express.raw() in server.js
      .digest('hex');

    if (receivedSig !== expectedSig) {
      console.warn('[Webhook] Signature mismatch');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.log(`[Webhook] Event: ${event.event}`);

  if (event.event === 'payment.captured') {
    const { order_id: rzpOrdId, id: rzpPayId } = event.payload.payment.entity;
    try {
      const { rows } = await db.query(
        `SELECT * FROM orders WHERE razorpay_order_id = $1`, [rzpOrdId]
      );
      if (!rows.length) return res.json({ received: true });

      const order = rows[0];
      if (order.payment_status !== 'paid') {
        await db.query(
          `UPDATE orders SET payment_status='paid', status='confirmed',
           razorpay_payment_id=$1, updated_at=NOW() WHERE id=$2`,
          [rzpPayId, order.id]
        );
        await db.query(
          `INSERT INTO order_tracking (order_id, status, message) VALUES ($1,'confirmed',$2)`,
          [order.id, MSG.confirmed]
        );
        console.log(`[Webhook] ✅ Order ${order.order_number} confirmed`);
      }
    } catch (err) {
      console.error('[Webhook] payment.captured error:', err.message);
    }
  }

  if (event.event === 'payment.failed') {
    const { order_id: rzpOrdId, error_description } = event.payload.payment.entity;
    try {
      const { rows } = await db.query(
        `SELECT * FROM orders WHERE razorpay_order_id = $1`, [rzpOrdId]
      );
      if (rows.length && rows[0].payment_status === 'pending') {
        const order = rows[0];
        await db.query(
          `UPDATE orders SET status='payment_failed', updated_at=NOW() WHERE id=$1`, [order.id]
        );
        await db.query(
          `INSERT INTO order_tracking (order_id, status, message) VALUES ($1,'payment_failed',$2)`,
          [order.id, `Payment failed: ${error_description || 'Unknown error'}`]
        );
        console.log(`[Webhook] ❌ Payment failed for order ${order.order_number}`);
      }
    } catch (err) {
      console.error('[Webhook] payment.failed error:', err.message);
    }
  }

  res.json({ received: true });
});

export default router;
