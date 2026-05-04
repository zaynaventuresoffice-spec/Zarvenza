import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pcard">
      <div className="pcard__img-wrap">
        <img
          src={product.images[0]}
          alt={product.name}
          className="pcard__img"
          loading="lazy"
        />
        {product.badge && (
          <span className={`pcard__badge pcard__badge--${product.badge.toLowerCase().replace(' ', '-')}`}>
            {product.badge}
          </span>
        )}
        <div className="pcard__overlay">
          <Link to={`/product/${product.id}`} className="pcard__view btn-primary">
            <span>Quick View</span>
          </Link>
        </div>
        <button className="pcard__wish" aria-label="Wishlist">
          <Heart size={16} />
        </button>
      </div>

      <div className="pcard__body">
        <p className="pcard__cat section-label">{product.category}</p>
        <h3 className="pcard__name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="pcard__rating">
          <Star size={12} fill="currentColor" />
          <span>{product.rating}</span>
          <span className="pcard__reviews">({product.reviews})</span>
        </div>
        <div className="pcard__price-row">
          <div className="pcard__price">
            {product.originalPrice && (
              <span className="pcard__original">₹{product.originalPrice}</span>
            )}
            <span className="pcard__current">₹{product.price}</span>
          </div>
          <button
            className={`pcard__bag ${added ? 'pcard__bag--added' : ''}`}
            aria-label="Add to bag"
            onClick={handleAdd}
            title="Add to bag"
          >
            {added ? <Check size={15} /> : <ShoppingBag size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
