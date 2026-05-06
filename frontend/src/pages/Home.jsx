import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Leaf, Award } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductsContext';
import './Home.css';



export default function Home() {
  const { products } = useProducts();
  const featured = products.filter(p => p.featured);
  return (
    <main className="home page-enter">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85"
            alt="Luxury beauty"
          />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content container">
          <p className="section-label hero__label">New Collection 2026</p>
          <h1 className="hero__title">
            Beauty That<br /><em>Transcends</em>
          </h1>
          <p className="hero__sub">Crafted for elegance. Designed for confidence. Luxury redefined for the modern connoisseur.</p>
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
        { 
          icon: <Leaf size={22} />, 
          title: "Premium Fabrics", 
          desc: "Carefully selected materials that ensure comfort, durability, and a luxurious feel in every wear." 
        },
        { 
          icon: <Sparkles size={22} />, 
          title: "Trend-Driven Designs", 
          desc: "Crafted with the latest fashion trends, blending modern style with timeless elegance." 
        },
        { 
          icon: <Award size={22} />, 
          title: "Quality Assured", 
          desc: "Every piece is thoroughly inspected to deliver superior craftsmanship and long-lasting quality." 
        },
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
          <h2 className="banner__title">The Signature Collection</h2>
          <p className="banner__sub">
            Curated styles that blend tradition with modern elegance. Enjoy complimentary shipping on orders above ₹1500.
          </p>
          <Link to="/shop" className="btn-primary">
            <span>Explore Collection</span>
            <ArrowRight size={16} />
          </Link>
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
            { name: "Ethnic Wear", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80" },
            { name: "Western Wear", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80" },
            { name: "Footwear", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
            { name: "Accessories", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80" },
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
            "Zarvenza is more than fashion — it is a statement. Every piece embodies elegance, every design defines confidence."
          </p>
          {/* <p className="testimonial__author">— Isabelle V., Paris</p> */}
          <div className="gold-line" style={{ marginTop: '40px' }}></div>
        </div>
      </section>
    </main>
  );
}
