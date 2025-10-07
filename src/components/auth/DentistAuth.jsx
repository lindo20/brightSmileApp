import React from 'react';
import { useNavigate } from 'react-router-dom';

export function DentistAuth() {
  const navigate = useNavigate();

  return (
    <div className="role-selection-container dentist-portal-bg">
      <div className="role-selection-content">
        <div className="role-icon">🦷</div>
        <h1 className="role-selection-title">Dentist Portal</h1>
        <p className="role-selection-subtitle">Access your dental practice dashboard</p>
        
        <div className="auth-options">
          <div className="auth-card" onClick={() => navigate('/dentist-signin')}>
            <div className="auth-icon">🔑</div>
            <h3>Sign In</h3>
            <p>Already have a dentist account?</p>
          </div>
          
          <div className="auth-card" onClick={() => navigate('/dentist-signup')}>
            <div className="auth-icon">📝</div>
            <h3>Sign Up</h3>
            <p>Create a new dentist account</p>
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