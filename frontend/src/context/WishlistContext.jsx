import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

function rowToProduct(row) {
  let images = [];
  try { images = JSON.parse(row.images || '[]'); } catch {}
  if (!images.length && row.image_url) images = [row.image_url];
  return {
    id:            row.product_id,
    name:          row.name,
    price:         parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    images,
    category:      row.category,
    badge:         row.badge,
    rating:        row.rating,
    reviews:       row.reviews,
  };
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user }          = useAuth();
  const prevUserId        = useRef(null);

  // Load from DB on login
  useEffect(() => {
    if (user && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      api.getWishlist()
        .then(rows => setItems(rows.map(rowToProduct)))
        .catch(() => {});
    }
    if (!user) {
      prevUserId.current = null;
      setItems([]);
    }
  }, [user]);

  const addToWishlist = useCallback((product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) return prev;
      if (user) api.addToWishlist(product).catch(() => {});
      return [...prev, product];
    });
  }, [user]);

  const removeFromWishlist = useCallback((id) => {
    setItems(prev => {
      if (user) api.removeFromWishlist(id).catch(() => {});
      return prev.filter(i => i.id !== id);
    });
  }, [user]);

  const toggleWishlist = useCallback((product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) {
        if (user) api.removeFromWishlist(product.id).catch(() => {});
        return prev.filter(i => i.id !== product.id);
      }
      if (user) api.addToWishlist(product).catch(() => {});
      return [...prev, product];
    });
  }, [user]);

  const isWishlisted = useCallback((id) => items.some(i => i.id === id), [items]);

  const totalWishlist = items.length;

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, totalWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
