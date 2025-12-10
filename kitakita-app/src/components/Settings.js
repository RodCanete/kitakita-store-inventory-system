import React, { useState, useEffect } from 'react';
import '../App.css';

export default function Settings({ token, user }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // In a real app, this would call an API to update the profile
      // For now, we'll just show a success message
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setSaving(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (profileData.newPassword !== profileData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (profileData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // In a real app, this would call an API to change the password
      // For now, we'll just show a success message
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setSaving(false);
      }, 500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      setSaving(false);
    }
  };

  return (
    <div className="settings">
      <h1 className="page-title">Settings</h1>

      {message.text && (
        <div className={message.type === 'success' ? 'form-success' : 'form-error'} role="alert">
          {message.text}
        </div>
      )}

      <div className="settings-container">
        {/* Profile Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Profile Information</h2>
            <p className="settings-section-description">Update your account profile information</p>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="Enter your email"
                value={profileData.email}
                onChange={handleInputChange}
                required
                disabled
              />
              <small className="form-hint">Email cannot be changed</small>
            </div>

            <div className="settings-form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Change Password</h2>
            <p className="settings-section-description">Update your password to keep your account secure</p>
          </div>
          
          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-field">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                placeholder="Enter current password"
                value={profileData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                placeholder="Enter new password"
                value={profileData.newPassword}
                onChange={handleInputChange}
                required
                minLength="6"
              />
              <small className="form-hint">Password must be at least 6 characters long</small>
            </div>

            <div className="form-field">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={profileData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
              />
            </div>

            <div className="settings-form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="settings-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">Account Information</h2>
            <p className="settings-section-description">View your account details</p>
          </div>
          
          <div className="account-info">
            <div className="account-info-item">
              <span className="account-info-label">User ID:</span>
              <span className="account-info-value">#{user?.userId || 'N/A'}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Role:</span>
              <span className="account-info-value">{user?.role || 'ROLE_USER'}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Account Status:</span>
              <span className={`account-info-value ${user?.isActive ? 'status-active' : 'status-inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

