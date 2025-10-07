import { useAuth } from './auth/AuthProvider';
import { Navigate } from 'react-router-dom';

export function Dashboard() {
  const { currentUser, role } = useAuth();

  if (!currentUser) return <Navigate to="/signin" />;

  switch(role) {
    case 'admin':
      return <Navigate to="/admin" />;
    case 'dentist':
      return <Navigate to="/dentist" />;
    default:
      return <Navigate to="/patient" />;
  }
}