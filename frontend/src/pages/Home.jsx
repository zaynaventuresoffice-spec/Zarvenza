import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Leaf, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import './Home.css';

const featured = products.filter(p => p.featured);

export default function Home() {
  return (
    <main className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=85"
            alt="Luxury beauty"
          />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content container">
          <p className="section-label hero__label">New Collection 2026</p>
          <h1 className="hero__title">
            Beauty That<br /><em>Transcends</em>
          </h1>
          <p className="hero__sub">Rare ingredients. Timeless rituals. Luxury redefined for the modern connoisseur.</p>
          <div className="hero__actions">
            <Link to="/shop" className="btn-primary"><span>Explore Collection</span><ArrowRight size={16} /></Link>
            <Link to="/about" className="btn-outline">Our Story</Link>
          </div>
        </div>
        <div className="hero__scroll">
          <span></span>
          <p>Scroll</p>
        </div>
      </section>

      {/* Pillars */}
      <section className="pillars">
        <div className="container pillars__inner">
          {[
            { icon: <Leaf size={22} />, title: "Pure Ingredients", desc: "Ethically sourced botanicals from the world's most prized regions." },
            { icon: <Sparkles size={22} />, title: "Artisan Formulas", desc: "Developed alongside master perfumers and dermatologists in Paris." },
            { icon: <Award size={22} />, title: "Certified Luxury", desc: "Every formula cruelty-free, vegan, and clinically validated." },
          ].map((p, i) => (
            <div className="pillar" key={i}>
              <div className="pillar__icon">{p.icon}</div>
              <h3 className="pillar__title">{p.title}</h3>
              <p className="pillar__desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="section__header">
          <p className="section-label">Curated Selection</p>
          <h2 className="section__title">Featured Pieces</h2>
          <div className="gold-line" style={{ marginTop: '16px' }}></div>
        </div>
        <div className="products-grid">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link to="/shop" className="btn-outline">View All Products <ArrowRight size={15} /></Link>
        </div>
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="banner__bg">
          <img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1400&q=80" alt="banner" />
          <div className="banner__overlay" />
        </div>
        <div className="banner__content container">
          <p className="section-label">Exclusive Offer</p>
          <h2 className="banner__title">The Signature Ritual Set</h2>
          <p className="banner__sub">A complete luxury ritual in one curated collection. Free shipping on orders over $150.</p>
          <Link to="/shop" className="btn-primary"><span>Shop Now</span><ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <div className="section__header">
          <p className="section-label">Browse By</p>
          <h2 className="section__title">Our World</h2>
          <div className="gold-line" style={{ marginTop: '16px' }}></div>
        </div>
        <div className="cat-grid">
          {[
            { name: "Fragrance", img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80" },
            { name: "Skincare", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80" },
            { name: "Makeup", img: "https://images.unsplash.com/photo-1586495777744-4e6232be4ef2?w=500&q=80" },
            { name: "Body & Home", img: "https://images.unsplash.com/photo-1602928298849-3d4c5a79ca64?w=500&q=80" },
          ].map((cat, i) => (
            <Link to="/shop" key={i} className="cat-card">
              <img src={cat.img} alt={cat.name} />
              <div className="cat-card__overlay">
                <h3 className="cat-card__name">{cat.name}</h3>
                <span className="cat-card__arrow"><ArrowRight size={18} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial">
        <div className="container testimonial__inner">
          <div className="gold-line" style={{ marginBottom: '40px' }}></div>
          <p className="testimonial__quote">
            "Zarvenza is not just a beauty brand — it is a philosophy. Each product an act of self-love, each scent a memory waiting to be made."
          </p>
          <p className="testimonial__author">— Isabelle V., Paris</p>
          <div className="gold-line" style={{ marginTop: '40px' }}></div>
        </div>
      </section>
    </main>
  );
}
