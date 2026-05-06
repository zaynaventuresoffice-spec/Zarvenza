import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Star, Package, ShoppingBag, Users, TrendingUp, ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';
import { api } from '../api';
import './AdminPortal.css';

const EMPTY_FORM = {
  name: '', category: '', price: '', originalPrice: '',
  badge: '', stock: '', description: '',
  details: '', images: '', featured: false, active: true,
};

const BADGES = ['', 'New', 'Sale', 'Premium', 'Bestseller', 'Limited', 'Fan Favourite'];

export default function AdminPortal() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('products'); // 'products' | 'orders'
  const [orders, setOrders]     = useState([]);
  const [stats, setStats]       = useState({ total: 0, active: 0, featured: 0, outOfStock: 0 });

  // Modal state
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Search/filter
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))].filter(Boolean);

  // ── Load ──────────────────────────────────────────────────────
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.adminGetAllProducts();
      setProducts(data);
      setStats({
        total:      data.length,
        active:     data.filter(p => p.active).length,
        featured:   data.filter(p => p.featured).length,
        outOfStock: data.filter(p => p.stock === 0).length,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  // ── Modal helpers ─────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormError('');
    setModal('edit');
  }

  function openEdit(product) {
    setForm({
      name:          product.name,
      category:      product.category,
      price:         String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      badge:         product.badge || '',
      stock:         String(product.stock),
      description:   product.description,
      details:       (product.details || []).join('\n'),
      images:        (product.images || []).join('\n'),
      featured:      product.featured,
      active:        product.active,
    });
    setEditing(product);
    setFormError('');
    setModal('edit');
  }

  function closeModal() { setModal(null); setEditing(null); }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSave() {
    if (!form.name.trim())     return setFormError('Name is required');
    if (!form.category.trim()) return setFormError('Category is required');
    if (!form.price)           return setFormError('Price is required');

    const payload = {
      name:          form.name.trim(),
      category:      form.category.trim(),
      price:         parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      badge:         form.badge || null,
      stock:         parseInt(form.stock) || 0,
      description:   form.description,
      details:       form.details.split('\n').map(s => s.trim()).filter(Boolean),
      images:        form.images.split('\n').map(s => s.trim()).filter(Boolean),
      featured:      form.featured,
      active:        form.active,
    };

    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await api.adminUpdateProduct(editing.id, payload);
      } else {
        await api.adminCreateProduct(payload);
      }
      await loadProducts();
      closeModal();
    } catch (err) {
      setFormError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.adminDeleteProduct(id);
      await loadProducts();
      setDeleteConfirm(null);
    } catch {}
  }

  async function toggleActive(product) {
    try {
      await api.adminUpdateProduct(product.id, { ...product, active: !product.active });
      await loadProducts();
    } catch {}
  }

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="admin page-enter">
      <div className="admin__header">
        <div className="container">
          <p className="section-label">Management Console</p>
          <h1 className="admin__title">Admin Portal</h1>
        </div>
      </div>

      <div className="container admin__body">

        {/* Stats */}
        <div className="admin__stats">
          {[
            { label: 'Total Products', value: stats.total,      icon: <Package size={20} /> },
            { label: 'Active',         value: stats.active,     icon: <Check size={20} /> },
            { label: 'Featured',       value: stats.featured,   icon: <Star size={20} /> },
            { label: 'Out of Stock',   value: stats.outOfStock, icon: <ShoppingBag size={20} /> },
          ].map(s => (
            <div className="admin__stat" key={s.label}>
              <div className="admin__stat-icon">{s.icon}</div>
              <div>
                <p className="admin__stat-val">{s.value}</p>
                <p className="admin__stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="admin__toolbar">
          <div className="admin__search-wrap">
            <input
              className="admin__search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="admin__filter-cats">
            {categories.map(c => (
              <button
                key={c}
                className={`admin__cat-btn ${filterCat === c ? 'admin__cat-btn--active' : ''}`}
                onClick={() => setFilterCat(c)}
              >{c}</button>
            ))}
          </div>
          <button className="btn-primary admin__add-btn" onClick={openAdd}>
            <Plus size={15} /> <span>Add Product</span>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="admin__loading"><div className="auth-spinner" /></div>
        ) : (
          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Badge</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={!p.active ? 'admin__row--inactive' : ''}>
                    <td>
                      <div className="admin__product-cell">
                        <img
                          src={p.images?.[0] || 'https://via.placeholder.com/48'}
                          alt={p.name}
                          className="admin__thumb"
                        />
                        <span className="admin__product-name">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="admin__cat-tag">{p.category}</span></td>
                    <td>
                      <div>
                        <span className="admin__price">₹{p.price}</span>
                        {p.originalPrice && <span className="admin__orig">₹{p.originalPrice}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`admin__stock ${p.stock === 0 ? 'admin__stock--out' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>{p.badge ? <span className="admin__badge-tag">{p.badge}</span> : <span className="admin__none">—</span>}</td>
                    <td>
                      {p.featured
                        ? <span className="admin__yes"><Star size={13} fill="currentColor" /> Yes</span>
                        : <span className="admin__none">No</span>}
                    </td>
                    <td>
                      <button
                        className={`admin__status-btn ${p.active ? 'admin__status-btn--active' : 'admin__status-btn--inactive'}`}
                        onClick={() => toggleActive(p)}
                        title={p.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {p.active ? <><Eye size={13} /> Active</> : <><EyeOff size={13} /> Hidden</>}
                      </button>
                    </td>
                    <td>
                      <div className="admin__actions">
                        <button className="admin__icon-btn admin__icon-btn--edit" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button className="admin__icon-btn admin__icon-btn--del" onClick={() => setDeleteConfirm(p)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="admin__empty-row">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit / Add Modal ─────────────────────────────────── */}
      {modal === 'edit' && (
        <div className="admin__modal-bg" onClick={closeModal}>
          <div className="admin__modal" onClick={e => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="admin__modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="admin__modal-body">
              {formError && <p className="admin__form-error">{formError}</p>}

              <div className="admin__form-grid">
                <div className="admin__field admin__field--full">
                  <label>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Silk Embroidered Kurta Set" />
                </div>

                <div className="admin__field">
                  <label>Category *</label>
                  <input name="category" value={form.category} onChange={handleFormChange} placeholder="e.g. Ethnic Wear" />
                </div>

                <div className="admin__field">
                  <label>Badge</label>
                  <select name="badge" value={form.badge} onChange={handleFormChange}>
                    {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
                  </select>
                </div>

                <div className="admin__field">
                  <label>Price (₹) *</label>
                  <input name="price" type="number" value={form.price} onChange={handleFormChange} placeholder="1999" />
                </div>

                <div className="admin__field">
                  <label>Original Price (₹)</label>
                  <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleFormChange} placeholder="3499" />
                </div>

                <div className="admin__field">
                  <label>Stock</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleFormChange} placeholder="0" />
                </div>

                <div className="admin__field admin__field--checks">
                  <label className="admin__checkbox">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleFormChange} />
                    <span>Featured on homepage</span>
                  </label>
                  <label className="admin__checkbox">
                    <input type="checkbox" name="active" checked={form.active} onChange={handleFormChange} />
                    <span>Active (visible in shop)</span>
                  </label>
                </div>

                <div className="admin__field admin__field--full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleFormChange} rows={3} placeholder="Product description…" />
                </div>

                <div className="admin__field admin__field--full">
                  <label>Details <span className="admin__hint">(one per line)</span></label>
                  <textarea name="details" value={form.details} onChange={handleFormChange} rows={4} placeholder={"Material: Silk Blend\nIncludes: Kurta, Pant, Dupatta\nOccasion: Festive"} />
                </div>

                <div className="admin__field admin__field--full">
                  <label>Image URLs <span className="admin__hint">(one per line)</span></label>
                  <textarea name="images" value={form.images} onChange={handleFormChange} rows={4} placeholder={"https://i.ibb.co/…/image1.png\nhttps://i.ibb.co/…/image2.png"} />
                  {form.images.split('\n').filter(Boolean).length > 0 && (
                    <div className="admin__img-preview">
                      {form.images.split('\n').filter(Boolean).map((url, i) => (
                        <img key={i} src={url.trim()} alt={`preview ${i}`} onError={e => e.target.style.display='none'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin__modal-footer">
              <button className="btn-outline" onClick={closeModal}><span>Cancel</span></button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                <span>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ───────────────────────────────────── */}
      {deleteConfirm && (
        <div className="admin__modal-bg" onClick={() => setDeleteConfirm(null)}>
          <div className="admin__modal admin__modal--sm" onClick={e => e.stopPropagation()}>
            <div className="admin__modal-header">
              <h2>Remove Product</h2>
              <button className="admin__modal-close" onClick={() => setDeleteConfirm(null)}><X size={18} /></button>
            </div>
            <div className="admin__modal-body">
              <p>Are you sure you want to remove <strong>{deleteConfirm.name}</strong>? It will be hidden from the shop but not permanently deleted.</p>
            </div>
            <div className="admin__modal-footer">
              <button className="btn-outline" onClick={() => setDeleteConfirm(null)}><span>Cancel</span></button>
              <button className="btn-primary admin__del-confirm-btn" onClick={() => handleDelete(deleteConfirm.id)}>
                <span>Remove Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
