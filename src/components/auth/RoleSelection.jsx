import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Add this import
import { useEffect } from 'react'; // Add this import

export default function RoleSelection() {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth(); // Add this

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser && role) {
      switch (role) {
        case 'patient':
          navigate('/patient', { replace: true });
          break;
        case 'dentist':
          navigate('/dentist', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        default:
          // Unknown role, stay on role selection
          break;
      }
    }
  }, [currentUser, role, navigate]);

  return (
    <div className="role-selection-container">
      <div className="role-selection-content">
        <h1 className="role-selection-title">Select Your Role</h1>
        <p className="role-selection-subtitle">Choose how you'll be using SmileHigh</p>
        
        <div className="role-cards">
          <div className="role-card" onClick={() => navigate('/patient-signin')}>
            <div className="role-icon">👨‍⚕️</div>
            <h3>Patient</h3>
            <p>I'm looking for dental care</p>
          </div>
          
          <div className="role-card" onClick={() => navigate('/dentist-signin')}>
            <div className="role-icon">🦷</div>
            <h3>Dentist</h3>
            <p>I provide dental services</p>
          </div>

          <div className="role-card" onClick={() => navigate('/admin-signin')}>
            <div className="role-icon">👔</div>
            <h3>Administrator</h3>
            <p>I manage the clinic</p>
          </div>
        </div>

        <div className="role-selection-footer">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/welcome')}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}