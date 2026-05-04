import { useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';
import './Shop.css';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = products
    .filter(p => activeCategory === 'All' || p.category === activeCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <main className="shop page-enter">
      {/* Page hero */}
      <div className="page-hero">
        <div className="page-hero__bg">
          <img src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1400&q=80" alt="Shop" />
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

        {/* Grid */}
        <div className="shop__grid">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        {filtered.length === 0 && (
          <div className="shop__empty">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
