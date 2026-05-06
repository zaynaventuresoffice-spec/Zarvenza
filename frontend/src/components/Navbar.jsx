import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, Heart, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductsContext';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [userMenuOpen, setUserMenu]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { totalItems }    = useCart();
  const { user, logout }  = useAuth();
  const { totalWishlist } = useWishlist();
  const { products }      = useProducts();
  const userMenuRef  = useRef(null);
  const searchRef    = useRef(null);
  const searchInput  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserMenu(false); closeSearch(); }, [pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))   closeSearch();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInput.current?.focus(), 50);
  }, [searchOpen]);

  function openSearch()  { setSearchOpen(true); }
  function closeSearch() { setSearchOpen(false); setSearchQuery(''); }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  }

  const searchResults = searchQuery.trim().length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleLogout = () => { logout(); navigate('/'); };
  const isHome = pathname === '/';

  return (
    <header className={`navbar ${scrolled || !isHome ? 'navbar--solid' : ''} ${menuOpen ? 'navbar--open' : ''}`}>
      <div className="navbar__inner container">

        <button className="navbar__hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className="navbar__nav navbar__nav--left">
          <Link to="/"      className={pathname === '/'              ? 'active' : ''}>Home</Link>
          <Link to="/shop"  className={pathname.startsWith('/shop')  ? 'active' : ''}>Shop</Link>
          <Link to="/about" className={pathname === '/about'         ? 'active' : ''}>About</Link>
        </nav>

        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">Zarvenza</span>
          <span className="navbar__logo-tagline">Luxury Beauty</span>
        </Link>

        <nav className="navbar__nav navbar__nav--right">
          <Link to="/contact"  className={pathname === '/contact'  ? 'active' : ''}>Contact</Link>
          <Link to="/policies" className={pathname === '/policies' ? 'active' : ''}>Policies</Link>
        </nav>

        <div className="navbar__icons">

          {/* ── Search ── */}
          <div
            className={`navbar__search-wrap ${searchOpen ? 'navbar__search-wrap--open' : ''}`}
            ref={searchRef}
          >
            {/* Toggle button — always visible */}
            <button
              className="navbar__icon-btn"
              aria-label="Search"
              onClick={() => searchOpen ? closeSearch() : openSearch()}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Drop-down panel — hidden until searchOpen */}
            <div className="navbar__search-box">
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchInput}
                className="navbar__search-input"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Search products"
              />
              <span className="navbar__search-hint">Enter to search · Esc to close</span>

              {/* Live results */}
              {searchResults.length > 0 && (
                <div className="navbar__search-results">
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="navbar__search-item"
                      onClick={closeSearch}
                    >
                      <img src={p.images?.[0]} alt={p.name} className="navbar__search-thumb" />
                      <div className="navbar__search-info">
                        <span className="navbar__search-name">{p.name}</span>
                        <span className="navbar__search-cat">{p.category}</span>
                      </div>
                      <span className="navbar__search-price">₹{p.price}</span>
                    </Link>
                  ))}
                  <button
                    className="navbar__search-all"
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      closeSearch();
                    }}
                  >
                    See all results for "{searchQuery}"
                  </button>
                </div>
              )}

              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="navbar__search-results">
                  <p className="navbar__search-empty">No products found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar__icon-btn navbar__icon-btn--wish" aria-label="Wishlist">
            <Heart size={18} />
            {totalWishlist > 0 && <span className="navbar__bag-count">{totalWishlist}</span>}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="navbar__icon-btn navbar__icon-btn--bag" aria-label="Bag">
            <ShoppingBag size={18} />
            {totalItems > 0 && <span className="navbar__bag-count">{totalItems}</span>}
          </Link>

          {/* User */}
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
                <ChevronDown
                  size={12}
                  className={`navbar__chevron ${userMenuOpen ? 'navbar__chevron--open' : ''}`}
                />
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

      {/* ── Mobile menu ── */}
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
              <button
                onClick={handleLogout}
                style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: '8px 0' }}
              >
                Sign Out
              </button>
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