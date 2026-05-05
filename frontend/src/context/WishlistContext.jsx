import { createContext, useContext, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToWishlist = useCallback((product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const toggleWishlist = useCallback((product) => {
    setItems(prev => {
      if (prev.find(i => i.id === product.id)) {
        return prev.filter(i => i.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isWishlisted = useCallback((id) => {
    return items.some(i => i.id === id);
  }, [items]);

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
