import React, { useState, useEffect, useRef } from 'react';
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleBtnRef = useRef(null);
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-wildtour-client-id';

    const handleGoogleResponse = async (response) => {
      if (response && response.credential) {
        setGoogleLoading(true);
        try {
          const res = await loginWithGoogle({ credential: response.credential });
          if (res.success) {
            navigate('/safaris');
          }
        } catch (err) {
          showToast('Google authentication failed', 'error');
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          auto_select: false,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'center',
          });
        }
      } catch (e) {
        console.warn('Google Identity initialization note:', e.message);
      }
    }
  }, [loginWithGoogle, navigate, showToast]);

  const handleCustomGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes('dummy') || clientId.includes('your_google')) {
      showToast('Google OAuth requires a Google Client ID in your .env file.', 'warning');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.warn('[Google GSI]: One-tap prompt not displayed:', notification.getNotDisplayedReason?.());
        }
      });
    } else {
      showToast('Google Identity services are loading or blocked by browser extensions.', 'warning');
    }
  };

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

          {/* Google OAuth Button */}
          <div className="google-auth-strip mb-3">
            <div ref={googleBtnRef} className="google-gsi-wrapper" />
            <button
              type="button"
              onClick={handleCustomGoogleClick}
              disabled={googleLoading}
              className="frosted-google-btn"
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="login-divider">
            <span>OR SIGN IN WITH EMAIL</span>
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

        /* Google OAuth Button */
        .google-auth-strip {
          position: relative;
          width: 100%;
          margin-bottom: 12px;
        }

        .google-gsi-wrapper {
          position: absolute;
          inset: 0;
          opacity: 0.01;
          z-index: 2;
          overflow: hidden;
          cursor: pointer;
        }

        .frosted-google-btn {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(218, 220, 224, 0.9);
          color: #3c4043;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .frosted-google-btn:hover {
          background: #ffffff;
          border-color: #bcc1c8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
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
