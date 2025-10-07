import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { sendEmailVerification } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';

export function VerifyEmail() {
  const { currentUser, isVerified } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email sent. Please check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to sign-in if already verified
  useEffect(() => {
    if (isVerified) {
      navigate('/signin'); // Redirect to sign-in page
    }
  }, [isVerified, navigate]);

  if (isVerified) {
    return null; // Prevents rendering before redirect
  }

  return (
    <div className="auth-form">
      <h2>Verify Your Email</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      <p className="mb-4">
        A verification email has been sent to <strong>{currentUser?.email}</strong>.
        Please verify your email to continue.
      </p>

      <div className="d-grid gap-2">
        <button 
          onClick={handleSendVerification}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
        
        <button 
          onClick={() => navigate('/signin')} // Redirects to sign-in page
          className="btn btn-outline-secondary"
        >
          I've Verified My Email
        </button>
      </div>
    </div>
  );
}