import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Heart, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenu] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { totalWishlist } = useWishlist();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenu(false); }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = pathname === '/';

  return (
    <header className={`navbar ${scrolled || !isHome ? 'navbar--solid' : ''} ${menuOpen ? 'navbar--open' : ''}`}>
      <div className="navbar__inner container">
        <button className="navbar__hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="navbar__nav navbar__nav--left">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/shop" className={pathname.startsWith('/shop') ? 'active' : ''}>Shop</Link>
          <Link to="/about" className={pathname === '/about' ? 'active' : ''}>About</Link>
        </nav>

        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">Zarvenza</span>
          <span className="navbar__logo-tagline">Luxury Beauty</span>
        </Link>

        <nav className="navbar__nav navbar__nav--right">
          <Link to="/contact" className={pathname === '/contact' ? 'active' : ''}>Contact</Link>
          <Link to="/policies" className={pathname === '/policies' ? 'active' : ''}>Policies</Link>
        </nav>

        <div className="navbar__icons">
          <button className="navbar__icon-btn" aria-label="Search"><Search size={18} /></button>
          <Link to="/wishlist" className="navbar__icon-btn navbar__icon-btn--wish" aria-label="Wishlist">
            <Heart size={18} />
            {totalWishlist > 0 && <span className="navbar__bag-count">{totalWishlist}</span>}
          </Link>
          <Link to="/cart" className="navbar__icon-btn navbar__icon-btn--bag" aria-label="Bag">
            <ShoppingBag size={18} />
            {totalItems > 0 && <span className="navbar__bag-count">{totalItems}</span>}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="navbar__user-wrap" ref={userMenuRef}>
              <button
                className="navbar__icon-btn navbar__user-btn"
                onClick={() => setUserMenu(v => !v)}
                aria-label="Account"
              >
                <div className="navbar__user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={12} className={`navbar__chevron ${userMenuOpen ? 'navbar__chevron--open' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="navbar__user-dropdown">
                  <div className="navbar__user-info">
                    <p className="navbar__user-name">{user.name}</p>
                    <p className="navbar__user-email">{user.email}</p>
                  </div>
                  <div className="navbar__user-divider" />
                  <Link to="/orders" className="navbar__user-item">
                    <Package size={14} /> My Orders
                  </Link>
                  <button className="navbar__user-item navbar__user-item--logout" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__icon-btn" aria-label="Sign in">
              <User size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <nav className="navbar__mobile-nav">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/policies">Policies</Link>
          <Link to="/cart">Bag {totalItems > 0 && `(${totalItems})`}</Link>
          <Link to="/wishlist">Wishlist {totalWishlist > 0 && `(${totalWishlist})`}</Link>
          {user ? (
            <>
              <Link to="/orders">My Orders</Link>
              <button onClick={handleLogout} style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: '8px 0' }}>Sign Out</button>
            </>
          ) : (
            <Link to="/login">Sign In</Link>
          )}
        </nav>
        <div className="navbar__mobile-footer">
          {user
            ? <p className="section-label">Welcome, {user.name}</p>
            : <p className="section-label">Zarvenza Luxury Beauty</p>}
        </div>
      </div>
    </header>
  );
}
