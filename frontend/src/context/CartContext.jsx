import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Reconstruct a full product-like object from a DB cart row
function rowToItem(row) {
  let images = [];
  try { images = JSON.parse(row.images || '[]'); } catch {}
  if (!images.length && row.image_url) images = [row.image_url];
  return {
    id:            row.product_id,
    name:          row.name,
    price:         parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    qty:           row.qty,
    images,
    category:      row.category,
    badge:         row.badge,
    rating:        row.rating,
    reviews:       row.reviews,
  };
}

export function CartProvider({ children }) {
  const [items, setItems]     = useState([]);
  const [syncing, setSyncing] = useState(false);
  const { user }              = useAuth();
  const syncTimer             = useRef(null);
  const prevUserId            = useRef(null);

  // Load from DB on login
  useEffect(() => {
    if (user && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      api.getCart()
        .then(rows => setItems(rows.map(rowToItem)))
        .catch(() => {});
    }
    if (!user) {
      prevUserId.current = null;
      setItems([]);
    }
  }, [user]);

  // Debounced sync to DB whenever items change (logged-in only)
  const scheduleSyncToDb = useCallback((newItems) => {
    if (!user) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setSyncing(true);
      api.syncCart(newItems).finally(() => setSyncing(false));
    }, 600);
  }, [user]);

  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      const next = existing
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
        : [...prev, { ...product, qty }];
      scheduleSyncToDb(next);
      return next;
    });
  }, [scheduleSyncToDb]);

  const removeFromCart = useCallback((id) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      scheduleSyncToDb(next);
      return next;
    });
  }, [scheduleSyncToDb]);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems(prev => {
      const next = prev.map(i => i.id === id ? { ...i, qty } : i);
      scheduleSyncToDb(next);
      return next;
    });
  }, [scheduleSyncToDb]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) api.clearCart().catch(() => {});
  }, [user]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, subtotal, syncing }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
