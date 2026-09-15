import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Send,
  Home,
  Sparkles
} from 'lucide-react';

const VerifyEmailLink = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'expired' | 'invalid' | 'already_verified'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam || '');
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { setAuthSession } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('No verification token found in link. Please use the link provided in your email.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.verifyEmailToken(token);
        if (res.success) {
          if (res.token && res.user) {
            setAuthSession(res.token, res.user);
          }
          if (res.status === 'already_verified') {
            setStatus('already_verified');
            setMessage('Your email address is already verified!');
          } else {
            setStatus('success');
            setMessage(res.message || 'Email verified successfully! Welcome to Wild Tour Karnataka.');
            try {
              confetti({
                particleCount: 70,
                spread: 60,
                origin: { y: 0.6 },
                colors: ['#1b4332', '#d97706', '#10b981'],
              });
            } catch (e) {}
          }
        }
      } catch (error) {
        if (error.data?.status === 'expired') {
          setStatus('expired');
          setMessage(error.message || 'This verification link has expired (links are valid for 24 hours).');
          if (error.data?.email) setResendEmail(error.data.email);
        } else {
          setStatus('invalid');
          setMessage(error.message || 'This verification link is invalid or has already been used.');
        }
      }
    };

    verifyToken();
  }, [token]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setResending(true);
    try {
      const res = await api.resendVerificationLink(resendEmail);
      if (res.success) {
        showToast(res.message || 'New verification email dispatched!', 'success');
        setResendCooldown(60);
      }
    } catch (error) {
      showToast(error.message || 'Failed to resend verification link', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-hero-wrapper">
      <div className="verify-hero-overlay" />

      {/* Ambient Lighting Orbs */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container verify-content-container section-padding">
        <div className="compact-glass-card animate-glass-enter text-center">
          {/* Top Gold Eyebrow Tag */}
          <div className="card-top-tag text-center">
            <span className="gold-eyebrow-tag">
              <Sparkles size={13} className="text-gold" />
              <span>PERMIT REGISTRATION</span>
            </span>
          </div>

          {/* Brand Logo */}
          <div className="brand-compass-badge">
            <Compass size={26} className="text-forest-primary" />
          </div>

          {/* 1. LOADING / VALIDATING STATE */}
          {status === 'loading' && (
            <div className="state-wrap">
              <div className="status-spinner-box">
                <RefreshCw size={36} className="text-forest-primary animate-spin" />
              </div>
              <h2 className="glass-card-title">Validating Credentials</h2>
              <p className="glass-card-subtitle">
                Confirming your secure verification token with the sanctuary registry...
              </p>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === 'success' && (
            <div className="state-wrap animate-fade-in">
              <div className="status-icon-box success">
                <CheckCircle2 size={36} className="text-emerald" />
              </div>
              <span className="verify-badge success">EMAIL VERIFICATION COMPLETE</span>
              <h2 className="glass-card-title">Account Verified!</h2>
              <p className="glass-card-subtitle">
                Welcome to Wild Tour Karnataka. Your explorer profile is now verified. You have full access to reserve safaris, book luxury stays, and manage permits.
              </p>

              <div className="verify-actions mt-4">
                <button onClick={() => navigate('/safaris')} className="btn-primary w-full btn-lg glass-submit-btn">
                  <span>Explore Safari Permits</span>
                  <ArrowRight size={18} />
                </button>
                <Link to="/my-trips" className="btn-secondary w-full mt-2">
                  <span>View Traveler Dashboard</span>
                </Link>
              </div>
            </div>
          )}

          {/* 3. ALREADY VERIFIED STATE */}
          {status === 'already_verified' && (
            <div className="state-wrap animate-fade-in">
              <div className="status-icon-box info">
                <ShieldCheck size={36} className="text-forest-primary" />
              </div>
              <span className="verify-badge info">ACCOUNT ALREADY ACTIVE</span>
              <h2 className="glass-card-title">Email Already Verified</h2>
              <p className="glass-card-subtitle">
                This explorer account is already verified and ready for sanctuary expeditions.
              </p>

              <div className="verify-actions mt-4">
                <button onClick={() => navigate('/safaris')} className="btn-primary w-full btn-lg glass-submit-btn">
                  <span>Browse Safaris & Stays</span>
                  <ArrowRight size={18} />
                </button>
                <Link to="/" className="btn-secondary w-full mt-2">
                  <Home size={16} />
                  <span>Sanctuary Home</span>
                </Link>
              </div>
            </div>
          )}

          {/* 4. EXPIRED / INVALID STATE */}
          {(status === 'expired' || status === 'invalid') && (
            <div className="state-wrap animate-fade-in">
              <div className="status-icon-box error">
                <AlertTriangle size={36} className="text-amber" />
              </div>
              <span className="verify-badge error">
                {status === 'expired' ? 'LINK EXPIRED' : 'INVALID LINK'}
              </span>
              <h2 className="glass-card-title">
                {status === 'expired' ? 'Link Has Expired' : 'Unable to Verify'}
              </h2>
              <p className="glass-card-subtitle">{message}</p>

              {/* Resend Form */}
              <div className="resend-glass-box mt-3 text-left">
                <h4 className="resend-title">Request Fresh Verification Email</h4>
                <form onSubmit={handleResend} className="glass-auth-form">
                  <div className="glass-input-box mb-2">
                    <Mail size={16} className="glass-input-icon" />
                    <input
                      type="email"
                      required
                      placeholder="Enter registered email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="glass-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending || resendCooldown > 0}
                    className="btn-primary w-full glass-submit-btn"
                  >
                    <Send size={15} />
                    <span>
                      {resending
                        ? 'Dispatching Link...'
                        : resendCooldown > 0
                        ? `Wait ${resendCooldown}s to Resend`
                        : 'Send Fresh Verification Email'}
                    </span>
                  </button>
                </form>
              </div>

              <div className="glass-account-switch mt-3">
                <Link to="/verify-otp" className="switch-link" state={{ email: resendEmail, purpose: 'signup' }}>
                  Have a 6-digit OTP code? Verify with code &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .verify-hero-wrapper {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=85') center/cover no-repeat fixed;
          padding: 2.2rem 1rem;
          overflow: hidden;
        }

        .verify-hero-overlay {
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
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 70%);
          top: 12%;
          left: 25%;
        }

        .orb-bottom-right {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(217, 119, 6, 0) 70%);
          bottom: 8%;
          right: 25%;
        }

        .verify-content-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .compact-glass-card {
          width: 100%;
          max-width: 480px;
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
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 0.75rem;
        }

        .status-spinner-box {
          margin: 1.2rem 0;
        }

        .status-icon-box {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.9rem auto;
        }

        .status-icon-box.success {
          background-color: #ecfdf5;
          border: 2px solid #a7f3d0;
        }

        .status-icon-box.info {
          background-color: var(--forest-subtle);
          border: 2px solid #bbf7d0;
        }

        .status-icon-box.error {
          background-color: #fffbeb;
          border: 2px solid #fde68a;
        }

        .verify-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          margin-bottom: 0.6rem;
        }

        .verify-badge.success {
          background: #ecfdf5;
          color: #047857;
        }

        .verify-badge.info {
          background: var(--forest-subtle);
          color: var(--forest-primary);
        }

        .verify-badge.error {
          background: #fffbeb;
          color: #b45309;
        }

        .resend-glass-box {
          background: rgba(248, 250, 252, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          padding: 1rem;
        }

        .resend-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-heading);
          margin-bottom: 0.5rem;
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

        .switch-link {
          color: var(--forest-primary);
          font-weight: 700;
          font-size: 0.86rem;
          text-decoration: none;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .compact-glass-card {
            padding: 1.6rem 1.3rem;
            border-radius: 18px;
          }
          .glass-card-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailLink;
