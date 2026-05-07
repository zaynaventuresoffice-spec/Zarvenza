import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ProductsProvider } from './context/ProductsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import About from './pages/About';
import Contact from './pages/Contact';
import Policies from './pages/Policies';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import Auth from './pages/Auth';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminPortal from './pages/AdminPortal';
import TrackOrders from './pages/TrackOrder';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
      <CartProvider>
        <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/shop"     element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/about"    element={<About />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/cart"     element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login"    element={<Auth mode="login" />} />
            <Route path="/signup"   element={<Auth mode="signup" />} />

            {/* Protected routes */}
            <Route path="/payment" element={
              <ProtectedRoute><Payment /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute><OrderDetail /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminPortal /></ProtectedRoute>
            } />
            <Route path="/track-orders" element={
              <ProtectedRoute adminOnly><TrackOrders /></ProtectedRoute>
            } />
          </Routes>
          <Footer />
        </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
