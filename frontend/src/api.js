// const BASE = 'http://localhost:4000/api';
const BASE = 'https://zarvenza.onrender.com/api';

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

  // ── Products ──────────────────────────────────────────────────
  getProducts:    (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getCategories:  ()     => request('/products/categories'),
  getProduct:     (id)   => request(`/products/${id}`),

  // ── Admin: Products ───────────────────────────────────────────
  adminGetAllProducts: ()       => request('/products/admin/all'),
  adminCreateProduct:  (body)   => request('/products',     { method: 'POST',   body: JSON.stringify(body) }),
  adminUpdateProduct:  (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteProduct:  (id)     => request(`/products/${id}`, { method: 'DELETE' }),

  // ── Admin: Orders ─────────────────────────────────────────────
  adminGetOrders: () => request('/orders/admin/all'),

  // ── Cart ──────────────────────────────────────────────────────
  getCart:   ()      => request('/cart'),
  syncCart:  (items) => request('/cart', { method: 'PUT',    body: JSON.stringify({ items }) }),
  clearCart: ()      => request('/cart', { method: 'DELETE' }),

  // ── Wishlist ──────────────────────────────────────────────────
  getWishlist:         ()        => request('/wishlist'),
  addToWishlist:       (product) => request('/wishlist',              { method: 'POST',   body: JSON.stringify(product) }),
  removeFromWishlist:  (id)      => request(`/wishlist/${id}`,        { method: 'DELETE' }),
};
