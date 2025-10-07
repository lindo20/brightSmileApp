import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function PatientSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signin } = useAuth();

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (currentUser) {
      if (!currentUser.emailVerified) {
        navigate('/verify-email', { replace: true });
      } else {
        navigate('/patient', { replace: true });
      }

    }
     sessionStorage.setItem('originalSignInPage', window.location.pathname);
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);


 


    try {
      // USE AUTH PROVIDER'S SIGNIN AND GET THE RESULT
      const result = await signin(email, password, 'patient');
      
      // Use the user object from the result, not currentUser
      if (!result.user.emailVerified) {
        navigate('/verify-email', { replace: true });
      } else {
        navigate('/patient', { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form patient-signin-bg">
      <h2>Patient Sign In</h2>
      <p className="text-muted mb-4">Welcome back! Sign in to access your dental care dashboard.</p>
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
          {loading ? 'Signing In...' : 'Sign In as Patient'}
        </button>
      </form>
      <div className="mt-3 text-center">
        Don't have a patient account? <Link to="/patient-signup" className="text-primary">Sign Up</Link>
      </div>
      <div className="mt-2 text-center">
        <Link to="/select-role" className="text-secondary">← Back to Role Selection</Link>
      </div>
    </div>
  );
}

