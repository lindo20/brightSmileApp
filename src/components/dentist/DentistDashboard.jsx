import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

export function DentistDashboard() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleCavityDetection = () => {
    navigate('/dentist/caries-detection');
  };

  if (!currentUser) {
    return null; // Prevent rendering until user is loaded
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard container py-4">
        <h1 className="text-center mb-4">Dentist Dashboard</h1>
        
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Dentist Features - Vertical Layout */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h4 mb-4 text-center">Dentist Features</h2>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-primary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate('/dentist/appointments')}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-calendar-check fs-4 me-2"></i>
                    <span>Appointment Scheduling</span>
                  </button>
                  <button
                    className="btn btn-success py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate('/dentist/patients')}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-people-fill fs-4 me-2"></i>
                    <span>Patient Profiles</span>
                  </button>
                  <button
                    className="btn btn-warning py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate('/dentist/charts')}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-bar-chart-fill fs-4 me-2"></i>
                    <span>Dental Analytics</span>
                  </button>
                  <button
                    className="btn btn-primary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={handleCavityDetection}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-robot fs-4 me-2"></i>
                    <span>Cavity Detection AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Support - Vertical Layout */}
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 mb-4 text-center">Support</h2>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-danger py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={handleSignOut}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-box-arrow-right fs-4 me-2"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fix for the tooth icon positioning */}
      <style>{`
        .tooth-icon {
          position: absolute;
          left: 1rem;
          font-size: 1.25rem;
        }
        
        /* Make space for the tooth icon */
        .btn {
          padding-left: 3rem !important;
        }
        
        /* Override any problematic ::before styles */
        .dashboard-wrapper .btn::before {
          display: none !important;
        }
      `}</style>
    </div>
  );
}