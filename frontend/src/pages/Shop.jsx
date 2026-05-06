import { useState, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import './Shop.css';

export default function Shop() {
  const { products, categories, loading, error } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Sync URL search param → local state on mount / param change
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  function clearSearch() {
    setSearchTerm('');
    setSearchParams({});
  }

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating')     return b.rating - a.rating;
      return 0;
    });

  return (
    <main className="shop page-enter">
      {/* Page hero */}
      <div className="page-hero">
        <div className="page-hero__bg">
          <img src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=1400&q=80" alt="Luxury Editorial" />
          <div className="page-hero__overlay" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Explore</p>
          <h1 className="page-hero__title">The Collection</h1>
        </div>
      </div>

      <div className="shop__body container">
        {/* Filter bar */}
        <div className="shop__toolbar">
          {searchTerm && (
            <div className="shop__search-banner">
              <span>Showing results for <strong>"{searchTerm}"</strong> — {filtered.length} found</span>
              <button className="shop__search-clear" onClick={clearSearch}><X size={14} /> Clear</button>
            </div>
          )}
          <div className="shop__cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`shop__cat ${activeCategory === cat ? 'shop__cat--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="shop__controls">
            <p className="shop__count">{filtered.length} products</p>
            <div className="shop__sort">
              <label>Sort by</label>
              <div className="shop__select-wrap">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="shop__empty"><div className="auth-spinner" /></div>
        )}
        {error && (
          <div className="shop__empty"><p style={{ color: '#c0392b' }}>{error}</p></div>
        )}
        {!loading && !error && (
          <div className="shop__grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            {filtered.length === 0 && (
              <div className="shop__empty"><p>No products found in this category.</p></div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
