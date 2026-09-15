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

      <div className="container auth-shell-container section-padding">
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
            <div className="brand-compass-badge">
              <KeyRound size={24} className="text-forest-primary" />
            </div>
            <h1 className="glass-card-title">Create New Password</h1>
            <p className="glass-card-subtitle">
              Set a secure new password for <strong className="text-forest-dark">{email || 'your account'}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="glass-auth-form">
            {/* New Password */}
            <div className="compact-form-group">
              <label className="compact-label">New Password</label>
              <div className="glass-input-box">
                <Lock size={16} className="glass-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  required
                  minLength="4"
                  placeholder="Enter new password"
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
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="compact-form-group mt-3">
              <label className="compact-label">Confirm New Password</label>
              <div className={`glass-input-box ${passwordsMatch === false ? 'has-error' : passwordsMatch === true ? 'has-success' : ''}`}>
                <Lock size={16} className="glass-input-icon" />
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
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Real-time Password Strength & Match Feedback */}
            {newPassword && (
              <div className="mt-3">
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
              className="btn-primary w-full btn-lg mt-4 glass-submit-btn"
            >
              <span>{loading ? 'Saving New Password...' : 'Save Password & Sign In'}</span>
              <ArrowRight size={18} />
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
          padding: 2.5rem 1rem;
          overflow: hidden;
        }

        .auth-dark-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(8, 26, 17, 0.76) 0%, rgba(4, 15, 9, 0.85) 100%);
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
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 70%);
          top: 10%;
          left: 22%;
        }

        .orb-bottom-right {
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, rgba(217, 119, 6, 0) 70%);
          bottom: 6%;
          right: 22%;
        }

        .auth-shell-container {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Frosted Glass Card */
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
          padding: 2.2rem 2.4rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Card Entrance Animation */
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

        .brand-compass-badge {
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

        .glass-action-icon {
          background: none;
          border: none;
          padding: 0.5rem 0.75rem;
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
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .strength-progress-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .strength-top-flex {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
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
          gap: 0.35rem;
        }

        .req-pill {
          font-size: 0.68rem;
          padding: 0.15rem 0.45rem;
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
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
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

        /* CTA Button */
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

        /* Account Switch Link */
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

export default ResetPassword;
