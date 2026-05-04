const BASE = 'http://localhost:4000/api';
// const BASE = 'https://zarvenza.onrender.com/api';

function getToken() {
  return localStorage.getItem('zarvenza_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res  = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────
  signup:        (body) => request('/auth/signup',  { method: 'POST', body: JSON.stringify(body) }),
  login:         (body) => request('/auth/login',   { method: 'POST', body: JSON.stringify(body) }),
  me:            ()     => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT',  body: JSON.stringify(body) }),

  // ── Payment (Razorpay) ─────────────────────────────────────────
  // Step 1: create a Razorpay order on the backend
  createRazorpayOrder: (body) =>
    request('/payment/create-razorpay-order', { method: 'POST', body: JSON.stringify(body) }),

  // Step 2: after modal success, verify the signature on backend
  verifyPayment: (body) =>
    request('/payment/verify', { method: 'POST', body: JSON.stringify(body) }),

  // ── Orders ────────────────────────────────────────────────────
  getOrders:   ()    => request('/orders'),
  getOrder:    (id)  => request(`/orders/${id}`),
  trackOrder:  (num) => request(`/orders/track/${num}`),
  cancelOrder: (id)  => request(`/orders/${id}/cancel`, { method: 'PUT' }),
};
