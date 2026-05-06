import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper to parse JSON fields safely
function parseProduct(row) {
  let images = [], details = [];
  try { images  = JSON.parse(row.images  || '[]'); } catch {}
  try { details = JSON.parse(row.details || '[]'); } catch {}
  return {
    id:            row.id,
    name:          row.name,
    category:      row.category,
    price:         parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    rating:        parseFloat(row.rating || 0),
    reviews:       row.reviews || 0,
    badge:         row.badge,
    stock:         row.stock,
    description:   row.description,
    details,
    images,
    featured:      row.featured,
    active:        row.active,
    created_at:    row.created_at,
    updated_at:    row.updated_at,
  };
}

// ── GET /api/products  (public) ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM products WHERE active = true';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (featured === 'true') {
      query += ' AND featured = true';
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await db.query(query, params);
    res.json(rows.map(parseProduct));
  } catch (err) {
    console.error('[Products] list error:', err.message);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// ── GET /api/products/categories  (public) ───────────────────────
router.get('/categories', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT category FROM products WHERE active = true ORDER BY category`
    );
    const cats = ['All', ...rows.map(r => r.category)];
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch categories' });
  }
});

// ── GET /api/products/:id  (public) ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM products WHERE id = $1 AND active = true',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(parseProduct(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch product' });
  }
});

// ── POST /api/products  (admin only) ────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  const { name, category, price, originalPrice, badge, stock, description, details, images, featured } = req.body;

  if (!name?.trim())     return res.status(400).json({ error: 'Name is required' });
  if (!category?.trim()) return res.status(400).json({ error: 'Category is required' });
  if (!price)            return res.status(400).json({ error: 'Price is required' });

  try {
    const { rows } = await db.query(
      `INSERT INTO products
         (name, category, price, original_price, badge, stock, description, details, images, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        name.trim(),
        category.trim(),
        price,
        originalPrice || null,
        badge || null,
        stock || 0,
        description || '',
        JSON.stringify(details || []),
        JSON.stringify(images || []),
        featured ?? false,
      ]
    );
    res.status(201).json(parseProduct(rows[0]));
  } catch (err) {
    console.error('[Products] create error:', err.message);
    res.status(500).json({ error: 'Could not create product' });
  }
});

// ── PUT /api/products/:id  (admin only) ─────────────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, category, price, originalPrice, badge, stock, description, details, images, featured, active } = req.body;

  try {
    const { rows: existing } = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Product not found' });

    const { rows } = await db.query(
      `UPDATE products SET
         name           = $1,
         category       = $2,
         price          = $3,
         original_price = $4,
         badge          = $5,
         stock          = $6,
         description    = $7,
         details        = $8,
         images         = $9,
         featured       = $10,
         active         = $11,
         updated_at     = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        name?.trim()      ?? existing[0].name,
        category?.trim()  ?? existing[0].category,
        price             ?? existing[0].price,
        originalPrice !== undefined ? (originalPrice || null) : existing[0].original_price,
        badge !== undefined ? (badge || null) : existing[0].badge,
        stock             ?? existing[0].stock,
        description       ?? existing[0].description,
        JSON.stringify(details  ?? JSON.parse(existing[0].details  || '[]')),
        JSON.stringify(images   ?? JSON.parse(existing[0].images   || '[]')),
        featured          ?? existing[0].featured,
        active            ?? existing[0].active,
        req.params.id,
      ]
    );
    res.json(parseProduct(rows[0]));
  } catch (err) {
    console.error('[Products] update error:', err.message);
    res.status(500).json({ error: 'Could not update product' });
  }
});

// ── DELETE /api/products/:id  (admin — soft delete) ─────────────
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE products SET active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete product' });
  }
});

// ── GET /api/products/admin/all  (admin — includes inactive) ─────
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map(parseProduct));
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

export default router;
