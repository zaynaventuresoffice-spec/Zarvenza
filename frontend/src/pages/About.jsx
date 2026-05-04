import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <main className="about page-enter">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero__bg">
          <img src="https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1400&q=80" alt="About" />
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
            <p>Zarvenza was founded in 2026 by Sameer Zaman, a third-generation perfumer trained in Grasse, and cosmetic scientist Dr. Arhan Kali, whose laboratory formulas have graced the dressing tables of discerning women across four continents.</p>
            <p>Their shared belief: that luxury beauty should not be manufactured — it should be crafted, slowly and with intention, using ingredients that honour both the woman who wears them and the earth that yields them.</p>
            <p>Every product in the Zarvenza collection is the result of months, sometimes years, of refinement. We do not chase trends. We create rituals.</p>
          </div>
          <div className="about__intro-img">
            <img src="https://images.unsplash.com/photo-1579591919791-0e3737ae3808?w=700&q=80" alt="Founder" />
          </div>
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
              { num: "01", title: "Provenance", desc: "Every raw material is traced to its source. We partner with family-run farms and cooperatives who share our commitment to quality and sustainability." },
              { num: "02", title: "Mastery", desc: "Our formulas are developed with master perfumers and dermatologists. We accept nothing less than exceptional performance and sensorial delight." },
              { num: "03", title: "Integrity", desc: "Cruelty-free by principle, vegan by choice, and transparent always. We publish full ingredient lists and our supply chain partnerships." },
              { num: "04", title: "Longevity", desc: "We believe in less, but better. Our collections are designed to last, built around timeless ingredients that improve with every reformulation." },
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
      <section className="container about__team-section">
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
      </section>

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
