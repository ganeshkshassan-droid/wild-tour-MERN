import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Mail,
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

  // Segmented 6-digit OTP state
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

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

  // Auto-focus first digit input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    // Only accept numbers
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Handle single digit typing
    const char = cleanVal.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasteData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasteData[i] || '';
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpCode = digits.join('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      showToast('Missing email. Please start verification again.', 'error');
      navigate(purpose === 'signup' ? '/signup' : '/forgot-password');
      return;
    }

    if (otpCode.length !== 6) {
      showToast('Please enter all 6 digits of the verification code', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'signup') {
        const res = await verifyEmail(email, otpCode);
        if (res.success) {
          setVerifiedSuccess(true);
          showToast('Email verified successfully! Welcome to Wild Tour.', 'success');
          setTimeout(() => {
            navigate('/safaris');
          }, 1800);
        }
      } else {
        // Password reset flow
        const res = await api.verifyResetOtp({ email, otp: otpCode });
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
        showToast('New 6-digit verification code dispatched to your email!', 'success');
        setCooldown(60);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
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

      <div className="container verify-shell-container">
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
            <div className="verified-success-box animate-fade-in text-center">
              <div className="brand-hero-badge success-badge">
                <CheckCircle2 size={32} className="badge-icon" />
              </div>
              <h2 className="glass-card-title">Email Verified!</h2>
              <p className="glass-card-subtitle">
                Welcome to Wild Tour Karnataka. Your explorer privileges are now active.
              </p>
              <div className="success-redirect-note">
                Navigating to safari expeditions...
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="glass-card-header text-center">
                <div className="brand-hero-badge">
                  <ShieldCheck size={28} className="badge-icon" />
                </div>
                <h1 className="glass-card-title">Enter 6-Digit Code</h1>
                <p className="glass-card-subtitle">
                  We've sent a 6-digit security code to your registered email address.
                </p>
                {email && (
                  <div className="email-recipient-chip">
                    <Mail size={14} className="recipient-icon" />
                    <span className="recipient-text">{email}</span>
                  </div>
                )}
              </div>

              {/* Segmented OTP Input Form */}
              <form onSubmit={handleSubmit} className="glass-auth-form">
                <div className="otp-digit-row-wrapper" onPaste={handlePaste}>
                  <label className="field-label text-center mb-3 block">
                    Type or paste your 6-digit code:
                  </label>
                  <div className="otp-boxes-grid">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`otp-digit-cell ${digit ? 'filled' : ''}`}
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  <div className="otp-expiry-meta">
                    <span>Valid for 10 minutes • Single use</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="glass-submit-btn"
                >
                  <span>{loading ? 'Verifying Code...' : 'Verify & Continue'}</span>
                  {!loading && <ArrowRight size={18} />}
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
                    <span>{resendLoading ? 'Dispatching...' : 'Resend Code'}</span>
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
          padding: 3rem 1.25rem;
          overflow: hidden;
        }

        .verify-dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(8, 26, 17, 0.78) 0%, rgba(4, 15, 9, 0.88) 100%);
          backdrop-filter: blur(2px);
        }

        /* Ambient Lighting Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }

        .orb-top-left {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0) 70%);
          top: 10%;
          left: 20%;
        }

        .orb-bottom-right {
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.28) 0%, rgba(217, 119, 6, 0) 70%);
          bottom: 6%;
          right: 20%;
        }

        .verify-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 1200px;
        }

        /* Luxury Glass Card */
        .compact-glass-card {
          width: 100%;
          max-width: 480px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          box-shadow:
            inset 0 1px 2px rgba(255, 255, 255, 0.95),
            0 24px 64px -12px rgba(0, 0, 0, 0.45),
            0 12px 28px -8px rgba(27, 67, 50, 0.2);
          padding: 2.5rem 2.2rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .animate-glass-enter {
          animation: glassCardEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes glassCardEnter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .card-top-tag {
          margin-bottom: 1.2rem;
        }

        .gold-eyebrow-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 800;
          color: #92400e;
          letter-spacing: 0.08em;
          background: rgba(254, 243, 199, 0.9);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          border: 1px solid rgba(251, 191, 36, 0.55);
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.1);
        }

        /* Hero Badges */
        .brand-hero-badge {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.1rem auto;
          box-shadow: 0 8px 20px rgba(27, 67, 50, 0.28);
          border: 2px solid rgba(255, 255, 255, 0.6);
        }

        .brand-hero-badge.success-badge {
          background: linear-gradient(135deg, #047857 0%, #10b981 100%);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .badge-icon {
          color: #ffffff;
        }

        .glass-card-title {
          font-size: 1.65rem;
          color: #0f291e;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
          line-height: 1.25;
        }

        .glass-card-subtitle {
          font-size: 0.88rem;
          color: #475569;
          line-height: 1.55;
          margin-bottom: 1.1rem;
        }

        .email-recipient-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }

        .recipient-icon {
          color: #059669;
        }

        .recipient-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: #065f46;
          word-break: break-all;
        }

        /* Segmented 6-Digit OTP Grid */
        .otp-digit-row-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.6rem;
        }

        .field-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.02em;
        }

        .otp-boxes-grid {
          display: flex;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin: 0.35rem 0 0.75rem 0;
        }

        .otp-digit-cell {
          width: 48px;
          height: 56px;
          font-size: 1.45rem;
          font-weight: 800;
          font-family: 'Outfit', monospace;
          text-align: center;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          color: #0f291e;
          outline: none;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .otp-digit-cell:focus {
          border-color: #1b4332;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(27, 67, 50, 0.16);
          transform: translateY(-2px);
        }

        .otp-digit-cell.filled {
          border-color: #10b981;
          background: #f0fdf4;
          color: #065f46;
        }

        .otp-expiry-meta {
          font-size: 0.76rem;
          color: #64748b;
          font-weight: 600;
        }

        /* Submit Button */
        .glass-submit-btn {
          width: 100%;
          height: 52px;
          background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.96rem;
          font-weight: 700;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(27, 67, 50, 0.32);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #143527 0%, #245841 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(27, 67, 50, 0.42);
        }

        .glass-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .glass-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Resend Strip */
        .resend-action-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 1.4rem;
          font-size: 0.86rem;
        }

        .resend-text {
          color: #64748b;
          font-weight: 500;
        }

        .cooldown-pill {
          display: inline-block;
          background: #f1f5f9;
          color: #64748b;
          padding: 0.25rem 0.65rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.78rem;
        }

        .resend-active-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: none;
          border: none;
          color: #1b4332;
          font-weight: 700;
          font-size: 0.86rem;
          cursor: pointer;
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .resend-active-btn:hover:not(:disabled) {
          color: #0f291e;
          text-decoration: underline;
        }

        /* Account Switch Footer */
        .glass-account-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1.1rem;
          border-top: 1px solid rgba(203, 213, 225, 0.8);
        }

        .switch-text {
          color: #64748b;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .switch-link {
          color: #1b4332;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .switch-link:hover {
          color: #0f291e;
          text-decoration: underline;
        }

        .verified-success-box {
          padding: 1.5rem 0.5rem;
        }

        .success-redirect-note {
          margin-top: 1.2rem;
          font-size: 0.84rem;
          color: #059669;
          font-weight: 600;
        }

        @media (max-width: 520px) {
          .compact-glass-card {
            padding: 2rem 1.3rem;
            border-radius: 20px;
          }
          .glass-card-title {
            font-size: 1.45rem;
          }
          .otp-boxes-grid {
            gap: 5px;
          }
          .otp-digit-cell {
            width: 40px;
            height: 50px;
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyOTP;
