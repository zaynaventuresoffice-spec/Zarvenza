import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ArrowLeft, Check, Truck, RefreshCw, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import './Product.css';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { products } = useProducts();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoadingProduct(true);
    setActiveImg(0);
    api.getProduct(id)
      .then(p => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoadingProduct(false));
  }, [id]);

  if (loadingProduct) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="auth-spinner" />
    </div>
  );

  if (!product) return (
    <div className="product-not-found container">
      <p>Product not found.</p>
      <Link to="/shop" className="btn-primary"><span>Back to Shop</span></Link>
    </div>
  );

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <main className="product-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product__breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to="/shop">{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product__layout">
          {/* Gallery */}
          <div className="product__gallery">
            <div className="product__main-img">
              <img src={product.images[activeImg]} alt={product.name} />
              {product.badge && <span className="pcard__badge pcard__badge--bestseller">{product.badge}</span>}
            </div>
            {product.images.length > 1 && (
              <div className="product__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`product__thumb ${activeImg === i ? 'product__thumb--active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product__info">
            <p className="section-label">{product.category}</p>
            <h1 className="product__name">{product.name}</h1>

            <div className="product__rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />
              ))}
              <span className="product__rating-score">{product.rating}</span>
              <span className="product__rating-count">({product.reviews} reviews)</span>
            </div>

            <div className="product__price-wrap">
              {product.originalPrice && (
                <span className="product__original">₹{product.originalPrice}</span>
              )}
              <span className="product__price">₹{product.price}</span>
            </div>

            <div className="gold-line-left" style={{ margin: '28px 0' }}></div>

            <p className="product__desc">{product.description}</p>

            <ul className="product__details">
              {product.details.map((d, i) => (
                <li key={i}><Check size={13} />{d}</li>
              ))}
            </ul>

            <div className="product__qty-row">
              <div className="product__qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button
                className={`btn-primary product__add ${added ? 'product__add--done' : ''}`}
                onClick={handleAdd}
              >
                {added ? (
                  <><Check size={16} /><span>Added to Bag</span></>
                ) : (
                  <><ShoppingBag size={16} /><span>Add to Bag</span></>
                )}
              </button>
              <button
                className={`product__wish-btn ${isWishlisted(product.id) ? 'product__wish-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="product__trust">
              {[
                { icon: <Truck size={16} />, text: "Free shipping over $150" },
                { icon: <RefreshCw size={16} />, text: "30-day returns" },
                { icon: <Shield size={16} />, text: "Authentic & certified" },
              ].map((t, i) => (
                <div key={i} className="product__trust-item">
                  {t.icon}<span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="product__related">
            <div className="section__header" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p className="section-label">You May Also Love</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', marginTop: '8px' }}>
                Related Products
              </h2>
              <div className="gold-line" style={{ marginTop: '14px' }}></div>
            </div>
            <div className="product__related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
