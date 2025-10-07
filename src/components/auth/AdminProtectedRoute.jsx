import React from 'react';
import { useAuth } from './AuthProvider';
import { Navigate } from 'react-router-dom';
// IP validation removed - admin access now allowed for all users

export function AdminProtectedRoute({ children }) {
  const { currentUser, userData, loading } = useAuth();
  // IP validation removed - admin access now allowed for all users

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has admin role
  if (userData?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render admin content - no IP restrictions
  return children;
}