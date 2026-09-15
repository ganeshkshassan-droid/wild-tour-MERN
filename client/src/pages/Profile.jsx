import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  User,
  Phone,
  MapPin,
  Lock,
  Camera,
  ShieldCheck,
  Save,
  Ticket,
  Sparkles
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, changePassword } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.user) {
        updateUser({ ...user, ...res.user });
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('New password must be at least 8 characters long', 'warning');
      return;
    }
    const hasLetter = /[A-Za-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    if (!hasLetter || !hasNumber) {
      showToast('New password must contain at least one letter and one number', 'warning');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordLoading(false);
    if (res.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page container section-padding">
      <div className="section-header text-left mb-5">
        <span className="section-eyebrow">
          <User size={16} />
          <span>ACCOUNT & TRAVEL PROFILE</span>
        </span>
        <h1 className="section-title">Traveler Account Settings</h1>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Avatar & Account Badge */}
        <div className="profile-sidebar-col">
          <div className="white-card profile-user-card text-center">
            <div className="avatar-wrapper mb-3">
              <img
                src={formData.avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={user.name}
                className="profile-large-avatar"
              />
            </div>
            <h3 className="profile-user-name">{user.name}</h3>
            <p className="profile-user-email">{user.email}</p>

            <div className="role-pill-row mt-3 mb-4">
              <span className={`badge ${user.role === 'admin' ? 'badge-gold' : 'badge-forest'}`}>
                {user.role === 'admin' ? 'CHIEF WARDEN (ADMIN)' : 'VERIFIED EXPLORER'}
              </span>
            </div>

            <div className="profile-stats-grid">
              <div className="p-stat-box">
                <Ticket size={20} className="text-forest-primary" />
                <span className="p-stat-num">Level 2</span>
                <span className="p-stat-lbl">Explorer</span>
              </div>
              <div className="p-stat-box">
                <Sparkles size={20} className="text-gold-primary" />
                <span className="p-stat-num">500</span>
                <span className="p-stat-lbl">Eco Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit & Change Password */}
        <div className="profile-main-col">
          {/* 1. Personal Information */}
          <div className="white-card profile-section-card mb-4">
            <h3 className="card-title mb-3">Personal Information</h3>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrap">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleProfileChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrap">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleProfileChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Home Location</label>
                  <div className="input-wrap">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      name="address"
                      placeholder="Bangalore, KA"
                      value={formData.address}
                      onChange={handleProfileChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar Image URL</label>
                  <div className="input-wrap">
                    <Camera size={18} className="input-icon" />
                    <input
                      type="url"
                      name="avatar"
                      placeholder="https://..."
                      value={formData.avatar}
                      onChange={handleProfileChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="btn-primary"
                >
                  <Save size={16} />
                  <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Security & Change Password */}
          <div className="white-card profile-section-card">
            <h3 className="card-title mb-3">Security & Password</h3>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    name="currentPassword"
                    required
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="modern-input with-icon"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength="4"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength="4"
                      placeholder="Re-enter new password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="modern-input with-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-gold"
                >
                  <ShieldCheck size={16} />
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .profile-layout-grid {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 2.5rem;
        }
        .profile-user-card {
          padding: 2.5rem 1.8rem;
        }
        .avatar-wrapper {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          border: 3px solid var(--forest-primary);
          margin: 0 auto;
          overflow: hidden;
        }
        .profile-large-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-user-name {
          font-size: 1.4rem;
          color: var(--text-heading);
          margin-bottom: 0.2rem;
        }
        .profile-user-email {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .profile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.8rem;
          padding: 1.2rem;
          background-color: var(--bg-surface-subtle);
          border-radius: var(--radius-md);
        }
        .p-stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .p-stat-num {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-heading);
          font-family: var(--font-heading);
        }
        .p-stat-lbl {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .profile-section-card {
          padding: 2.2rem;
        }

        @media (max-width: 900px) {
          .profile-layout-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Profile;
