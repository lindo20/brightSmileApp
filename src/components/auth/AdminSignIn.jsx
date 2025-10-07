import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, signin } = useAuth(); // Get signin from AuthProvider

  React.useEffect(() => {
    if (currentUser) {
      navigate('/admin', { replace: true }); // CHANGED: to '/admin'
    }
     sessionStorage.setItem('originalSignInPage', window.location.pathname);
  }, [currentUser, navigate]);

  const from = location.state?.from?.pathname || '/admin'; // CHANGED: to '/admin'

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // Get the result from signin
    const result = await signin(email, password, 'admin');
    
    // Use the returned user object for navigation
    if (result && result.user) {
      navigate('/admin', { replace: true });
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-form admin-signin-bg">
      <h2>Administrator Sign In</h2>
      <p className="text-muted mb-4">Secure admin access for authorized administrators.</p>
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
          {loading ? 'Signing In...' : 'Sign In as Administrator'}
        </button>
      </form>
      <div className="mt-3 text-center">
        Don't have an admin account? <Link to="/admin-signup" className="text-primary">Sign Up</Link>
      </div>
      <div className="mt-2 text-center">
        <Link to="/select-role" className="text-secondary">← Back to Role Selection</Link>
      </div>
    </div>
  );
}