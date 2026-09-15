import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Compass,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { evaluatePasswordStrength, PasswordStrengthFeedback } from '../components/PasswordStrengthMeter';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleBtnRef = useRef(null);
  const { register, loginWithGoogle } = useAuth();
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Live password strength calculation
  const passwordStats = useMemo(() => {
    return evaluatePasswordStrength(formData.password);
  }, [formData.password]);

  // Real-time password match calculation
  const passwordsMatch = useMemo(() => {
    if (!formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'warning');
      return;
    }

    if (!passwordStats.isAcceptable) {
      showToast('Password must contain at least one letter and one number', 'warning');
      return;
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      address: formData.address,
    });
    setLoading(false);

    if (res.success && res.requiresVerification) {
      navigate('/verify-otp', {
        state: { email: formData.email.toLowerCase().trim(), purpose: 'signup' },
      });
    }
  };

  const handleCustomGoogleClick = async () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setGoogleLoading(true);
      try {
        const res = await loginWithGoogle({
          profile: {
            name: formData.name || 'Wildlife Explorer',
            email: formData.email || `explorer_${Date.now().toString().slice(-4)}@gmail.com`,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            googleId: `google_${Date.now()}`,
          },
        });
        if (res.success) {
          navigate('/safaris');
        }
      } catch (err) {
        showToast('Google sign-in could not be completed', 'error');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  const isSubmitDisabled = loading || (formData.confirmPassword && passwordsMatch === false) || (formData.password && !passwordStats.isAcceptable);

  return (
    <div className="signup-backdrop-wrapper">
      {/* Scenic Background Overlay */}
      <div className="signup-dark-overlay" />

      {/* Ambient Lighting Orbs */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container signup-shell-container section-padding">
        <div className="spacious-glass-card animate-glass-enter">
          {/* Top Gold Eyebrow Tag */}
          <div className="card-top-tag text-center">
            <span className="gold-eyebrow-tag">
              <Sparkles size={13} className="text-gold" />
              <span>EXPLORER PORTAL</span>
            </span>
          </div>

          {/* Card Header */}
          <div className="glass-card-header text-center">
            <div className="brand-compass-badge">
              <Compass size={24} className="text-forest-primary" />
            </div>
            <h1 className="glass-card-title">Create Explorer Account</h1>
            <p className="glass-card-subtitle">
              Join Wild Tour to access reserved safari permits, lodges & certified naturalist guides
            </p>
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

          <div className="glass-divider">
            <span>OR REGISTER WITH EMAIL</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-auth-form">
            {/* Row 1: Full Name & Email Address */}
            <div className="form-2col-grid">
              <div className="compact-form-group">
                <label className="compact-label">Full Name</label>
                <div className="glass-input-box">
                  <User size={16} className="glass-input-icon" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Arjun Rao"
                    value={formData.name}
                    onChange={handleChange}
                    className="glass-input"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="compact-form-group">
                <label className="compact-label">Email Address</label>
                <div className="glass-input-box">
                  <Mail size={16} className="glass-input-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="arjun@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="glass-input"
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone Number & Location */}
            <div className="form-2col-grid">
              <div className="compact-form-group">
                <label className="compact-label">Phone Number</label>
                <div className="glass-input-box">
                  <Phone size={16} className="glass-input-icon" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="glass-input"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="compact-form-group">
                <label className="compact-label">Location (City / State)</label>
                <div className="glass-input-box">
                  <MapPin size={16} className="glass-input-icon" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Bangalore, KA"
                    value={formData.address}
                    onChange={handleChange}
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="form-2col-grid">
              <div className="compact-form-group">
                <label className="compact-label">Password</label>
                <div className="glass-input-box">
                  <Lock size={16} className="glass-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength="4"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className="glass-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="glass-action-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="compact-form-group">
                <label className="compact-label">Confirm Password</label>
                <div className={`glass-input-box ${passwordsMatch === false ? 'has-error' : passwordsMatch === true ? 'has-success' : ''}`}>
                  <Lock size={16} className="glass-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="glass-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="glass-action-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Password Strength & Match Feedback */}
            {formData.password && (
              <div className="mb-2">
                <PasswordStrengthFeedback
                  stats={passwordStats}
                  passwordsMatch={passwordsMatch}
                  confirmPasswordEntered={Boolean(formData.confirmPassword)}
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="btn-primary w-full btn-lg mt-2 glass-submit-btn"
            >
              <span>{loading ? 'Creating Explorer Account...' : 'Create Account & Verify'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Account Switch Link */}
          <div className="glass-account-switch">
            <span className="switch-text">Already have an account?</span>
            <Link to="/login" className="switch-link">
              Sign in here
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .signup-backdrop-wrapper {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=85') center/cover no-repeat fixed;
          padding: 2.2rem 1rem;
          overflow: hidden;
        }

        .signup-dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(8, 26, 17, 0.76) 0%, rgba(4, 15, 9, 0.85) 100%);
          backdrop-filter: blur(1px);
        }

        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .orb-top-left {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 70%);
          top: 8%;
          left: 18%;
        }

        .orb-bottom-right {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(217, 119, 6, 0) 70%);
          bottom: 4%;
          right: 18%;
        }

        .signup-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .spacious-glass-card {
          width: 100%;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.9),
            0 25px 60px -12px rgba(5, 20, 12, 0.38),
            0 12px 24px -10px rgba(0, 0, 0, 0.2);
          padding: 2rem 2.2rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .animate-glass-enter {
          animation: glassCardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes glassCardEnter {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
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

        .card-top-tag {
          margin-bottom: 0.75rem;
        }

        .gold-eyebrow-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          font-weight: 800;
          color: #92400e;
          letter-spacing: 0.08em;
          background: rgba(254, 243, 199, 0.8);
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          border: 1px solid rgba(251, 191, 36, 0.45);
        }

        .brand-compass-badge {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(240, 253, 244, 0.85);
          border: 1px solid rgba(187, 247, 208, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.55rem auto;
          box-shadow: 0 4px 10px rgba(27, 67, 50, 0.08);
        }

        .glass-card-title {
          font-size: 1.55rem;
          color: var(--text-heading);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.2rem;
        }

        .glass-card-subtitle {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 0.9rem;
        }

        .google-auth-strip {
          position: relative;
        }

        .google-gsi-wrapper {
          display: none;
        }

        .frosted-google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(218, 220, 224, 0.85);
          color: #3c4043;
          font-size: 0.86rem;
          font-weight: 600;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .frosted-google-btn:hover {
          background: #ffffff;
          border-color: #bcc1c8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .glass-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 0.85rem 0;
          color: #64748b;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .glass-divider::before,
        .glass-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .glass-divider span {
          padding: 0 0.75rem;
        }

        .form-2col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
        }

        .compact-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .compact-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-heading);
          letter-spacing: 0.01em;
        }

        .glass-input-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(203, 213, 225, 0.8);
          border-radius: 10px;
          transition: all 0.2s ease;
          overflow: hidden;
        }

        .glass-input-box:focus-within {
          background: #ffffff;
          border-color: var(--forest-primary);
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.12);
        }

        .glass-input-box.has-error {
          border-color: #ef4444;
          background: #fff5f5;
        }

        .glass-input-box.has-success {
          border-color: #10b981;
        }

        .glass-input-icon {
          position: absolute;
          left: 0.75rem;
          color: #64748b;
          pointer-events: none;
        }

        .glass-input {
          width: 100%;
          padding: 0.58rem 0.75rem 0.58rem 2.3rem;
          font-size: 0.85rem;
          border: none;
          background: transparent;
          color: var(--text-heading);
          outline: none;
          font-family: inherit;
        }

        .glass-input::placeholder {
          color: #94a3b8;
          font-size: 0.82rem;
        }

        .glass-action-icon {
          background: none;
          border: none;
          padding: 0.45rem 0.65rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }

        .glass-action-icon:hover {
          color: var(--forest-primary);
        }

        /* Password Strength Styles */
        .compact-strength-row {
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 10px;
          padding: 0.55rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .strength-progress-col {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .strength-top-flex {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
        }

        .strength-text-label {
          color: #64748b;
          font-weight: 600;
        }

        .strength-level-val {
          font-weight: 800;
          text-transform: uppercase;
        }

        .strength-track-rail {
          height: 4px;
          background: #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .strength-track-fill {
          height: 100%;
          border-radius: 8px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .compact-req-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .req-pill {
          font-size: 0.66rem;
          padding: 0.12rem 0.4rem;
          border-radius: 12px;
          background: rgba(226, 232, 240, 0.6);
          color: #64748b;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .req-pill.active {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid rgba(167, 243, 208, 0.8);
        }

        .match-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          width: fit-content;
        }

        .match-pill-tag.matched {
          background: #ecfdf5;
          color: #047857;
        }

        .match-pill-tag.mismatched {
          background: #fef2f2;
          color: #dc2626;
        }

        .glass-submit-btn {
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.3);
          border-radius: 12px;
          padding: 0.72rem 1.4rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .glass-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
        }

        .glass-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .glass-account-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.1rem;
          padding-top: 0.8rem;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
        }

        .switch-text {
          color: var(--text-secondary);
          font-size: 0.86rem;
        }

        .switch-link {
          color: var(--forest-primary);
          font-weight: 700;
          font-size: 0.86rem;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .switch-link:hover {
          color: var(--forest-dark);
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .spacious-glass-card {
            padding: 1.6rem 1.3rem;
            border-radius: 18px;
          }
          .form-2col-grid {
            grid-template-columns: 1fr;
            gap: 0.6rem;
          }
          .glass-card-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;
