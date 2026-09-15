import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowRight,
  RefreshCw,
  MailCheck,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const purpose = location.state?.purpose || 'signup'; // 'signup' or 'password-reset'

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Missing email. Please start verification again.', 'error');
      navigate(purpose === 'signup' ? '/signup' : '/forgot-password');
      return;
    }

    if (otp.length !== 6) {
      showToast('Please enter the complete 6-digit verification code', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'signup') {
        const res = await verifyEmail(email, otp);
        if (res.success) {
          setVerifiedSuccess(true);
          showToast('Email verified successfully! Welcome to Wild Tour.', 'success');
          setTimeout(() => {
            navigate('/safaris');
          }, 1800);
        }
      } else {
        // Password reset flow
        const res = await api.verifyResetOtp({ email, otp });
        if (res.success && res.resetToken) {
          showToast(res.message || 'OTP verified! You may now set a new password.', 'success');
          navigate('/reset-password', {
            state: { email, resetToken: res.resetToken },
          });
        }
      }
    } catch (error) {
      showToast(error.message || 'Verification failed. Please check the code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    try {
      const res = await api.resendOtp(email, purpose);
      if (res.success) {
        showToast('New 6-digit verification code dispatched!', 'success');
        setCooldown(60);
      }
    } catch (error) {
      showToast(error.message || 'Failed to resend code', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-backdrop-wrapper">
      <div className="verify-dark-overlay" />

      {/* Ambient Lighting Orbs */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container verify-shell-container section-padding">
        <div className="compact-glass-card animate-glass-enter">
          {/* Top Gold Eyebrow Tag */}
          <div className="card-top-tag text-center">
            <span className="gold-eyebrow-tag">
              <Sparkles size={13} className="text-gold" />
              <span>SECURITY VERIFICATION</span>
            </span>
          </div>

          {/* Success Animation Screen */}
          {verifiedSuccess ? (
            <div className="verified-success-box animate-fade-in text-center py-3">
              <div className="success-icon-badge">
                <CheckCircle2 size={38} className="text-forest-primary" />
              </div>
              <h2 className="success-title">Email verified successfully!</h2>
              <p className="success-subtitle">Welcome to Wild Tour Karnataka.</p>
              <div className="success-redirect-note">
                Activating your explorer privileges and navigating...
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="glass-card-header text-center">
                <div className="brand-shield-badge">
                  <MailCheck size={26} className="text-forest-primary" />
                </div>
                <h1 className="glass-card-title">Check your email</h1>
                <p className="glass-card-subtitle">
                  We sent a verification link and 6-digit code to your registered email address.
                </p>
                {email && (
                  <div className="email-highlight-chip">
                    <span>{email}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="glass-auth-form mt-3">
                <div className="otp-input-group text-center">
                  <label className="compact-label mb-2 block">Enter 6-Digit Verification Code</label>
                  <div className="otp-digit-wrapper">
                    <input
                      type="text"
                      maxLength="6"
                      required
                      autoFocus
                      pattern="[0-9]{6}"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="otp-code-input"
                    />
                  </div>
                  <span className="otp-helper-note">
                    Valid for 10 minutes • Single use
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary w-full btn-lg mt-3 glass-submit-btn"
                >
                  <span>{loading ? 'Verifying Code...' : 'Verify & Continue'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Resend Cooldown Section */}
              <div className="resend-action-strip">
                <span className="resend-text">Didn't receive the email?</span>
                {cooldown > 0 ? (
                  <span className="cooldown-pill">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="resend-active-btn"
                  >
                    <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                    <span>{resendLoading ? 'Dispatching...' : 'Resend Email'}</span>
                  </button>
                )}
              </div>

              {/* Sign In Alternative */}
              <div className="glass-account-switch">
                <span className="switch-text">Already have an account?</span>
                <Link to="/login" className="switch-link">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .verify-backdrop-wrapper {
          position: relative;
          min-height: calc(100vh - 72px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2200&q=85') center/cover no-repeat fixed;
          padding: 2.2rem 1rem;
          overflow: hidden;
        }

        .verify-dark-overlay {
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

        .verify-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .compact-glass-card {
          width: 100%;
          max-width: 470px;
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

        .brand-shield-badge {
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

        .email-highlight-chip {
          display: inline-block;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.2rem 0.75rem;
          border-radius: 20px;
        }

        .otp-digit-wrapper {
          display: flex;
          justify-content: center;
          margin: 0.4rem 0;
        }

        .otp-code-input {
          width: 220px;
          height: 50px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.45rem;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          color: var(--forest-primary);
          outline: none;
          transition: all 0.2s ease;
        }

        .otp-code-input:focus {
          border-color: var(--forest-primary);
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.15);
          background: #ffffff;
        }

        .otp-helper-note {
          display: block;
          font-size: 0.72rem;
          color: #64748b;
          margin-top: 0.35rem;
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

        .resend-action-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 1.1rem;
          font-size: 0.82rem;
        }

        .resend-text {
          color: var(--text-secondary);
        }

        .cooldown-pill {
          background: #f1f5f9;
          color: #64748b;
          padding: 0.15rem 0.55rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .resend-active-btn {
          background: none;
          border: none;
          color: var(--forest-primary);
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.82rem;
          transition: color 0.15s ease;
        }

        .resend-active-btn:hover {
          color: var(--forest-dark);
          text-decoration: underline;
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
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .success-icon-badge {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ecfdf5;
          border: 2px solid #a7f3d0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
        }

        .success-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-heading);
          margin-bottom: 0.25rem;
        }

        .success-subtitle {
          font-size: 0.95rem;
          color: #047857;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .success-redirect-note {
          font-size: 0.8rem;
          color: #64748b;
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

export default VerifyOTP;
