import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Inbox
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your registered email address', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      if (res.success) {
        setSubmittedSuccess(true);
        showToast(res.message || 'Verification instructions sent to your email.', 'success');
      }
    } catch (error) {
      // Safe error handling without revealing internal database details
      showToast(error.message || 'Unable to process request. Please verify email and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToOtp = () => {
    navigate('/verify-otp', {
      state: { email: email.toLowerCase().trim(), purpose: 'password-reset' },
    });
  };

  return (
    <div className="auth-backdrop-wrapper">
      {/* Scenic Nature Background Overlay */}
      <div className="auth-dark-overlay" />

      {/* Ambient Lighting Orbs */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container auth-shell-container section-padding">
        <div className="compact-glass-card animate-glass-enter">
          {/* Top Gold Eyebrow Tag */}
          <div className="card-top-tag text-center">
            <span className="gold-eyebrow-tag">
              <Sparkles size={13} className="text-gold" />
              <span>ACCOUNT SECURITY</span>
            </span>
          </div>

          {submittedSuccess ? (
            /* Success State */
            <div className="success-glass-content text-center animate-fade-in">
              <div className="success-icon-badge">
                <Inbox size={32} className="text-forest-primary" />
              </div>
              <h1 className="glass-card-title">Check your inbox</h1>
              <p className="glass-card-subtitle">
                If an account exists for <strong className="text-forest-dark">{email}</strong>, you will receive a secure 6-digit verification code.
              </p>

              <div className="success-action-group mt-4">
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="btn-primary w-full btn-lg glass-submit-btn"
                >
                  <span>Enter 6-Digit OTP Code</span>
                  <ArrowRight size={18} />
                </button>

                <Link to="/login" className="back-signin-btn mt-3">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Default / Form State */
            <>
              <div className="glass-card-header text-center">
                <div className="brand-compass-badge">
                  <KeyRound size={24} className="text-forest-primary" />
                </div>
                <h1 className="glass-card-title">Forgot your password?</h1>
                <p className="glass-card-subtitle">
                  No worries. Enter your registered email and we'll send you a secure verification code to reset it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="glass-auth-form">
                <div className="compact-form-group">
                  <label className="compact-label">Email Address</label>
                  <div className="glass-input-box">
                    <Mail size={16} className="glass-input-icon" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="explorer@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full btn-lg mt-4 glass-submit-btn"
                >
                  <span>{loading ? 'Dispatching Instructions...' : 'Send Reset Code'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Account Switch Footer */}
              <div className="glass-account-switch">
                <span className="switch-text">Remember your password?</span>
                <Link to="/login" className="switch-link">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-backdrop-wrapper {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=85') center/cover no-repeat fixed;
          padding: 2.5rem 1rem;
          overflow: hidden;
        }

        .auth-dark-overlay {
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

        .auth-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .compact-glass-card {
          width: 100%;
          max-width: 450px;
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 24px;
          box-shadow:
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.9),
            0 25px 60px -12px rgba(5, 20, 12, 0.38),
            0 12px 24px -10px rgba(0, 0, 0, 0.2);
          padding: 2.2rem 2.4rem;
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
          margin-bottom: 0.85rem;
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

        .brand-compass-badge,
        .success-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(240, 253, 244, 0.85);
          border: 1px solid rgba(187, 247, 208, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.6rem auto;
          box-shadow: 0 4px 10px rgba(27, 67, 50, 0.08);
        }

        .glass-card-title {
          font-size: 1.55rem;
          color: var(--text-heading);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .glass-card-subtitle {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin-bottom: 1.2rem;
        }

        .glass-auth-form {
          display: flex;
          flex-direction: column;
        }

        .compact-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
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

        .glass-input-icon {
          position: absolute;
          left: 0.75rem;
          color: #64748b;
          pointer-events: none;
        }

        .glass-input {
          width: 100%;
          padding: 0.65rem 0.75rem 0.65rem 2.3rem;
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

        .glass-submit-btn {
          box-shadow: 0 4px 14px rgba(27, 67, 50, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1.4rem;
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

        .back-signin-btn {
          display: block;
          color: var(--forest-primary);
          font-size: 0.86rem;
          font-weight: 700;
          text-decoration: none;
          padding: 0.5rem;
          transition: color 0.15s ease;
        }

        .back-signin-btn:hover {
          color: var(--forest-dark);
          text-decoration: underline;
        }

        .glass-account-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.3rem;
          padding-top: 0.9rem;
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
          .compact-glass-card {
            padding: 1.8rem 1.4rem;
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

export default ForgotPassword;
