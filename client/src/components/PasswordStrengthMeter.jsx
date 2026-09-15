import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * Calculates password strength and individual criteria
 */
export const evaluatePasswordStrength = (password = '') => {
  const p = password || '';
  const hasLength = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSpecial = /[^A-Za-z0-9]/.test(p);

  const checks = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const score = checks.filter(Boolean).length;

  let level = 'Weak';
  let color = '#ef4444';
  let width = '25%';

  if (score >= 5) {
    level = 'Strong';
    color = '#10b981';
    width = '100%';
  } else if (score >= 4) {
    level = 'Good';
    color = '#0d9488';
    width = '75%';
  } else if (score >= 2) {
    level = 'Fair';
    color = '#f59e0b';
    width = '50%';
  } else if (p.length > 0) {
    level = 'Weak';
    color = '#ef4444';
    width = '25%';
  } else {
    width = '0%';
  }

  const hasLetter = hasUpper || hasLower;
  const isAcceptable = hasLength && hasLetter && hasNumber;

  return {
    score,
    level,
    color,
    width,
    hasLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    hasLetter,
    isAcceptable,
  };
};

/**
 * Reusable compact Password Strength and Match Meter
 */
export const PasswordStrengthFeedback = ({ stats, passwordsMatch, confirmPasswordEntered }) => {
  if (!stats) return null;

  return (
    <div className="compact-strength-row animate-fade-in">
      <div className="strength-progress-col">
        <div className="strength-top-flex">
          <span className="strength-text-label">Password Strength:</span>
          <span className="strength-level-val" style={{ color: stats.color }}>
            {stats.level}
          </span>
        </div>
        <div className="strength-track-rail">
          <div
            className="strength-track-fill"
            style={{ width: stats.width, backgroundColor: stats.color }}
          />
        </div>
      </div>

      <div className="compact-req-pills">
        <span className={`req-pill ${stats.hasLength ? 'active' : ''}`}>
          {stats.hasLength ? '✓' : '•'} 8+ chars
        </span>
        <span className={`req-pill ${stats.hasUpper ? 'active' : ''}`}>
          {stats.hasUpper ? '✓' : '•'} Upper
        </span>
        <span className={`req-pill ${stats.hasLower ? 'active' : ''}`}>
          {stats.hasLower ? '✓' : '•'} Lower
        </span>
        <span className={`req-pill ${stats.hasNumber ? 'active' : ''}`}>
          {stats.hasNumber ? '✓' : '•'} Number
        </span>
        <span className={`req-pill ${stats.hasSpecial ? 'active' : ''}`}>
          {stats.hasSpecial ? '✓' : '•'} Symbol
        </span>
      </div>

      {confirmPasswordEntered && (
        <div className={`match-pill-tag ${passwordsMatch ? 'matched' : 'mismatched'}`}>
          {passwordsMatch ? (
            <>
              <CheckCircle2 size={13} />
              <span>✓ Passwords match</span>
            </>
          ) : (
            <>
              <XCircle size={13} />
              <span>Passwords do not match</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
