import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { evaluatePasswordStrength, PasswordStrengthFeedback } from '../components/PasswordStrengthMeter';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken || !email) {
      showToast('Missing password reset authorization. Please verify OTP first.', 'error');
      navigate('/forgot-password');
    }
  }, [resetToken, email, navigate, showToast]);

  // Live password strength calculation
  const passwordStats = useMemo(() => {
    return evaluatePasswordStrength(newPassword);
  }, [newPassword]);

  // Real-time password match calculation
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'warning');
      return;
    }

    if (!passwordStats.isAcceptable) {
      showToast('Password must contain at least one letter and one number', 'warning');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email, resetToken, newPassword });
      if (res.success) {
        showToast(res.message || 'Password reset successfully! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (error) {
      showToast(error.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || !newPassword || !confirmPassword || passwordsMatch === false || !passwordStats.isAcceptable;

  return (
    <div className="auth-backdrop-wrapper">
      {/* Scenic Nature Background Overlay */}
      <div className="auth-dark-overlay" />

      {/* Ambient Lighting Orbs */}
      <div className="ambient-orb orb-top-left" />
      <div className="ambient-orb orb-bottom-right" />

      <div className="container auth-shell-container">
        <div className="compact-glass-card animate-glass-enter">
          {/* Top Gold Eyebrow Tag */}
          <div className="card-top-tag text-center">
            <span className="gold-eyebrow-tag">
              <Sparkles size={13} className="text-gold" />
              <span>SECURITY RECOVERY</span>
            </span>
          </div>

          {/* Card Header */}
          <div className="glass-card-header text-center">
            <div className="brand-hero-badge">
              <KeyRound size={26} className="badge-icon" />
            </div>
            <h1 className="glass-card-title">Create New Password</h1>
            <p className="glass-card-subtitle">
              Set a secure new password for <strong className="email-strong-highlight">{email || 'your account'}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-auth-form">
            {/* New Password */}
            <div className="form-field-wrapper">
              <label className="field-label">New Password</label>
              <div className="glass-input-box">
                <Lock size={18} className="glass-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  required
                  minLength="8"
                  placeholder="Enter new password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="glass-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="glass-action-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle new password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-field-wrapper mt-3">
              <label className="field-label">Confirm New Password</label>
              <div className={`glass-input-box ${passwordsMatch === false ? 'has-error' : passwordsMatch === true ? 'has-success' : ''}`}>
                <Lock size={18} className="glass-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="glass-action-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Real-time Password Strength & Match Feedback */}
            {newPassword && (
              <div className="strength-feedback-wrap">
                <PasswordStrengthFeedback
                  stats={passwordStats}
                  passwordsMatch={passwordsMatch}
                  confirmPasswordEntered={Boolean(confirmPassword)}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="glass-submit-btn"
            >
              <span>{loading ? 'Saving New Password...' : 'Save Password & Sign In'}</span>
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Account Switch Footer */}
          <div className="glass-account-switch">
            <span className="switch-text">Remembered your password?</span>
            <Link to="/login" className="switch-link">
              Sign In
            </Link>
          </div>
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
          padding: 3rem 1.25rem;
          overflow: hidden;
        }

        .auth-dark-overlay {
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

        .auth-shell-container {
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
          max-width: 470px;
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
          margin-bottom: 1.6rem;
        }

        .email-strong-highlight {
          color: #1b4332;
          font-weight: 700;
          word-break: break-all;
        }

        .glass-auth-form {
          display: flex;
          flex-direction: column;
        }

        .form-field-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .field-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          letter-spacing: 0.02em;
          text-align: left;
        }

        .glass-input-box {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 52px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .glass-input-box:focus-within {
          border-color: #1b4332;
          box-shadow: 0 0 0 4px rgba(27, 67, 50, 0.14);
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
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .glass-input {
          width: 100%;
          height: 100%;
          padding: 0 16px 0 44px;
          font-size: 0.92rem;
          font-weight: 500;
          border: none;
          background: transparent;
          color: #0f172a;
          outline: none;
          font-family: inherit;
        }

        .glass-input::placeholder {
          color: #94a3b8;
          font-size: 0.88rem;
        }

        .glass-action-icon {
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

        .glass-action-icon:hover {
          color: #1b4332;
        }

        .strength-feedback-wrap {
          margin: 0.85rem 0 1.25rem 0;
        }

        /* Submit Button */
        .glass-submit-btn {
          width: 100%;
          height: 52px;
          margin-top: 1.2rem;
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

        /* Account Switch Link */
        .glass-account-switch {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.6rem;
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

        @media (max-width: 520px) {
          .compact-glass-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          .glass-card-title {
            font-size: 1.45rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
