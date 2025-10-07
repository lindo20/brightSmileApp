import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function DentistSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signin } = useAuth(); // Get signin from AuthProvider

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dentist', { replace: true }); // CHANGED: to '/dentist'
    }
     sessionStorage.setItem('originalSignInPage', window.location.pathname);
  }, [currentUser, navigate]);

  const from = location.state?.from?.pathname || '/dentist'; // CHANGED: to '/dentist'

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // USE AUTH PROVIDER'S SIGNIN WITH ROLE VALIDATION
    const result = await signin(email, password, 'dentist'); // Get the result
    
    // Use the returned user object for immediate navigation
    if (result.user) {
      navigate('/dentist', { replace: true });
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-form dentist-signin-bg">
      <h2>Dentist Sign In</h2>
      <p className="text-muted mb-4">Welcome back! Sign in to access your dental practice dashboard.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 text-end">
          <Link to="/reset">Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In as Dentist'}
        </button>
      </form>
      <div className="mt-3 text-center">
        Don't have a dentist account? <Link to="/dentist-signup" className="text-primary">Sign Up</Link>
      </div>
      <div className="mt-2 text-center">
        <Link to="/select-role" className="text-secondary">← Back to Role Selection</Link>
      </div>
    </div>
  );
}