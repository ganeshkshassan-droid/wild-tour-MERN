import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Compass,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/my-trips');
      }
    } else if (res.requiresVerification) {
      navigate('/verify-otp', {
        state: { email: res.email || email, purpose: 'signup' },
      });
    }
  };

  return (
    <div className="login-backdrop-wrapper">
      {/* Scenic Nature Background Overlay */}
      <div className="login-dark-overlay" />

      {/* Ambient Lighting Orbs for Frosted Glass Refraction */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container login-shell-container">
        <div className="login-glass-card animate-glass-enter">
          {/* 1. Header: Small Brand Mark */}
          <div className="login-brand-header">
            <div className="login-brand-mark">
              <Compass size={17} className="brand-mark-icon" />
              <span className="brand-mark-text">WILD TOUR</span>
            </div>

            <h1 className="login-heading">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue your Wild Tour adventure</p>
          </div>

          {/* 2. Form Section */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Address Field */}
            <div className="login-field-group">
              <label className="login-field-label">Email Address</label>
              <div className="login-input-wrap">
                <Mail size={17} className="login-input-icon" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="explorer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <label className="login-field-label">Password</label>
              <div className="login-input-wrap">
                <Lock size={17} className="login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link: below password input, right-aligned */}
            <div className="login-forgot-row">
              <Link to="/forgot-password" className="login-forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* 3. Divider */}
          <div className="login-divider">
            <span>OR</span>
          </div>

          {/* 4. Footer */}
          <div className="login-footer">
            <span className="footer-text">Don't have an account?</span>
            <Link to="/signup" className="footer-signup-link">
              Create one
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .login-backdrop-wrapper {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=85') center/cover no-repeat fixed;
          padding: 24px 16px;
          overflow-x: hidden;
        }

        .login-dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(8, 26, 17, 0.74) 0%, rgba(4, 15, 9, 0.84) 100%);
          backdrop-filter: blur(1px);
        }

        /* Ambient Lighting Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .orb-top-left {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.32) 0%, rgba(16, 185, 129, 0) 70%);
          top: 8%;
          left: 18%;
        }

        .orb-bottom-right {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0) 70%);
          bottom: 8%;
          right: 18%;
        }

        .login-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 1200px;
        }

        /* Frosted Glassmorphic Card */
        .login-glass-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 22px;
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
            0 24px 60px -12px rgba(4, 18, 10, 0.38),
            0 12px 24px -8px rgba(0, 0, 0, 0.22);
          padding: 36px 36px 32px 36px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Card Entrance Animation */
        .animate-glass-enter {
          animation: glassCardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes glassCardEnter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-glass-enter {
            animation: none;
          }
        }

        /* 1. Header */
        .login-brand-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .login-brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #1b4332;
          margin-bottom: 14px;
        }

        .brand-mark-icon {
          color: #1b4332;
        }

        .brand-mark-text {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          color: #1b4332;
        }

        .login-heading {
          font-family: var(--font-heading, 'Outfit', sans-serif);
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          color: #0f172a;
          line-height: 1.2;
          margin: 0;
        }

        .login-subtitle {
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.45;
          margin: 8px 0 0 0;
        }

        /* 2. Form */
        .login-form {
          display: flex;
          flex-direction: column;
        }

        .login-field-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 18px;
        }

        .login-field-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.01em;
          margin-bottom: 8px;
          text-align: left;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 50px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(203, 213, 225, 0.85);
          border-radius: 12px;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .login-input-wrap:focus-within {
          background: #ffffff;
          border-color: #1b4332;
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.12);
        }

        .login-input-icon {
          position: absolute;
          left: 15px;
          color: #64748b;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          height: 100%;
          padding: 0 16px 0 44px;
          font-size: 0.88rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: #0f172a;
          outline: none;
          font-family: inherit;
        }

        .login-input::placeholder {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 400;
        }

        .login-toggle-password {
          background: none;
          border: none;
          padding: 0 14px;
          height: 100%;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }

        .login-toggle-password:hover {
          color: #1b4332;
        }

        /* Forgot Password Row */
        .login-forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 24px;
        }

        .login-forgot-link {
          font-size: 0.78rem;
          font-weight: 700;
          color: #1b4332;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .login-forgot-link:hover {
          color: #0f291e;
          text-decoration: underline;
        }

        /* Sign In Button */
        .login-submit-btn {
          width: 100%;
          height: 52px;
          background: #1b4332;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.28);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-submit-btn:hover:not(:disabled) {
          background: #143527;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.38);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }

        /* 3. Divider */
        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin-top: 24px;
          margin-bottom: 20px;
          color: #64748b;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(203, 213, 225, 0.7);
        }

        .login-divider span {
          padding: 0 12px;
        }

        /* 4. Footer */
        .login-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .footer-text {
          color: #475569;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .footer-signup-link {
          color: #1b4332;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .footer-signup-link:hover {
          color: #0f291e;
          text-decoration: underline;
        }

        /* Responsive Breakpoints */
        @media (max-width: 520px) {
          .login-glass-card {
            padding: 28px 20px 24px 20px;
            border-radius: 18px;
          }

          .login-heading {
            font-size: 1.55rem;
          }

          .login-subtitle {
            font-size: 0.84rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
