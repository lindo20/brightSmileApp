import { useAuth } from "../auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard container py-4">
        <h1 className="text-center mb-4">Admin Dashboard</h1>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h4 mb-4 text-center">Admin Features</h2>
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-primary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/chat")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-chat-dots fs-4 me-2"></i>
                    <span>Chat with Patients</span>
                  </button>
                  <button
                    className="btn btn-info py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/appointments")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-calendar-check fs-4 me-2"></i>
                    <span>Appointment Management</span>
                  </button>
                  <button
                    className="btn btn-warning py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/enquiries")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-question-circle fs-4 me-2"></i>
                    <span>View Patient Enquiries</span>
                  </button>
                  <button
                    className="btn btn-success py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/feedback")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-star-fill fs-4 me-2"></i>
                    <span>View Patient Feedback</span>
                  </button>
                  <button
                    className="btn btn-secondary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/reports")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-graph-up fs-4 me-2"></i>
                    <span>Reports & Analytics</span>
                  </button>
                  <button
                    className="btn btn-dark py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/announcements")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-megaphone fs-4 me-2"></i>
                    <span>Manage Announcements</span>
                  </button>
                  {/* Manage All Users Button - Redirects to user deactivation page */}
                  <button
                    className="btn btn-outline-primary py-3 d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/admin/manage-users")}
                  >
                    <span className="tooth-icon">🦷</span>
                    <i className="bi bi-people-fill fs-4 me-2"></i>
                    <span>Manage All Users</span>
                  </button>
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