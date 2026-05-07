import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, X, Check, Package, Clock, User, MapPin, ShoppingBag, RefreshCw } from 'lucide-react';
import { api } from '../api';
import './TrackOrder.css';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABEL = {
  awaiting_payment: 'Awaiting Payment',
  pending:          'Pending',
  confirmed:        'Confirmed',
  processing:       'Processing',
  shipped:          'Shipped',
  delivered:        'Delivered',
  payment_failed:   'Payment Failed',
  cancelled:        'Cancelled',
};

const STATUS_COLOR = {
  awaiting_payment: 'amber',
  pending:          'amber',
  confirmed:        'green',
  processing:       'blue',
  shipped:          'purple',
  delivered:        'green',
  payment_failed:   'red',
  cancelled:        'red',
};

const STATUS_MESSAGES = {
  pending:    'Your order has been placed and is awaiting payment confirmation.',
  confirmed:  'Payment confirmed! Your order has been accepted and is being prepared.',
  processing: 'Our team is carefully packaging your luxury items.',
  shipped:    'Your order is on its way! Tracking details will be sent to your email.',
  delivered:  'Your order has been delivered. We hope you love your Zarvenza experience!',
  cancelled:  'Your order has been cancelled. Any payment will be refunded within 5–7 business days.',
};

