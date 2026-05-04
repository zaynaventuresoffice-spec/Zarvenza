import { Link } from 'react-router-dom';
import { Globe, Share2, Rss } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <h2 className="footer__logo">Zarvenza</h2>
          <p className="footer__tagline section-label">Luxury Beauty</p>
          <p className="footer__desc">Crafted for those who seek beauty as an art form. Each product a testament to refinement, each formula a quiet luxury.</p>
          <div className="footer__social">
          <a href="#" aria-label="Instagram"><Globe size={18} /></a>
            <a href="#" aria-label="Facebook"><Share2 size={18} /></a>
            <a href="#" aria-label="YouTube"><Rss size={18} /></a>
          </div>
        </div>

        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/about">Our Story</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Categories</h4>
            <Link to="/shop">Ethnic Wear</Link>
            <Link to="/shop">Fragrance</Link>
            <Link to="/shop">Skincare</Link>
            <Link to="/shop">Makeup</Link>
            <Link to="/shop">Body & Hair</Link>
            <Link to="/shop">Home</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Support</h4>
            <Link to="/policies">Shipping Policy</Link>
            <Link to="/policies">Returns</Link>
            <Link to="/policies">Privacy Policy</Link>
            <Link to="/policies">Terms of Service</Link>
            <Link to="/contact">Help Centre</Link>
          </div>
        </div>

        <div className="footer__newsletter">
          <h4 className="footer__col-title">The Zarvenza Edit</h4>
          <p>Receive curated beauty rituals, exclusive offers, and new arrivals directly to your inbox.</p>
          <div className="footer__form">
            <input type="email" placeholder="Your email address" />
            <button className="btn-primary"><span>Subscribe</span></button>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <div className="gold-line" style={{ margin: '0' }}></div>
        <div className="footer__bottom-inner">
          <p>© {new Date().getFullYear()} Zarvenza. All rights reserved.</p>
          <p>Crafted with devotion to beauty.</p>
        </div>
      </div>
    </footer>
  );
}
