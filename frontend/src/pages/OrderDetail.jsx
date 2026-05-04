import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, CheckCircle, XCircle, Clock, Truck, Home, ArrowLeft, RotateCcw } from 'lucide-react';
import { api } from '../api';
import './Orders.css';

const TRACK_STEPS = [
  { key: 'awaiting_payment', label: 'Payment',     Icon: Clock },
  { key: 'confirmed',        label: 'Confirmed',   Icon: CheckCircle },
  { key: 'processing',       label: 'Processing',  Icon: Package },
  { key: 'shipped',          label: 'Shipped',     Icon: Truck },
  { key: 'delivered',        label: 'Delivered',   Icon: Home },
];

const STEP_ORDER = ['awaiting_payment', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    api.getOrder(id)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.cancelOrder(id);
      fetchOrder();
    } catch (e) {
      alert(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <main className="orders-page page-enter" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="auth-spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Loading order…</p>
      </div>
    </main>
  );

  if (error) return (
    <main className="orders-page page-enter">
      <div className="container" style={{ padding: '120px 0 60px', textAlign: 'center' }}>
        <XCircle size={48} strokeWidth={1} style={{ color: '#922b21', marginBottom: 16 }} />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
        <button onClick={() => navigate('/orders')} className="btn-primary" style={{ marginTop: 24 }}>
          <span>Back to Orders</span>
        </button>
      </div>
    </main>
  );

  const currentStepIndex = order.status === 'cancelled'
    ? -1
    : STEP_ORDER.indexOf(order.status);

  return (
    <main className="orders-page page-enter">
      <div className="page-hero page-hero--short">
        <div className="page-hero__bg">
          <div className="page-hero__overlay page-hero__overlay--full" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Order Details</p>
          <h1 className="page-hero__title">{order.order_number}</h1>
        </div>
      </div>

      <div className="order-detail-body container">
        {/* Back link */}
        <button className="order-back-btn" onClick={() => navigate('/orders')}>
          <ArrowLeft size={15} /> Back to orders
        </button>

        {/* ── Tracking timeline ───────────────────── */}
        {order.status !== 'cancelled' ? (
          <div className="order-track-card">
            <h2 className="order-section-title">Track Your Order</h2>
            <div className="track-timeline">
              {TRACK_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const active = i === currentStepIndex;
                return (
                  <div key={step.key} className={`track-step ${done ? 'track-step--done' : ''} ${active ? 'track-step--active' : ''}`}>
                    <div className="track-step__dot">
                      <step.Icon size={14} />
                    </div>
                    {i < TRACK_STEPS.length - 1 && <div className="track-step__line" />}
                    <span className="track-step__label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="order-cancelled-banner">
            <XCircle size={20} />
            <span>This order was cancelled.</span>
          </div>
        )}

        {/* ── Tracking history ────────────────────── */}
        {order.tracking?.length > 0 && (
          <div className="order-section-card">
            <h2 className="order-section-title">Status History</h2>
            <div className="tracking-log">
              {[...order.tracking].reverse().map(t => (
                <div key={t.id} className="tracking-log__item">
                  <span className="tracking-log__dot" />
                  <div>
                    <p className="tracking-log__msg">{t.message}</p>
                    <p className="tracking-log__date">
                      {new Date(t.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Order items ─────────────────────────── */}
        <div className="order-section-card">
          <h2 className="order-section-title">Items Ordered</h2>
          <div className="order-items-list">
            {order.items?.map(item => (
              <div key={item.id} className="order-item-row">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="order-item-img" />
                )}
                <div className="order-item-info">
                  <p className="order-item-name">{item.name}</p>
                  <p className="order-item-meta">Qty: {item.qty} × ₹{item.price.toFixed(2)}</p>
                </div>
                <p className="order-item-total">₹{(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="order-summary-rows">
            <div className="order-summary-row">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="order-summary-row">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="order-summary-row order-summary-row--total">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ── Payment & delivery info ─────────────── */}
        <div className="order-meta-grid">
          <div className="order-section-card">
            <h2 className="order-section-title">Payment</h2>
            <p className="order-meta-value">Method: {order.payment_method?.toUpperCase()}</p>
            <p className="order-meta-value">
              Status: <span className={order.payment_status === 'paid' ? 'text-green' : 'text-amber'}>
                {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
              </span>
            </p>
            {order.upi_ref && <p className="order-meta-value">Ref: {order.upi_ref}</p>}
          </div>

          <div className="order-section-card">
            <h2 className="order-section-title">Delivery Address</h2>
            <p className="order-meta-value" style={{ lineHeight: 1.7 }}>{order.notes}</p>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────── */}
        <div className="order-actions">
          <Link to="/orders" className="order-action-btn order-action-btn--secondary">
            <ArrowLeft size={15} /> All Orders
          </Link>
          {['pending', 'confirmed'].includes(order.status) && (
            <button
              className="order-action-btn order-action-btn--cancel"
              onClick={handleCancel}
              disabled={cancelling}
            >
              <XCircle size={15} />
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <Link to="/shop" className="order-action-btn order-action-btn--primary">
            <RotateCcw size={15} /> Shop Again
          </Link>
        </div>
      </div>
    </main>
  );
}
