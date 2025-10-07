import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loading } from './Loading'; // Import the loading component

export function PrivateRoute({ children, requireVerification = true, requiredRole }) {
  const { currentUser, isVerified, role, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - currentUser:', currentUser); // Debug log
  console.log('PrivateRoute - loading:', loading); // Debug log

  if (loading) {
    return <Loading />;
  }
  
  if (!currentUser) {
    console.log('Redirecting to signin because no currentUser'); // Debug log
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requireVerification && !isVerified) {
    console.log('Redirecting to verify-email because email not verified'); // Debug log
    return <Navigate to="/verify-email" replace />;
  }

  if (requiredRole) {
    const userRole = role || '';
    const requiredRoles = Array.isArray(requiredRole) 
      ? requiredRole 
      : [requiredRole];
    
    const hasRequiredRole = requiredRoles.some(
      r => r.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!hasRequiredRole) {
      console.log(`Redirecting to unauthorized. User role: ${userRole}, Required: ${requiredRoles.join(', ')}`); // Debug log
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  console.log('Rendering protected content'); // Debug log
  return children;
}