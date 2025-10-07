import { Link } from 'react-router-dom';

// CAN REMOVE THIS PAGE
export function Unauthorized() {
  return (
    <div className="unauthorized">
      <h1>Unauthorized Access</h1>
      <p>You don't have permission to access this page.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}