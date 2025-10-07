import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, sendEmailVerification } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function DentistSignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    secretCode: '', 
    specialization: 'general'
  });
  
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showFormatHint, setShowFormatHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    
    // Check if user starts with 0 to show format hint
    if (value.startsWith('0') && !value.startsWith('+27')) {
      setShowFormatHint(true);
    } else {
      setShowFormatHint(false);
    }
    
    // Remove any non-digit and plus characters first
    let cleanedValue = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +27
    if (!cleanedValue.startsWith('+27')) {
      cleanedValue = '+27' + cleanedValue.replace(/^\+?/, '');
    }
    
    // Limit to 12 characters total
    if (cleanedValue.length > 12) {
      setPhoneError('Phone number cannot exceed 12 digits');
      cleanedValue = cleanedValue.slice(0, 12);
    } else {
      setPhoneError('');
    }
    
    setFormData(prev => ({ ...prev, phone: cleanedValue }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      handlePhoneChange(e);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    
    if (formData.secretCode !== "DENT2024") { 
      setError('Invalid registration code');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Phone number validation with regex
    const phoneRegex = /^\+27\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 12 digits starting with +27 followed by 9 digits');
      return;
    }

    // Additional check for exact length
    if (formData.phone.length !== 12) {
      setError('Phone number must be exactly 12 digits');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      await sendEmailVerification(userCredential.user);
      const currentDate = new Date();

      const dentistData = {
        uid: userCredential.user.uid,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        role: 'dentist',
        emailVerified: false,
        createdAt: currentDate,
        lastLogin: currentDate
      };

      // Store in multiple collections
      const batchWrites = [
        setDoc(doc(db, "dentists", userCredential.user.uid), dentistData),
        setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: formData.email,
          role: 'dentist',
          createdAt: currentDate
        }),
        setDoc(doc(db, "dentist_schedules", userCredential.user.uid), {
          uid: userCredential.user.uid,
          workingHours: [],
          appointments: [],
          createdAt: currentDate
        }),
        setDoc(doc(db, "dentist_profiles", userCredential.user.uid), {
          uid: userCredential.user.uid,
          fullName: formData.fullName,
          specialization: formData.specialization,
          contactInfo: {
            phone: formData.phone,
            email: formData.email
          },
          createdAt: currentDate
        })
      ];

      await Promise.all(batchWrites);
      navigate('/verify-email');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form dentist-form">
      <h2>Dentist Registration</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Dr. John Smith"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength="6"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength="6"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="\+27\d{9}"
            title="Phone number must be exactly 12 digits starting with +27 followed by 9 digits (e.g., +27123456789)"
            required
            placeholder="+27123456789"
            maxLength="12"
          />
          {phoneError && <div className="text-danger small mt-1">{phoneError}</div>}
          {showFormatHint && (
            <div className="form-text text-info">
              Format: +27 followed by 9 digits (e.g., +27123456789)
            </div>
          )}
        </div>

        {/* Replaced licenseNumber with secretCode */}
        <div className="mb-3">
          <label htmlFor="secretCode" className="form-label">Registration Code</label>
          <input
            type="password" // Using password type to hide the code
            className="form-control"
            id="secretCode"
            name="secretCode"
            value={formData.secretCode}
            onChange={handleChange}
            required
            placeholder="Enter the registration code provided"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="specialization" className="form-label">Specialization</label>
          <select
            className="form-select"
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            required
          >
            <option value="general">General Dentistry</option>
            <option value="orthodontics">Orthodontics</option>
            <option value="pediatric">Pediatric Dentistry</option>
            <option value="periodontics">Periodontics</option>
            <option value="oral_surgery">Oral Surgery</option>
            <option value="cosmetic">Cosmetic Dentistry</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register as Dentist'}
        </button>
      </form>

      <div className="mt-3 text-center">
        Already have an account? <Link to="/dentist-signin" className="text-primary">Sign In</Link>
      </div>
      <div className="mt-2 text-center">
        <Link to="/" className="btn btn-outline-secondary">
          ← Back to Welcome
        </Link>
      </div>
      
      <div className="mt-3 text-center">
        <hr className="my-3" />
        <p className="text-muted mb-2">Need a different account type?</p>
        <Link to="/admin-signup" className="btn btn-link text-primary">
          Sign up as Administrator
        </Link>
      </div>
    </div>
  );
}