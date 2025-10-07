import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter, FaTooth, FaExclamationTriangle } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'enquiries'), {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'pending',
        read: false
      });
      
      setSubmitted(true);
      setFormData({ 
        name: '', 
        email: '', 
        message: '' 
      });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      
      if (err.code === 'permission-denied') {
        setError(
          <div>
            <FaExclamationTriangle /> Permission denied. This is likely a security rules issue.
            <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Please contact the website administrator or try again later.
            </div>
          </div>
        );
      } else {
        setError(`Failed to submit enquiry: ${err.message}. Please check your connection and try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <FaTooth size={40} color="#2c7da0" style={{ marginBottom: '1rem' }} />
          <h1 style={{ color: '#2d3436', marginBottom: '0.5rem' }}>Contact Bright Smile Dental</h1>
          <p style={{ color: '#636e72', fontSize: '1.2rem' }}>
            Have questions? We're here to help!
          </p>
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          {error && (
            <div style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              border: '1px solid #ef9a9a'
            }}>
              <strong>Error:</strong> {error}
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Having persistent issues? Please call us directly at <strong>(555) 123-4567</strong>
              </div>
            </div>
          )}

          {submitted ? (
            <div style={{ 
              backgroundColor: '#e8f5e9', 
              color: '#2e7d32', 
              padding: '2rem', 
              borderRadius: '8px', 
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#2e7d32' }}>Thank you for your message!</h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We've received your enquiry and will respond within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                style={{
                  padding: '0.8rem 2rem',
                  backgroundColor: '#2c7da0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#1d5d7e';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#2c7da0';
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="name" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#2d3436'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your full name"
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#2d3436'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Your email address"
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="message" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600',
                  color: '#2d3436'
                }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                  placeholder="Please describe your inquiry in detail..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '1rem 2rem',
                  backgroundColor: isSubmitting ? '#ccc' : '#2c7da0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#1d5d7e';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = '#2c7da0';
                  }
                }}
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <span>Send Message</span>
                )}
              </button>
            </form>
          )}
        </div>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#2d3436', marginBottom: '1.5rem', textAlign: 'center' }}>
            Clinic Information
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem'
          }}>
            <div>
              <h3 style={{ color: '#2c7da0', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
                Main Office
              </h3>
              <p style={{ color: '#636e72', marginBottom: '0.5rem' }}>
                123 Dental Avenue<br />
                Smile City, SC 12345
              </p>
              <p style={{ color: '#636e72', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <FaPhone style={{ marginRight: '0.5rem' }} />
                (555) 123-4567
              </p>
              <p style={{ color: '#636e72', display: 'flex', alignItems: 'center' }}>
                <FaEnvelope style={{ marginRight: '0.5rem' }} />
                info@brightsmile.com
              </p>
            </div>
            
            <div>
              <h3 style={{ color: '#2c7da0', marginBottom: '1rem' }}>Emergency Contact</h3>
              <p style={{ color: '#636e72', marginBottom: '1rem' }}>
                <FaPhone style={{ marginRight: '0.5rem' }} />
                (555) 987-6543 (24/7)
              </p>
              
              <h3 style={{ color: '#2c7da0', marginBottom: '1rem' }}>Follow Us</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href="#" style={{ 
                  color: '#2c7da0', 
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#1d5d7e'}
                onMouseOut={(e) => e.target.style.color = '#2c7da0'}>
                  <FaFacebook />
                </a>
                <a href="#" style={{ 
                  color: '#2c7da0', 
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#1d5d7e'}
                onMouseOut={(e) => e.target.style.color = '#2c7da0'}>
                  <FaInstagram />
                </a>
                <a href="#" style={{ 
                  color: '#2c7da0', 
                  fontSize: '1.5rem',
                  transition: 'color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.color = '#1d5d7e'}
                onMouseOut={(e) => e.target.style.color = '#2c7da0'}>
                  <FaTwitter />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              padding: '0.8rem 1.5rem',
              backgroundColor: 'transparent',
              color: '#2c7da0',
              border: '2px solid #2c7da0',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2c7da0';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#2c7da0';
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}