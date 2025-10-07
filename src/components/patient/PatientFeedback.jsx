import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate, Link } from 'react-router-dom';

export default function PatientFeedback() {
  const { currentUser, userData } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    feedbackType: 'general',
    comments: '',
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'patientFeedback'), {
        patientId: formData.anonymous ? null : currentUser.uid,
        patientName: formData.anonymous ? 'Anonymous' : userData?.fullName || currentUser.email,
        rating: parseInt(formData.rating),
        feedbackType: formData.feedbackType,
        comments: formData.comments,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient'), 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Patient Feedback</h2>
          <p style={{ color: '#555', margin: 0 }}>
            We value your opinion and would love to hear about your experience
          </p>
        </div>

        {success && (
          <div style={{ color: '#0a0', marginBottom: '1rem' }}>
            ✅ Thank you for your feedback! Redirecting...
          </div>
        )}

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>
              How would you rate your overall experience?
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="range"
                min="1"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #4a90e2, #34c759)',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                {formData.rating} {formData.rating === '1' ? 'star' : 'stars'}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>Type of Feedback</label>
            <select
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            >
              <option value="general">General Feedback</option>
              <option value="appointment">About an Appointment</option>
              <option value="service">About a Service</option>
              <option value="staff">About Staff</option>
              <option value="suggestion">Suggestion</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontWeight: '600' }}>Your Comments</label>
            <textarea
              name="comments"
              rows="4"
              value={formData.comments}
              onChange={handleChange}
              required
              placeholder="Please share your thoughts..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="checkbox"
              id="anonymous"
              name="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="anonymous">Submit anonymously</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #4a90e2, #34c759)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Submitting...' : <><span style={{ marginRight: '0.5rem' }}>🦷</span> Submit Feedback</>}
            </button>

            
          </div>
        </form>
      </div>
    </div>
  );
}
