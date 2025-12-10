import React, { useState } from 'react';
import '../App.css';

export default function Settings({ user, token, onDeleteAccount }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!token || !user) return;
    
    setDeleting(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBase}/api/users/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok || response.status === 204) {
        // Call the parent handler to handle logout and cleanup
        if (onDeleteAccount) {
          onDeleteAccount();
        }
      } else {
        console.error('Failed to delete account');
        alert('Failed to delete account. Please try again.');
        setDeleting(false);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting your account. Please try again.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="settings-simple">
      <h1 className="page-title">Settings</h1>
      
      <div className="settings-simple-container">
        <div className="settings-simple-section">
          <h2 className="settings-simple-title">Account Details</h2>
          
          <div className="settings-simple-list">
            <div className="settings-simple-item">
              <div className="settings-simple-label">Full Name</div>
              <div className="settings-simple-value">{user?.fullName || 'N/A'}</div>
            </div>
            
            <div className="settings-simple-item">
              <div className="settings-simple-label">Email</div>
              <div className="settings-simple-value">{user?.email || 'N/A'}</div>
            </div>
            
            <div className="settings-simple-item">
              <div className="settings-simple-label">User ID</div>
              <div className="settings-simple-value">#{user?.userId || 'N/A'}</div>
            </div>
            
            <div className="settings-simple-item">
              <div className="settings-simple-label">Role</div>
              <div className="settings-simple-value">{user?.role || 'ROLE_USER'}</div>
            </div>
            
            <div className="settings-simple-item">
              <div className="settings-simple-label">Status</div>
              <div className="settings-simple-value status-active">
                Active
              </div>
            </div>
          </div>

          <div className="settings-simple-actions">
            <button 
              className="btn-delete-account" 
              onClick={handleDeleteClick}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">⚠️</div>
              <h3 className="delete-modal-title">Delete Account</h3>
              <p className="delete-modal-message">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
            </div>
            
            <div className="delete-modal-actions">
              <button 
                type="button" 
                className="btn-cancel-delete" 
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-confirm-delete" 
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

