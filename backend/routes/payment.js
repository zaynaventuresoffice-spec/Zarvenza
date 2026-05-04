import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_XXXXXXXXXXXXXXXX',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX',
});

function genOrderNumber() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ZRV-${ts}-${rand}`;
}

const STATUS_MESSAGES = {
  pending:    'Your order has been placed and is awaiting payment.',
  confirmed:  'Payment received! Your order is confirmed and being prepared.',
  processing: 'Our team is carefully packaging your luxury items.',
  shipped:    'Your order is on its way! You will receive tracking details soon.',
  delivered:  'Your order has been delivered. Enjoy your Zarvenza experience!',
  cancelled:  'Your order has been cancelled. Refunds process within 5–7 business days.',
};

router.post('/create-razorpay-order', requireAuth, async (req, res) => {
  const { items, address, subtotal, shipping, total, notes } = req.body;

  if (!items?.length)  return res.status(400).json({ error: 'Cart is empty' });
  if (!address?.line1) return res.status(400).json({ error: 'Delivery address is required' });
  if (!total || total <= 0) return res.status(400).json({ error: 'Invalid order total' });

  const amountPaise = Math.round(total * 100);

  try {
    const rzpOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
      notes: {
        customer_name:  req.user.name,
        customer_email: req.user.email,
      },
    });

    const orderNumber = genOrderNumber();
    const addrLine = [address.line1, address.line2, address.city, address.state, address.zip, address.country]
      .filter(Boolean).join(', ');

    const insertOrder = db.prepare(`
      INSERT INTO orders
        (order_number, user_id, subtotal, shipping, total,
         status, payment_method, payment_status, razorpay_order_id, notes)
      VALUES (?, ?, ?, ?, ?, 'awaiting_payment', 'razorpay', 'pending', ?, ?)
    `);

    const { lastInsertRowid: orderId } = insertOrder.run(
      orderNumber, req.user.id, subtotal, shipping, total,
      rzpOrder.id, addrLine
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, name, price, qty, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(orderId, item.id, item.name, item.price, item.qty, item.images?.[0] ?? null);
    }

    db.prepare(`
      INSERT INTO order_tracking (order_id, status, message) VALUES (?, 'awaiting_payment', ?)
    `).run(orderId, 'Razorpay payment session created. Waiting for payment confirmation.');

    res.status(201).json({
      razorpayOrderId: rzpOrder.id,
      orderId,          
      orderNumber,
      amount:           amountPaise,
      currency:         'INR',
      keyId:            process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX',
    });

  } catch (err) {
    console.error('[Razorpay] create-order error:', err);
    res.status(502).json({ error: 'Could not initiate payment. Please try again.' });
  }
});


router.post('/verify', requireAuth, (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }


  const secret = process.env.RAZORPAY_KEY_SECRET || 'XXXXXXXXXXXXXXXXXXXXXXXX';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSig !== razorpaySignature) {
    console.warn('[Razorpay] Signature mismatch for order', orderId);
    return res.status(400).json({ error: 'Payment verification failed. Signature mismatch.' });
  }

  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ? AND user_id = ? AND razorpay_order_id = ?
  `).get(orderId, req.user.id, razorpayOrderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found or does not belong to you' });
  }

  if (order.payment_status === 'paid') {
    return res.json({ success: true, orderNumber: order.order_number, alreadyConfirmed: true });
  }

  db.transaction(() => {
    db.prepare(`
      UPDATE orders
      SET payment_status      = 'paid',
          status              = 'confirmed',
          razorpay_payment_id = ?,
          razorpay_signature  = ?,
          updated_at          = datetime('now')
      WHERE id = ?
    `).run(razorpayPaymentId, razorpaySignature, order.id);

    db.prepare(`
      INSERT INTO order_tracking (order_id, status, message) VALUES (?, 'confirmed', ?)
    `).run(order.id, STATUS_MESSAGES.confirmed);
  })();

  console.log(`[Order] ✅ Confirmed — ${order.order_number} | Razorpay: ${razorpayPaymentId}`);

  res.json({
    success:     true,
    orderNumber: order.order_number,
    orderId:     order.id,
  });
});

router.post('/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  if (webhookSecret) {
    const receivedSig = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body) 
      .digest('hex');

    if (receivedSig !== expectedSig) {
      console.warn('[Webhook] Signature mismatch — ignoring');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log(`[Webhook] Event: ${event.event}`);

  if (event.event === 'payment.captured') {
    const payment  = event.payload.payment.entity;
    const rzpOrdId = payment.order_id;
    const rzpPayId = payment.id;

    const order = db.prepare(`
      SELECT * FROM orders WHERE razorpay_order_id = ?
    `).get(rzpOrdId);

    if (!order) {
      console.warn('[Webhook] No order found for razorpay_order_id:', rzpOrdId);
      return res.json({ received: true }); 
    }

    if (order.payment_status !== 'paid') {
      db.transaction(() => {
        db.prepare(`
          UPDATE orders
          SET payment_status      = 'paid',
              status              = 'confirmed',
              razorpay_payment_id = ?,
              updated_at          = datetime('now')
          WHERE id = ?
        `).run(rzpPayId, order.id);

        db.prepare(`
          INSERT INTO order_tracking (order_id, status, message) VALUES (?, 'confirmed', ?)
        `).run(order.id, STATUS_MESSAGES.confirmed);
      })();

      console.log(`[Webhook] ✅ Order ${order.order_number} confirmed via webhook`);
    }
  }

  if (event.event === 'payment.failed') {
    const payment  = event.payload.payment.entity;
    const rzpOrdId = payment.order_id;

    const order = db.prepare(`SELECT * FROM orders WHERE razorpay_order_id = ?`).get(rzpOrdId);
    if (order && order.payment_status === 'pending') {
      db.prepare(`
        UPDATE orders SET status = 'payment_failed', updated_at = datetime('now') WHERE id = ?
      `).run(order.id);
      db.prepare(`
        INSERT INTO order_tracking (order_id, status, message) VALUES (?, 'payment_failed', ?)
      `).run(order.id, `Payment failed: ${payment.error_description || 'Unknown error'}`);
      console.log(`[Webhook] ❌ Payment failed for order ${order.order_number}`);
    }
  }

  res.json({ received: true });
});

export default router;
