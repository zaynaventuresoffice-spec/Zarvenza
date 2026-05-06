import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError('Could not load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <ProductsContext.Provider value={{ products, categories, loading, error, refetch: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
