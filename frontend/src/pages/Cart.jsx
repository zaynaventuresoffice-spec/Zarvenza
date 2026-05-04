import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQty, subtotal } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="cart-page page-enter">
        <div className="cart-empty container">
          <div className="cart-empty__icon">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
          <h2>Your bag is empty</h2>
          <p>Discover our curated collection of luxury beauty.</p>
          <Link to="/shop" className="btn-primary"><span>Explore the Collection</span></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page page-enter">
      <div className="page-hero page-hero--short">
        <div className="page-hero__bg">
          <div className="page-hero__overlay page-hero__overlay--full" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Your Selection</p>
          <h1 className="page-hero__title">Shopping Bag</h1>
        </div>
      </div>

      <div className="cart-body container">
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items__header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span></span>
            </div>

            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__product">
                  <Link to={`/product/${item.id}`}>
                    <img src={item.images[0]} alt={item.name} className="cart-item__img" />
                  </Link>
                  <div className="cart-item__meta">
                    <p className="section-label">{item.category}</p>
                    <Link to={`/product/${item.id}`} className="cart-item__name">{item.name}</Link>
                  </div>
                </div>

                <div className="cart-item__price">${item.price.toFixed(2)}</div>

                <div className="cart-item__qty">
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    disabled={item.qty <= 1}
                  >
                    <Minus size={12} />
                  </button>
                  <span>{item.qty}</span>
                  <button
                    className="cart-item__qty-btn"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="cart-item__total">${(item.price * item.qty).toFixed(2)}</div>

                <button
                  className="cart-item__remove"
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <div className="cart-items__back">
              <Link to="/shop" className="cart-back-link">
                <ArrowLeft size={15} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Summary */}
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>
            <div className="gold-line-left" style={{ margin: '16px 0 24px' }}></div>

            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="cart-free">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal > 0 && subtotal < 150 && (
                <p className="cart-shipping-note">
                  Add ${(150 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="cart-summary__divider" />
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn-primary cart-checkout-btn"
              onClick={() => navigate('/payment')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="cart-summary__trust">
              <p>🔒 Secure checkout · Free returns · Authentic products</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
