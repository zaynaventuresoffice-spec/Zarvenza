import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <main className="about page-enter">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__bg">
          <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80" alt="About" />
          <div className="page-hero__overlay" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Our Story</p>
          <h1 className="page-hero__title">Born of Devotion</h1>
        </div>
      </div>

      {/* Intro */}
      <section className="about__intro container">
        <div className="about__intro-grid">
          <div className="about__intro-text">
            <p className="section-label">The Origin</p>
            <h2 className="about__heading">A Vision of Refined Beauty</h2>
            <div className="gold-line-left" style={{ margin: '20px 0 28px' }}></div>
            <p>Zarvenza is a modern ethnic wear brand crafted for women who love elegance with comfort. Inspired by timeless Indian designs and refined craftsmanship, our collections blend traditional aesthetics with a contemporary touch.</p>
            <p>At Zarvenza, we focus on premium fabrics, detailed embroidery, and thoughtfully designed silhouettes that make every outfit feel special. Whether it’s a festive occasion or everyday elegance, our pieces are created to make you feel confident and graceful.</p>
            <p>We believe fashion is not just about clothing — it’s about expressing your personality. That’s why every Zarvenza outfit is crafted with care, quality, and attention to detail.</p>
            <p>Zarvenza — Crafted for Modern Royalty</p>
          </div>
          {/* <div className="about__intro-img">
            <img src="https://images.unsplash.com/photo-1579591919791-0e3737ae3808?w=700&q=80" alt="Founder" />
          </div> */}
        </div>
      </section>

      {/* Values */}
      <section className="about__values">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p className="section-label">What We Stand For</p>
            <h2 className="about__heading" style={{ textAlign: 'center' }}>Our Philosophy</h2>
            <div className="gold-line" style={{ marginTop: '16px' }}></div>
          </div>
          <div className="about__values-grid">
            {[
              { num: "01", title: "Craftsmanship", desc: "Every Zarvenza piece is thoughtfully crafted with attention to detail, combining traditional techniques with modern design for a refined finish." },
              { num: "02", title: "Premium Quality", desc: "We use carefully selected fabrics and materials to ensure comfort, durability, and a luxurious feel in every outfit." },
              { num: "03", title: "Elegant Design", desc: "Our collections blend timeless Indian aesthetics with contemporary silhouettes, creating styles that are both classic and modern." },
              { num: "04", title: "Confidence", desc: "We design with the belief that fashion should empower. Every Zarvenza outfit is made to make you feel confident, graceful, and unique." },
            ].map((v, i) => (
              <div key={i} className="about__value">
                <span className="about__value-num">{v.num}</span>
                <h3 className="about__value-title">{v.title}</h3>
                <p className="about__value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="container about__team-section">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p className="section-label">The Makers</p>
          <h2 className="about__heading" style={{ textAlign: 'center' }}>Meet Our Founders</h2>
          <div className="gold-line" style={{ marginTop: '16px' }}></div>
        </div>
        <div className="about__team">
          {[
            {
              name: "Nadia Verne",
              role: "Co-founder & Master Perfumer",
              img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
              quote: "A fragrance should be a second skin — invisible, yet unforgettable."
            },
            {
              name: "Dr. Arhan Kali",
              role: "Co-founder & Cosmetic Scientist",
              img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80",
              quote: "Luxury is in the formula. The rest is simply packaging."
            },
          ].map((m, i) => (
            <div key={i} className="about__member">
              <div className="about__member-img">
                <img src={m.img} alt={m.name} />
              </div>
              <h3 className="about__member-name">{m.name}</h3>
              <p className="about__member-role">{m.role}</p>
              <p className="about__member-quote">"{m.quote}"</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="about__cta">
        <div className="about__cta-inner container">
          <p className="section-label">Discover</p>
          <h2>Experience the Collection</h2>
          <Link to="/shop" className="btn-primary"><span>Shop Now</span><ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
