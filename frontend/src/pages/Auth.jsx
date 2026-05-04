import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        await signup(form.name, form.email, form.password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__grain" />
      </div>

      <div className="auth-container">
        {/* Brand */}
        <Link to="/" className="auth-brand">
          <span className="auth-brand__name">Zarvenza</span>
          <span className="auth-brand__tag">Luxury Beauty</span>
        </Link>

        <div className="auth-card">
          {/* Toggle tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >Sign In</button>
            <button
              className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >Create Account</button>
          </div>

          <div className="auth-card__inner">
            <h1 className="auth-title">
              {isLogin ? 'Welcome back' : 'Join Zarvenza'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to your account to continue'
                : 'Create your account for a personalized luxury experience'}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <User size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      required={!isLogin}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="auth-input"
                    placeholder={isLogin ? '••••••••' : 'At least 6 characters'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner-inline" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button className="auth-switch-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </p>

            {!isLogin && (
              <p className="auth-terms">
                By creating an account you agree to our{' '}
                <Link to="/policies">Privacy Policy & Terms</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
