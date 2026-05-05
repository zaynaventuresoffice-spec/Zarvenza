import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  if (items.length === 0) {
    return (
      <main className="wishlist-page page-enter">
        <div className="wishlist-empty container">
          <div className="wishlist-empty__icon">
            <Heart size={48} strokeWidth={1} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Save the pieces that speak to you — find them here whenever you're ready.</p>
          <Link to="/shop" className="btn-primary"><span>Explore the Collection</span></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page page-enter">
      <div className="page-hero page-hero--short">
        <div className="page-hero__bg">
          <div className="page-hero__overlay page-hero__overlay--full" />
        </div>
        <div className="page-hero__content container">
          <p className="section-label">Saved for Later</p>
          <h1 className="page-hero__title">My Wishlist</h1>
        </div>
      </div>

      <div className="wishlist-body container">
        <p className="wishlist-count section-label">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>

        <div className="wishlist-grid">
          {items.map(product => (
            <div className="wcard" key={product.id}>
              <div className="wcard__img-wrap">
                <Link to={`/product/${product.id}`}>
                  <img src={product.images[0]} alt={product.name} className="wcard__img" loading="lazy" />
                </Link>
                {product.badge && (
                  <span className={`pcard__badge pcard__badge--${product.badge.toLowerCase().replace(' ', '-')}`}>
                    {product.badge}
                  </span>
                )}
                <button
                  className="wcard__remove"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="wcard__body">
                <p className="wcard__cat section-label">{product.category}</p>
                <h3 className="wcard__name">
                  <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>
                <div className="wcard__rating">
                  <Star size={11} fill="currentColor" />
                  <span>{product.rating}</span>
                  <span className="wcard__reviews">({product.reviews})</span>
                </div>
                <div className="wcard__price-row">
                  <div className="wcard__price">
                    {product.originalPrice && (
                      <span className="wcard__original">₹{product.originalPrice}</span>
                    )}
                    <span className="wcard__current">₹{product.price}</span>
                  </div>
                </div>
                <button
                  className="wcard__add-btn btn-primary"
                  onClick={() => handleMoveToCart(product)}
                >
                  <ShoppingBag size={14} />
                  <span>Move to Bag</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="wishlist-actions">
          <Link to="/shop" className="btn-outline"><span>Continue Shopping</span></Link>
        </div>
      </div>
    </main>
  );
}