export default function TrackOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState(null); // order id
  const [detail,   setDetail]   = useState({});   // { [id]: fullOrder }
  const [loadingDetail, setLoadingDetail] = useState(null);

  // Status update modal
  const [updateModal, setUpdateModal] = useState(null); // order object
  const [newStatus,   setNewStatus]   = useState('');
  const [customMsg,   setCustomMsg]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.adminGetOrders();
      setOrders(data.map(o => ({ ...o, total: parseFloat(o.total) || 0 })));
    } catch {}
    finally { setLoading(false); }
  }

  async function toggleExpand(order) {
    if (expanded === order.id) { setExpanded(null); return; }
    setExpanded(order.id);
    if (detail[order.id]) return; // already loaded

    setLoadingDetail(order.id);
    try {
      const full = await api.adminGetOrder(order.id);
      setDetail(d => ({ ...d, [order.id]: full }));
    } catch {}
    finally { setLoadingDetail(null); }
  }

  function openUpdate(order) {
    setUpdateModal(order);
    setNewStatus(order.status);
    setCustomMsg(STATUS_MESSAGES[order.status] || '');
    setSaveError('');
  }

  async function handleStatusSave() {
    if (!newStatus) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.adminUpdateStatus(updateModal.id, {
        status:  newStatus,
        message: customMsg || STATUS_MESSAGES[newStatus] || '',
      });
      // Update local list
      setOrders(prev => prev.map(o => o.id === updateModal.id ? { ...o, status: newStatus } : o));
      // Invalidate detail cache so it reloads
      setDetail(d => { const n = { ...d }; delete n[updateModal.id]; return n; });
      setUpdateModal(null);
    } catch (e) {
      setSaveError(e.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  // Filtered + searched
  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats strip
  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <main className="track-orders page-enter">
      <div className="admin__header">
        <div className="container">
          <p className="section-label">Admin · Order Management</p>
          <h1 className="admin__title">Track Orders</h1>
        </div>
      </div>

      <div className="container track-orders__body">

        {/* Stats */}
        <div className="to-stats">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`to-stat ${filterStatus === s ? 'to-stat--active' : ''}`}
              onClick={() => setFilterStatus(prev => prev === s ? 'all' : s)}
            >
              <span className={`to-stat__dot to-stat__dot--${STATUS_COLOR[s]}`} />
              <span className="to-stat__label">{STATUS_LABEL[s]}</span>
              <span className="to-stat__count">{stats[s] || 0}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="to-toolbar">
          <div className="to-search-wrap">
            <Search size={15} />
            <input
              className="to-search"
              placeholder="Search by order number, customer name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="to-search-clear" onClick={() => setSearch('')}><X size={13} /></button>}
          </div>
          <button className="to-refresh" onClick={loadOrders} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="to-loading"><div className="auth-spinner" /></div>
        ) : (
          <div className="to-list">
            {filtered.length === 0 && (
              <div className="to-empty">
                <Package size={40} strokeWidth={1} />
                <p>No orders found</p>
              </div>
            )}

            {filtered.map(order => {
              const isOpen   = expanded === order.id;
              const full     = detail[order.id];
              const isLoadingDetail = loadingDetail === order.id;

              return (
                <div key={order.id} className={`to-card ${isOpen ? 'to-card--open' : ''}`}>
                  {/* Row */}
                  <div className="to-card__row" onClick={() => toggleExpand(order)}>
                    <div className="to-card__col to-card__col--num">
                      <p className="to-card__order-num">{order.order_number}</p>
                      <p className="to-card__date">
                        <Clock size={11} />
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="to-card__col to-card__col--customer">
                      <p className="to-card__customer-name">{order.customer_name}</p>
                      <p className="to-card__customer-email">{order.customer_email}</p>
                    </div>
                    <div className="to-card__col to-card__col--items">
                      <span className="to-card__items">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="to-card__col to-card__col--total">
                      <span className="to-card__total">₹{order.total.toFixed(2)}</span>
                    </div>
                    <div className="to-card__col to-card__col--status">
                      <span className={`to-badge to-badge--${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                    </div>
                    <div className="to-card__col to-card__col--actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="to-update-btn"
                        onClick={() => openUpdate(order)}
                        title="Update status"
                      >
                        Update Status
                      </button>
                      <button className="to-expand-btn">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="to-card__detail">
                      {isLoadingDetail ? (
                        <div className="to-detail-loading"><div className="auth-spinner" /></div>
                      ) : full ? (
                        <div className="to-detail">
                          <div className="to-detail__cols">
                            {/* Items */}
                            <div className="to-detail__section">
                              <p className="to-detail__heading"><ShoppingBag size={13} /> Order Items</p>
                              <div className="to-items">
                                {full.items?.map((item, i) => (
                                  <div key={i} className="to-item">
                                    <img
                                      src={item.image_url || item.images?.[0]}
                                      alt={item.name}
                                      className="to-item__img"
                                      onError={e => e.target.style.display='none'}
                                    />
                                    <div className="to-item__info">
                                      <p className="to-item__name">{item.name}</p>
                                      <p className="to-item__meta">Qty: {item.qty} · ₹{parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                    <p className="to-item__subtotal">₹{(item.qty * parseFloat(item.price)).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="to-detail__total-row">
                                <span>Order Total</span>
                                <span>₹{full.total ? parseFloat(full.total).toFixed(2) : order.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Shipping + Timeline */}
                            <div className="to-detail__right">
                              {full.shipping_address && (
                                <div className="to-detail__section">
                                  <p className="to-detail__heading"><MapPin size={13} /> Shipping Address</p>
                                  <div className="to-address">
                                    {(() => {
                                      try {
                                        const addr = typeof full.shipping_address === 'string'
                                          ? JSON.parse(full.shipping_address)
                                          : full.shipping_address;
                                        return (
                                          <>
                                            <p>{addr.name}</p>
                                            <p>{addr.address}</p>
                                            <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                                            <p>{addr.phone}</p>
                                          </>
                                        );
                                      } catch { return <p>{String(full.shipping_address)}</p>; }
                                    })()}
                                  </div>
                                </div>
                              )}

                              <div className="to-detail__section">
                                <p className="to-detail__heading"><Clock size={13} /> Status Timeline</p>
                                <div className="to-timeline">
                                  {full.tracking?.length > 0 ? full.tracking.map((t, i) => (
                                    <div key={i} className={`to-timeline__item ${i === full.tracking.length - 1 ? 'to-timeline__item--latest' : ''}`}>
                                      <div className="to-timeline__dot" />
                                      <div className="to-timeline__content">
                                        <p className="to-timeline__status">{STATUS_LABEL[t.status] ?? t.status}</p>
                                        <p className="to-timeline__msg">{t.message}</p>
                                        <p className="to-timeline__time">
                                          {new Date(t.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                  )) : <p className="to-no-tracking">No tracking history yet</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="to-detail-error">Could not load order details</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Update Status Modal ───────────────────────────────── */}
      {updateModal && (
        <div className="to-modal-bg" onClick={() => setUpdateModal(null)}>
          <div className="to-modal" onClick={e => e.stopPropagation()}>
            <div className="to-modal__header">
              <div>
                <h2>Update Order Status</h2>
                <p className="to-modal__sub">{updateModal.order_number} · {updateModal.customer_name}</p>
              </div>
              <button className="to-modal__close" onClick={() => setUpdateModal(null)}><X size={18} /></button>
            </div>

            <div className="to-modal__body">
              {saveError && <p className="to-modal__error">{saveError}</p>}

              <div className="to-status-grid">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    className={`to-status-option ${newStatus === s ? 'to-status-option--active' : ''}`}
                    onClick={() => { setNewStatus(s); setCustomMsg(STATUS_MESSAGES[s] || ''); }}
                  >
                    <span className={`to-stat__dot to-stat__dot--${STATUS_COLOR[s]}`} />
                    {STATUS_LABEL[s]}
                    {newStatus === s && <Check size={13} className="to-status-check" />}
                  </button>
                ))}
              </div>

              <div className="to-modal__field">
                <label>Customer Message <span className="to-modal__hint">(optional — shown in order timeline)</span></label>
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  rows={3}
                  placeholder="Leave blank to use the default message for this status"
                />
              </div>
            </div>

            <div className="to-modal__footer">
              <button className="btn-outline" onClick={() => setUpdateModal(null)}><span>Cancel</span></button>
              <button className="btn-primary" onClick={handleStatusSave} disabled={saving}>
                <span>{saving ? 'Saving…' : 'Save Status'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}