import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock, CheckCircle, ChevronDown, ArrowLeft,
  Package, CreditCard, ShieldCheck, AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import './Payment.css';

const SHIPPING_COST = 15;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payment() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = subtotal >= 150 ? 0 : SHIPPING_COST;
  const total    = subtotal + shipping;

  const [step,     setStep]     = useState('form');
  const [busy,     setBusy]     = useState(false);
  const [apiError, setApiError] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [orderId,  setOrderId]  = useState(null);
  const [failMsg,  setFailMsg]  = useState('');

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') ?? '',
    email:     user?.email ?? '',
    phone:     '',
    address:   '',
    city:      '',
    state:     '',
    zip:       '',
    country:   'India',
  });
  const [errors, setErrors] = useState({});

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim())  e.lastName  = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim())   e.phone   = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim())    e.city    = 'Required';
    if (!form.state.trim())   e.state   = 'Required';
    if (!form.zip.trim())     e.zip     = 'Required';
    return e;
  };

  const handlePay = useCallback(async () => {
    const valErrors = validate();
    if (Object.keys(valErrors).length) { setErrors(valErrors); return; }

    setBusy(true);
    setApiError('');

    try {
      // 1. Load Razorpay SDK
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) throw new Error('Could not load Razorpay. Check your internet connection.');

      // 2. Backend creates Razorpay order + saves pending DB order
      const orderData = await api.createRazorpayOrder({
        items,
        subtotal,
        shipping,
        total,
        address: {
          line1:   form.address,
          city:    form.city,
          state:   form.state,
          zip:     form.zip,
          country: form.country,
        },
        notes: [form.address, form.city, form.state, form.zip, form.country]
          .filter(Boolean).join(', '),
      });

      // 3. Open Razorpay modal
      const rzpOptions = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'Zarvenza',
        description: 'Luxury Beauty Products',
        order_id:    orderData.razorpayOrderId,
        prefill: {
          name:    `${form.firstName} ${form.lastName}`,
          email:   form.email,
          contact: form.phone,
        },
        theme: {
          color:          '#C9A96E',
          backdrop_color: 'rgba(10,10,8,0.9)',
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setApiError('Payment was cancelled. You can try again anytime.');
          },
        },

        // 4. Payment success → verify on our backend
        handler: async (response) => {
          setBusy(true);
          setStep('paying');
          try {
            const verified = await api.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId:           orderData.orderId,
            });
            clearCart();
            setOrderNum(verified.orderNumber);
            setOrderId(verified.orderId);
            setStep('success');
            window.scrollTo(0, 0);
          } catch (err) {
            setFailMsg(err.message || 'Payment verification failed. Please contact support.');
            setStep('failed');
          } finally {
            setBusy(false);
          }
        },
      };

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on('payment.failed', (response) => {
        const reason = response.error?.description || 'Payment failed';
        setFailMsg(`Payment declined: ${reason}. Please try again.`);
        setStep('failed');
        setBusy(false);
      });

      rzp.open();

    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }, [form, items, subtotal, shipping, total, clearCart]);

  // ── Empty cart guard ──────────────────────────────────────────
  if (items.length === 0 && step === 'form') { navigate('/cart'); return null; }

  // ── Verifying screen ──────────────────────────────────────────
  if (step === 'paying') return (
    <main className="payment-page page-enter">
      <div className="payment-status-screen">
        <div className="payment-status-icon payment-status-icon--spin">
          <ShieldCheck size={52} strokeWidth={1.2} />
        </div>
        <h2>Verifying Payment…</h2>
        <p>Confirming your payment with Razorpay. Please don't close this window.</p>
      </div>
    </main>
  );

  // ── Success screen ────────────────────────────────────────────
  if (step === 'success') return (
    <main className="payment-page page-enter">
      <div className="payment-status-screen">
        <div className="payment-status-icon payment-status-icon--success">
          <CheckCircle size={56} strokeWidth={1.2} />
        </div>
        <h2>Order Confirmed!</h2>
        <div className="gold-line" style={{ margin: '16px auto' }} />
        <p className="payment-success__order-num">{orderNum}</p>
        <p>Thank you, <strong>{form.firstName}</strong>! Payment received and order confirmed.</p>
        <p className="payment-status-sub">
          Your Zarvenza order will be beautifully packaged and dispatched within 1–2 business days.
        </p>
        <div className="payment-status-actions">
          <Link to={`/orders/${orderId}`} className="btn-primary">
            <Package size={15} /><span>Track My Order</span>
          </Link>
          <button className="btn-secondary" onClick={() => navigate('/shop')}>
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </main>
  );

  // ── Failed screen ─────────────────────────────────────────────
  if (step === 'failed') return (
    <main className="payment-page page-enter">
      <div className="payment-status-screen">
        <div className="payment-status-icon payment-status-icon--fail">
          <AlertCircle size={52} strokeWidth={1.2} />
        </div>
        <h2>Payment Failed</h2>
        <p className="payment-fail-msg">{failMsg}</p>
        <div className="payment-status-actions">
          <button className="btn-primary" onClick={() => { setStep('form'); setApiError(''); }}>
            <span>Try Again</span>
          </button>
          <Link to="/cart" className="btn-secondary"><span>Back to Bag</span></Link>
        </div>
      </div>
    </main>
  );

  // ── Checkout form ─────────────────────────────────────────────
  return (
    <main className="payment-page page-enter">
      <div className="page-hero page-hero--short">
        <div className="page-hero__bg"><div className="page-hero__overlay page-hero__overlay--full" /></div>
        <div className="page-hero__content container">
          <p className="section-label">Secure Checkout</p>
          <h1 className="page-hero__title">Complete Your Order</h1>
        </div>
      </div>

      <div className="payment-body container">
        <div className="payment-layout">

          {/* ── Form ──────────────────────────────────────── */}
          <div className="payment-form">
            <button className="payment-back" onClick={() => navigate('/cart')}>
              <ArrowLeft size={14} /><span>Back to Bag</span>
            </button>

            <section className="payment-section">
              <h3 className="payment-section__title">Contact Information</h3>
              <div className="form-grid form-grid--2">
                <Field label="First Name" error={errors.firstName}>
                  <input type="text" placeholder="Arjun" value={form.firstName}
                    onChange={e => setField('firstName', e.target.value)}
                    className={errors.firstName ? 'input-error' : ''} autoComplete="given-name" />
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <input type="text" placeholder="Sharma" value={form.lastName}
                    onChange={e => setField('lastName', e.target.value)}
                    className={errors.lastName ? 'input-error' : ''} autoComplete="family-name" />
                </Field>
              </div>
              <div className="form-grid form-grid--2">
                <Field label="Email" error={errors.email}>
                  <input type="email" placeholder="arjun@example.com" value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className={errors.email ? 'input-error' : ''} autoComplete="email" />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    className={errors.phone ? 'input-error' : ''} autoComplete="tel" />
                </Field>
              </div>
            </section>

            <section className="payment-section">
              <h3 className="payment-section__title">Shipping Address</h3>
              <Field label="Street Address" error={errors.address}>
                <input type="text" placeholder="42 MG Road, Koramangala" value={form.address}
                  onChange={e => setField('address', e.target.value)}
                  className={errors.address ? 'input-error' : ''} autoComplete="street-address" />
              </Field>
              <div className="form-grid form-grid--3">
                <Field label="City" error={errors.city}>
                  <input type="text" placeholder="Bengaluru" value={form.city}
                    onChange={e => setField('city', e.target.value)}
                    className={errors.city ? 'input-error' : ''} />
                </Field>
                <Field label="State" error={errors.state}>
                  <input type="text" placeholder="Karnataka" value={form.state}
                    onChange={e => setField('state', e.target.value)}
                    className={errors.state ? 'input-error' : ''} />
                </Field>
                <Field label="PIN Code" error={errors.zip}>
                  <input type="text" placeholder="560034" value={form.zip}
                    onChange={e => setField('zip', e.target.value)}
                    className={errors.zip ? 'input-error' : ''} />
                </Field>
              </div>
              <Field label="Country">
                <div className="form-select-wrap">
                  <select value={form.country} onChange={e => setField('country', e.target.value)}>
                    {['India','United States','United Kingdom','UAE','Singapore',
                      'France','Germany','Japan','Australia','Canada'].map(c =>
                      <option key={c}>{c}</option>
                    )}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </Field>
            </section>

            <section className="payment-section">
              <h3 className="payment-section__title">Payment Method</h3>
              <div className="rzp-badge">
                <CreditCard size={18} strokeWidth={1.5} />
                <div className="rzp-badge__text">
                  <span className="rzp-badge__title">Razorpay Secure Checkout</span>
                  <span className="rzp-badge__sub">Cards · UPI · Net Banking · Wallets · EMI</span>
                </div>
                <img
                  src="https://razorpay.com/assets/razorpay-glyph.svg"
                  alt="Razorpay"
                  className="rzp-badge__logo"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <p className="rzp-note">
                Clicking below opens the secure Razorpay checkout window where you can
                pay via Card, UPI, Net Banking, or Wallets.
              </p>
            </section>

            {apiError && (
              <div className="payment-api-error">
                <AlertCircle size={15} /><span>{apiError}</span>
              </div>
            )}

            <button
              className={`btn-primary payment-submit ${busy ? 'payment-submit--loading' : ''}`}
              onClick={handlePay}
              disabled={busy}
            >
              {busy
                ? <span className="payment-spinner" />
                : <><Lock size={15} /><span>Pay ₹{total.toFixed(2)} — Razorpay</span></>
              }
            </button>

            <p className="payment-secure-note">
              <Lock size={11} /> 256-bit SSL · PCI-DSS compliant · Powered by Razorpay
            </p>
          </div>

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside className="payment-sidebar">
            <h3 className="payment-sidebar__title">Your Order</h3>
            <div className="gold-line-left" style={{ margin: '14px 0 20px' }} />

            <div className="payment-order-items">
              {items.map(item => (
                <div className="payment-order-item" key={item.id}>
                  <div className="payment-order-item__img-wrap">
                    <img src={item.images?.[0]} alt={item.name} />
                    <span className="payment-order-item__qty">{item.qty}</span>
                  </div>
                  <div className="payment-order-item__info">
                    <p className="payment-order-item__name">{item.name}</p>
                    <p className="section-label">{item.category}</p>
                  </div>
                  <p className="payment-order-item__price">₹{(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="payment-order-totals">
              <div className="payment-order-row">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="payment-order-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="payment-free-shipping-note">
                  Add ₹{(150 - subtotal).toFixed(0)} more for free shipping
                </p>
              )}
              <div className="payment-order-divider" />
              <div className="payment-order-row payment-order-row--total">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-trust">
              <div className="payment-trust__item"><ShieldCheck size={13} /><span>Secure payment</span></div>
              <div className="payment-trust__item"><Package size={13} /><span>Luxury packaging</span></div>
              <div className="payment-trust__item"><CheckCircle size={13} /><span>Easy returns</span></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
