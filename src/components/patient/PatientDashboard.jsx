import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function PatientDashboard() {
  const { currentUser, logout, deactivateAccount } = useAuth(); // Get deactivateAccount from AuthProvider
  const navigate = useNavigate();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('PatientDashboard - Calling logout function');
      await logout(); // Use AuthProvider's logout instead of direct Firebase signOut
      // The redirect to /patient-signin is now handled in AuthProvider
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      console.log('PatientDashboard - Calling deactivateAccount function');
      await deactivateAccount();
      // The redirect and cleanup is handled in AuthProvider
    } catch (error) {
      console.error('Deactivate account error:', error);
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const openDeactivateModal = () => {
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    setShowDeactivateModal(false);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard container py-4">
        <h1 className="text-center mb-4">Patient Dashboard</h1>

        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            {/* Quick Actions - Vertical Layout */}
            <div className="card shadow-sm mb-4">
              <div className="card-body p-3 p-md-4">
                <h2 className="h4 mb-4 text-center">Quick Actions</h2>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-primary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/patient/profile")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>My Profile</span>
                  </button>
                  
                  <button
                    className="btn btn-success py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/book-appointment")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>Book Appointment</span>
                  </button>
                  <button
                    className="btn btn-info py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/appointment-info")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>Appointment Info</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Support - Vertical Layout */}
            <div className="card shadow-sm">
              <div className="card-body p-3 p-md-4">
                <h2 className="h4 mb-4 text-center">Support</h2>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-warning py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/patient/chat")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>Chat with Admin</span>
                  </button>
                  <button
                    className="btn btn-warning py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/patient/chatBot")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>AI Dental Assistant</span>
                  </button>
                  <button
                    className="btn btn-secondary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/patient/feedback")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>Give Feedback</span>
                  </button>
                  {/* Deactivate Account Button */}
                  <button
                    className="btn btn-outline-danger py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={openDeactivateModal}
                  >
                    <span className="tooth-icon">⚠️</span>
                    <span>Deactivate Account</span>
                  </button>
                  <button
                    className="btn btn-danger py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={handleSignOut}
                  >
                    <span className="tooth-icon">🦷</span>
                    <span>Logout</span>
                  </button>
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Account Confirmation Modal */}
      {showDeactivateModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Deactivate Account</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeDeactivateModal}
                  disabled={isDeactivating}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  <strong>Are you sure you want to deactivate your account?</strong>
                </p>
                <p className="text-muted mb-0">
                  This action will permanently delete your account and all associated data. 
                  This cannot be undone. You will be logged out immediately.
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeDeactivateModal}
                  disabled={isDeactivating}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeactivateAccount}
                  disabled={isDeactivating}
                >
                  {isDeactivating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deactivating...
                    </>
                  ) : (
                    "Yes, Deactivate Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Fix for the tooth icon positioning */}
      <style>{`
        .tooth-icon {
          margin-right: 0.75rem;
          font-size: 1.25rem;
        }
        
        /* Override the problematic ::before styles */
        .dashboard-wrapper .btn::before {
          display: none !important;
        }

        /* Modal backdrop styling */
        .modal-backdrop {
          background-color: rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}