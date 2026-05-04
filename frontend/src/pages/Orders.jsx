import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, ChevronRight, Clock } from 'lucide-react';
import { api } from '../api';
import './Orders.css';

const STATUS_COLOR = {
  awaiting_payment: '#b8860b',
  pending:          '#b8860b',
  confirmed:        '#2e7d52',
  processing:       '#1a5276',
  shipped:          '#6c3483',
  delivered:        '#2e7d52',
  payment_failed:   '#922b21',
  cancelled:        '#922b21',
};

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

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.getOrders()
      .then(rows => setOrders(rows.map(o => ({
        ...o,
        // pg returns NUMERIC as strings — parse to float for display
        total: parseFloat(o.total) || 0,
      }))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="orders-page page-enter">
      <div className="page-hero page-hero--short">
        <div className="page-hero__bg">
          <div className="page-hero__overlay page-hero__overlay--full" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Your Account</p>
          <h1 className="page-hero__title">My Orders</h1>
        </div>
      </div>

      <div className="orders-body container">
        {loading && (
          <div className="orders-loading">
            <div className="auth-spinner" />
            <p>Loading your orders…</p>
          </div>
        )}

        {error && <p className="orders-error">⚠ {error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <ShoppingBag size={48} strokeWidth={1} />
            <h2>No orders yet</h2>
            <p>Your luxury journey begins with your first purchase.</p>
            <Link to="/shop" className="btn-primary"><span>Explore the Collection</span></Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
                <div className="order-card__left">
                  <div className="order-card__icon">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div className="order-card__info">
                    <p className="order-card__number">{order.order_number}</p>
                    <p className="order-card__meta">
                      <Clock size={11} />
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                      <span className="dot">·</span>
                      {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="order-card__right">
                  <span
                    className="order-status-badge"
                    style={{ '--status-color': STATUS_COLOR[order.status] ?? '#888' }}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <p className="order-card__total">₹{order.total.toFixed(2)}</p>
                  <ChevronRight size={16} className="order-card__arrow" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
