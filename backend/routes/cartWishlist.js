import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ═══════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════

// GET /api/cart  — fetch user's cart
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM cart WHERE user_id = $1 ORDER BY added_at ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Cart] get error:', err.message);
    res.status(500).json({ error: 'Could not fetch cart' });
  }
});

// PUT /api/cart  — sync entire cart (replaces all items)
router.put('/cart', requireAuth, async (req, res) => {
  const { items } = req.body; // [{ product_id, name, price, qty, image_url, category, original_price, badge, rating, reviews, images }]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    for (const item of items) {
      await db.query(
        `INSERT INTO cart (user_id, product_id, name, price, qty, image_url, category, original_price, badge, rating, reviews, images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          req.user.id,
          item.id,
          item.name,
          item.price,
          item.qty,
          item.images?.[0] ?? null,
          item.category ?? null,
          item.originalPrice ?? null,
          item.badge ?? null,
          item.rating ?? null,
          item.reviews ?? null,
          JSON.stringify(item.images ?? []),
        ]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[Cart] sync error:', err.message);
    res.status(500).json({ error: 'Could not sync cart' });
  }
});

// DELETE /api/cart  — clear cart
router.delete('/cart', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not clear cart' });
  }
});

// ═══════════════════════════════════════════
//  WISHLIST
// ═══════════════════════════════════════════

// GET /api/wishlist
router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM wishlist WHERE user_id = $1 ORDER BY added_at ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[Wishlist] get error:', err.message);
    res.status(500).json({ error: 'Could not fetch wishlist' });
  }
});

// POST /api/wishlist  — add item
router.post('/wishlist', requireAuth, async (req, res) => {
  const item = req.body;
  if (!item?.id) return res.status(400).json({ error: 'product id required' });

  try {
    await db.query(
      `INSERT INTO wishlist (user_id, product_id, name, price, image_url, category, original_price, badge, rating, reviews, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [
        req.user.id,
        item.id,
        item.name,
        item.price,
        item.images?.[0] ?? null,
        item.category ?? null,
        item.originalPrice ?? null,
        item.badge ?? null,
        item.rating ?? null,
        item.reviews ?? null,
        JSON.stringify(item.images ?? []),
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[Wishlist] add error:', err.message);
    res.status(500).json({ error: 'Could not add to wishlist' });
  }
});

// DELETE /api/wishlist/:productId  — remove item
router.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove from wishlist' });
  }
});

export default router;
