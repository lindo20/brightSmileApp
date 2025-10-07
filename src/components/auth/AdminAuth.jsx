import React from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminAuth() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-container admin-portal-bg">
      <div className="role-selection-content">
        <div className="role-icon">👔</div>
        <h1 className="role-selection-title">Administrator Portal</h1>
        <p className="role-selection-subtitle">Secure admin access for authorized administrators</p>
        
        <div className="auth-options">
          <div className="auth-card" onClick={() => navigate('/admin-signin')}>
            <div className="auth-icon">🔑</div>
            <h3>Sign In</h3>
            <p>Already have an admin account?</p>
          </div>
          
          <div className="auth-card" onClick={() => navigate('/admin-signup')}>
            <div className="auth-icon">📝</div>
            <h3>Sign Up</h3>
            <p>Create a new admin account</p>
          </div>
        </div>

        <div className="role-selection-footer">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/select-role')}
          >
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}